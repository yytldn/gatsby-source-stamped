const {authCheck} = require("./stamped/check");
const {getReviews} = require("./stamped/reviews");
const {getProductRatingsSummary} = require("./stamped/ratings");

const CACHE_KEY_LAST_FETCHED = "lastFetched";
const CACHE_KEY_CACHED_REVIEWS = "cachedReviews";
const CACHE_KEY_PRODUCTS = "products"

exports.onPreInit = (_, pluginOptions) => {
  console.info(`Loaded gatsby-source-stamped plugin`);
}

exports.pluginOptionsSchema = ({Joi}) => {
  return Joi.object().keys({
    publicKey: Joi.string().required().description(`Public key`),
    privateKey: Joi.string().required().description(`Private key`),
    storeHash: Joi.string().required().description(`Store hash`),
    disableCache: Joi.boolean().description(`Disable plugin cache`)
  });
}

const validateStampedAccess = async (pluginOptions) => {
  try {
    await authCheck(pluginOptions.publicKey, pluginOptions.privateKey);
  } catch (err) {
    throw new Error(
      `Cannot access Stamped with the provided keys. Double check that they are correct and try again!`
    )
  }
};

const getCacheData = async (isCacheEnabled, cache, key) => {
  if (isCacheEnabled !== true) {
    return null;
  }

  return await cache.get(key);
}

const setCacheData = async (isCacheEnabled, cache, key, value) => {
  if (isCacheEnabled !== true) {
    return;
  }

  return await cache.set(key, value);
}

const NODE_TYPE_REVIEW = `StampedReview`
const NODE_TYPE_RATING_SUMMARY = `StampedRatingSummary`

exports.sourceNodes = async (
  {cache, actions: {createNode, touchNode}, createContentDigest, createNodeId, getNode},
  pluginOptions
) => {
  await validateStampedAccess(pluginOptions);

  const {publicKey, privateKey, storeHash, disableCache} = pluginOptions;

  const isCacheEnabled = disableCache !== true;

  const lastFetched = await getCacheData(isCacheEnabled, cache, CACHE_KEY_LAST_FETCHED);
  const cachedReviews = await getCacheData(isCacheEnabled, cache, CACHE_KEY_CACHED_REVIEWS);
  const products = await getCacheData(isCacheEnabled, cache, CACHE_KEY_PRODUCTS);

  const reviews = await getReviews(publicKey, privateKey, storeHash, lastFetched);

  let newLastFetched = (lastFetched && typeof lastFetched !== "undefined") ? lastFetched : null;
  let productIds = (products && typeof products !== "undefined") ? products : [];

  let cachedReviewIds = (cachedReviews && typeof cachedReviews !== "undefined") ? cachedReviews : [];

  let createdIds = [];

  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];

    const reviewData = review.review;
    const productId = reviewData.productId;
    const dateCreated = reviewData.dateCreated;

    if (!newLastFetched || dateCreated > newLastFetched) {
      newLastFetched = dateCreated;
    }

    if (productId && !productIds.includes(productId)) {
      productIds.push(productId);
    }

    const nodeId = createNodeId(`${NODE_TYPE_REVIEW}-${reviewData.id}`);

    createNode({
      ...review,
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: NODE_TYPE_REVIEW,
        contentDigest: createContentDigest(review),
      },
    })

    createdIds.push(nodeId);

    if (!cachedReviewIds.includes(nodeId)) {
      cachedReviewIds.push(nodeId);
    }

    await setCacheData(isCacheEnabled, cache, nodeId, nodeId);
  }

  for (let i = 0; i < cachedReviewIds.length; i++) {
    const reviewId = cachedReviewIds[i];

    if (createdIds.includes(reviewId)) {
      continue;
    }

    const existingNodeId = await getCacheData(isCacheEnabled, cache, reviewId);

    if (!existingNodeId || typeof existingNodeId === "undefined") {
      continue;
    }

    const existingNode = getNode(existingNodeId);

    if (existingNode) {
      touchNode(existingNode);
    }
  }

  await setCacheData(isCacheEnabled, cache, CACHE_KEY_CACHED_REVIEWS, cachedReviewIds);

  if (newLastFetched) {
    await setCacheData(isCacheEnabled, cache, CACHE_KEY_LAST_FETCHED, newLastFetched);
  }

  const ratings = await getProductRatingsSummary(publicKey, storeHash, productIds);

  ratings.forEach(rating => {
    createNode({
      ...rating,
      id: createNodeId(`${NODE_TYPE_REVIEW}-${rating.productId}`),
      parent: null,
      children: [],
      internal: {
        type: NODE_TYPE_RATING_SUMMARY,
        contentDigest: createContentDigest(rating),
      },
    })
  })

  await setCacheData(isCacheEnabled, cache, CACHE_KEY_PRODUCTS, productIds);
};
