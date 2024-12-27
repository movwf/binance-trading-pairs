const { Router } = require("express");
const pgClient = require("../clients/postgres");
const subscriptions = require("../queries/subscriptions");

const subscriptionsRouter = Router();

subscriptionsRouter.get("/all", async (req, res) => {
  const subscriptions = await pgClient("subscriptions")
    .leftJoin("users", "users.id", "subscriptions.user_id")
    .where({ "users.email": req.user.email })
    .select("pairs");

  res.json({ subscriptions: subscriptions[0].pairs.split(",") });
});

subscriptionsRouter.get("/subscribe", async (req, res) => {
  const { pair } = req.query;

  const result = await subscriptions.subscribePair(req.user.email, pair);

  res.json({ result });
});

subscriptionsRouter.get("/unsubscribe", async (req, res) => {
  const { pair } = req.query;

  const result = await subscriptions.unsubscripePair(req.user.email, pair);

  res.json({ result });
});

module.exports = subscriptionsRouter;
