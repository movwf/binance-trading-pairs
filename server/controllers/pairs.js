const { Router } = require("express");

const binance = require("../lib/binance");

const pairsRouter = Router();

pairsRouter.get("/all", async (req, res) => {
  const pairs = await binance.getTradingPairs();

  res.json(pairs);
});

pairsRouter.get("/get", async (req, res) => {
  const { pair } = req.query;

  const pairs = pair.split(",").filter(Boolean);

  let pairInfo = [];

  if(pairs.length) {
    if(pairs.length > 1) {
      pairInfo = await binance.getPairsInfo(pairs);
    } else {
      pairInfo = await binance.getPairInfo(pairs[0]);
    }
  }

  res.json(pairInfo);
});

module.exports = pairsRouter;
