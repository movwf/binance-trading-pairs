const axios = require("axios");
const Agent = require("agentkeepalive");

const keepAliveOptions = {
  maxSockets: 25,
  maxFreeSockets: 5,
  timeout: 60000,
  freeSocketTimeout: 60000,
};

axios.defaults.baseURL = "/api";
axios.defaults.httpAgent = new Agent(keepAliveOptions);
axios.defaults.httpsAgent = new Agent.HttpsAgent(keepAliveOptions);
axios.defaults.responseEncoding = "gzip";

module.exports = axios;
