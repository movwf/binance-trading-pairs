const { Router } = require("express");

const memCache = require("./lib/mem-cache");
const usersRouter = require("./controllers/users");
const subscriptionsRouter = require("./controllers/subscriptions");

const validateMiddleware = require("./middlewares/validate");
const binance = require("./lib/binance");

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
  res.send("Hi");
});

// User
apiRouter.use("/users", usersRouter);

// Subscriptions
apiRouter.use("/subscriptions", validateMiddleware, subscriptionsRouter);

// Trade
apiRouter.get("/pairs/all", async (req, res) => {
  const pairs = await binance.getTradingPairs();

  res.json(pairs);
});

module.exports = apiRouter;
