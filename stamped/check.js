const {getClient} = require("./api");

const BASE_API_URL = "https://stamped.io/api/";
const ENDPOINT_AUTH_CHECK = "/auth/check";

const authCheck = async (publicKey, privateKey) => {
  const client = getClient(BASE_API_URL, publicKey, privateKey);

  let endpoint = `${ENDPOINT_AUTH_CHECK}`;

  return await client
    .get(endpoint)
    .then((res) => {
      return res.data;
    });
}

module.exports = {
  authCheck: authCheck
}
