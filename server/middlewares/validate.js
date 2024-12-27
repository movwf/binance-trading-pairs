const { verify } = require("jsonwebtoken");
const config = require("../config");
const { parseJWT } = require("../helpers/jwt");

module.exports = function validateRequest(req, res, next) {
  const jwtToken = req.cookies[config.cookieName];

  if (!jwtToken) {
    return res.status(403).json({ message: "Missing token!" });
  }

  const isVerified = verify(jwtToken, config.jwtSecret);

  if (!isVerified) {
    res.redirect("/login");
    return;
  }

  const { email } = parseJWT(jwtToken);

  req.user = { email };

  next();
};
