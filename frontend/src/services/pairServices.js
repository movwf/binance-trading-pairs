import axios from "../clients/axios-with-agentkeepalive";

async function getPairInfo(pair) {
  return axios.get(`/pairs/get?pair=${pair}`);
}

const pairServices = {
  getPairInfo,
};

export default pairServices;
