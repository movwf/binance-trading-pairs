const jwt = require("jsonwebtoken");

const config = require("../config");

function validateJWT(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    return !!decoded;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return false;
  }
}

function parseJWT(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(base64, "base64").toString());
}

function getJWTFromHeader(cookieHeader) {
  let token;

  cookieHeader.split(";").forEach((cookie) => {
    const [key, value] = cookie.split("=").map((part) => part.trim());

    if (key === config.cookieName) {
      token = value;
    }
  });

  return token;
}

module.exports = { validateJWT, parseJWT, getJWTFromHeader };
