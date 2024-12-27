const axios = require("../clients/axios-with-agent-keep-alive");
const logger = require("../lib/logger");
const memCache = require("./mem-cache");

const TRADING_PAIRS_KEY = "trading-pairs";

async function getTradingPairs() {
  try {
    const tradingPairs = await memCache.get({
      key: TRADING_PAIRS_KEY,
    });

    if (!tradingPairs?.length) {
      const { data } = await axios.get(
        "https://api.binance.com/api/v3/exchangeInfo"
      );

      const newPairs = data.symbols
        .filter((symbol) => symbol.status === "TRADING")
        .map((symbol) => symbol.symbol)
        .slice(0, 100);

      await memCache.set({
        key: TRADING_PAIRS_KEY,
        value: newPairs,
      });
    }

    return tradingPairs;
  } catch (error) {
    logger.error(error);
  }
}

const binance = {
  getTradingPairs,
};

module.exports = binance;
