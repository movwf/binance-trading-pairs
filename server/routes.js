const { Router } = require("express");

const usersRouter = require("./controllers/users");
const pairsRouter = require("./controllers/pairs");
const subscriptionsRouter = require("./controllers/subscriptions");

const validateMiddleware = require("./middlewares/validate");

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
  res.send("Hi");
});

// User
apiRouter.use("/users", usersRouter);

// Subscriptions
apiRouter.use("/subscriptions", validateMiddleware, subscriptionsRouter);

// Pairs
apiRouter.use("/pairs", pairsRouter);

module.exports = apiRouter;
