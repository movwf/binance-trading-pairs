import axios from "../clients/axios-with-agentkeepalive";

async function login(email, password) {
  return axios.post("/users/login", {
    email,
    password,
  });
}

async function register(email, password) {
  return axios.post("/users/register", {
    email,
    password,
  });
}

async function logout() {
  return axios.get("/users/logout");
}

async function getToken() {
  return axios.get("/users/token");
}

const authServices = {
  login,
  register,
  logout,
  getToken,
};

export default authServices;
