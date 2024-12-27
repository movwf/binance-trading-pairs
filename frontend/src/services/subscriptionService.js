import axios from "../clients/axios-with-agentkeepalive";

async function getAllSubscriptions() {
  return axios.get("/subscriptions/all");
}

async function subscribePair(pair) {
  return axios.get(`/subscriptions/subscribe?pair=${pair}`);
}

async function unsubscribePair(pair) {
  return axios.get(`/subscriptions/unsubscribe?pair=${pair}`);
}

const subscriptionService = {
  getAllSubscriptions,
  subscribePair,
  unsubscribePair,
};

export default subscriptionService;
