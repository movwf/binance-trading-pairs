import axios from "../clients/axios-with-agentkeepalive";

async function getTradingPairs() {
  return axios.get("/pairs/all");
}

const tradeServices = {
  getTradingPairs
};

export default tradeServices;
