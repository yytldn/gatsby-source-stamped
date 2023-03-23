const {getClient} = require("./api");

const BASE_API_URL = "https://stamped.io/api/";
const ENDPOINT_BADGE = "/widget/badges";

const getProductRatingsSummary = async (publicKey, storeHash, productIds) => {
  const client = getClient(BASE_API_URL, publicKey);

  let endpoint = `${ENDPOINT_BADGE}?isIncludeBreakdown=true&isincludehtml=true`;

  console.info(`Fetching Stamped ratings summary`)

  let body = {
    "productIds": [],
    "apiKey": publicKey,
    "storeUrl": storeHash
  }

  productIds.forEach(id => {
    body.productIds.push(
      {
        "productId": id
      }
    )
  });

  return await client
    .post(endpoint, body)
    .then((res) => {
      return res.data;
    });
}

module.exports = {
  getProductRatingsSummary: getProductRatingsSummary
}
