const axios = require("axios");

const logger = require("../lib/logger");
const memCache = require("./mem-cache");

const TRADING_PAIRS_KEY = "trading-pairs";
const getPairInfoKey = (pair) => `info::${pair}`;

function secondsUntilEndOfDay() {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  ); // Midnight of the next day
  return Math.floor((endOfDay - now) / 1000); // Convert milliseconds to seconds
}

async function getPairInfo(pair) {
  try {
    let tradingPairs = await memCache.get({
      key: getPairInfoKey(pair),
    });

    if (!tradingPairs?.length) {
      const { data } = await axios.get(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`
      );

      tradingPairs = {
        symbol: pair,
        marketCap: data.quoteVolume,
        supply: data.quoteVolume,
        volume: data.volume,
        "24hourHigh": data.highPrice,
        "24hourLow": data.lowPrice,
        "24hourPriceChange": data.priceChange,
        "24hourPriceChangePercent": data.priceChangePercent,
      };

      await memCache.set({
        key: getPairInfoKey(pair),
        value: tradingPairs,
        ttl: secondsUntilEndOfDay(),
      });
    }

    return [tradingPairs];
  } catch (error) {
    logger.error(error);
  }
}

async function getPairsInfo(pairs) {
  const result = await Promise.all(pairs.map((p) => getPairInfo(p)));

  return result.flatMap((r) => r);
}

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

      // symbol.baseASSET for code

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

function serializeTickerData(tickerMessage) {
  return {
    type: tickerMessage?.e,
    timestamp: tickerMessage?.E,
    symbol: tickerMessage?.s,
    priceChange: tickerMessage?.p,
    priceChangePercent: tickerMessage?.P,
    lastPrice: tickerMessage?.c,
    openPrice: tickerMessage?.o,
    highPrice: tickerMessage?.h,
    lowPrice: tickerMessage?.l,
  };
}

const binance = {
  getPairInfo,
  getPairsInfo,
  getTradingPairs,
  serializeTickerData,
};

module.exports = binance;
