const { Router } = require("express");

const binance = require("../lib/binance");

const pairsRouter = Router();

pairsRouter.get("/all", async (req, res) => {
  const pairs = await binance.getTradingPairs();

  res.json(pairs);
});

pairsRouter.get("/get", async (req, res) => {
  const { pair } = req.query;

  const pairs = pair.split(",");

  const pairInfo = await binance[pairs ? "getPairsInfo" : "getPairInfo"](
    pairs.length > 1 ? pairs : pairs[0]
  );

  res.json(pairInfo);
});

module.exports = pairsRouter;
