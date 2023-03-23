const axios = require("axios")

const getClient = (baseApiUrl, publicKey, privateKey = null, storeHash = null) => {
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  }

  if (privateKey) {
    const encodedToken = Buffer.from(`${publicKey}:${privateKey}`, "utf8").toString("base64");

    headers["Authorization"] = `Basic ${encodedToken}`;
  }

  let baseUrl = baseApiUrl;

  if (storeHash) {
    baseUrl = `${baseUrl}${storeHash}`;
  }

  return axios.create({
    baseURL: baseUrl,
    headers: headers
  })
}

module.exports = {
  getClient: getClient,
}
