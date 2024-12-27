const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const users = require("../queries/user");
const logger = require("../lib/logger");
const config = require("../config");

const userRouter = Router();

userRouter.post("/login", async function login(req, res) {
  const { email, password } = req.body;

  const user = await users.findOne(email);

  if (!user) {
    res.status(401).send();
    return;
  }

  const isPasswordMatches = await bcrypt.compare(password, user.password);

  if (!isPasswordMatches) {
    // TODO: Retry lock

    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const token = jwt.sign({ email: user.email }, config.jwtSecret, {
    expiresIn: "24h",
  });

  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(true);
});
userRouter.get("/logout", async function logout(req, res) {
  res.cookie(config.cookieName, '', {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 0,
  });
  res.status(200).json(true);
});
userRouter.post("/register", async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const user = await users.findOne(email);

  if (user) {
    return res.status(400).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await users.createUser(email, hashedPassword);

    const token = jwt.sign({ email }, config.jwtSecret, {
      expiresIn: "24h",
    });

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    logger.error(`[user][register][Error]: ${error.message}`);

    res.status(500).send();
  }
});
// NOTE: Workaround for HTTP Secure cookies on client
userRouter.get("/token", async function (req, res) {
  res.json({ token: req.cookies[config.cookieName] });
});

module.exports = userRouter;
