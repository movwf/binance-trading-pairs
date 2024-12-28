const { Router } = require("express");

const subscriptionQueries = require("../queries/subscriptions");

const subscriptionsRouter = Router();

subscriptionsRouter.get("/all", async (req, res) => {
  const subscriptions = await subscriptionQueries.findOne(req.user.email);

  res.json({ subscriptions: subscriptions.pairs });
});

subscriptionsRouter.get("/subscribe", async (req, res) => {
  const { pair } = req.query;

  const subscriptions = await subscriptionQueries.subscribePair(req.user.email, pair);

  res.json({ subscriptions });
});

subscriptionsRouter.get("/unsubscribe", async (req, res) => {
  const { pair } = req.query;

  const subscriptions = await subscriptionQueries.unsubscripePair(req.user.email, pair);

  res.json({ subscriptions });
});

module.exports = subscriptionsRouter;
