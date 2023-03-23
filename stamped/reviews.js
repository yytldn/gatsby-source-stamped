const {getClient} = require("./api");

const BASE_API_URL = "http://s2.stamped.io/api/v2/";
const ENDPOINT_REVIEWS = "/dashboard/reviews";

const getReviews = async (publicKey, privateKey, storeHash, lastFetched) => {
  const res = await getReviewsData(publicKey, privateKey, storeHash, lastFetched);

  let reviewsData = res.results
  let totalPages = res.totalPages

  for (let page = 2; page <= totalPages; page++) {
    const reviews = await getReviewsData(publicKey, privateKey, storeHash, lastFetched, page)
    reviewsData = reviewsData.concat(reviews.results)
  }

  return reviewsData;
}

const getReviewsData = async (publicKey, privateKey, storeHash, lastFetched = null, page = 1) => {
  const client = getClient(BASE_API_URL, publicKey, privateKey, storeHash);

  let endpoint = `${ENDPOINT_REVIEWS}?page=${page}`;

  if (lastFetched) {
    endpoint = `${endpoint}&dateFrom=${lastFetched}`;
  }

  if (page === 1) {
    console.info(`Fetching Stamped reviews`)
  } else {
    console.info(`Fetching Stamped reviews, page ${page}`)
  }

  return await client
    .get(endpoint)
    .then((res) => {
      return res.data
    });
}

module.exports = {
  getReviews: getReviews
}
