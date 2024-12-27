import axios from "axios";
import Agent from 'agentkeepalive';

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

export default axios;
