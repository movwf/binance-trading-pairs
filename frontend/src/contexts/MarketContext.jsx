import { createContext, useState } from "react";
import moment from "moment";

// eslint-disable-next-line react-refresh/only-export-components
export const MarketContext = createContext(null);

const EXAMPLE_PAIR_PRICE_DATA = [
  {
    time: "22:15",
    price: 20750,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:20",
    price: 20760,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:25",
    price: 20780,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:30",
    price: 20770,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:35",
    price: 20790,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:40",
    price: 20760,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:45",
    price: 20780,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
  {
    time: "22:50",
    price: 20773,
    formattedNumber: "",
    priceChangePercent: "",
    priceChange: "",
  },
];
const INITIAL_PAIR = "BTCUSDT";

function MarketProvider({ children }) {
  const [pairInView, setSelectedPair] = useState(INITIAL_PAIR);
  const [tradingPairs, setTradingPairs] = useState([]);
  const [subscribedCoins, setSubscribedCoins] = useState([]);
  const [pairInfo, setPairInfo] = useState({});
  const [pairData, setPairData] = useState({
    [INITIAL_PAIR]: EXAMPLE_PAIR_PRICE_DATA,
  });

  function updateTradingPairs(updatedPairs) {
    setTradingPairs(updatedPairs);
  }

  function updateSelectedPair(pair) {
    setSelectedPair(pair);
  }

  function updatePairData(newPairData) {
    if (newPairData.symbol) {
      // {
      //   "type": "24hrTicker",
      //   "timestamp": 1735412736727,
      //   "symbol": "BTCUSDT",
      //   "priceChange": "483.28000000",
      //   "priceChangePercent": "0.511",
      //   "lastPrice": "94969.62000000",
      //   "openPrice": "94486.34000000",
      //   "highPrice": "95340.36000000",
      //   "lowPrice": "94100.60000000"
      // }

      const isNegative = (num) => num.startsWith("-");

      const formattedNumber = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(newPairData.lastPrice).toFixed(2));

      const updated = {
        time: moment(newPairData.timestamp).format("HH:mm"),
        price: Number(newPairData.lastPrice).toFixed(2),
        formattedNumber,
        priceChangePercent: newPairData.priceChangePercent,

        priceChange: `${isNegative(newPairData.priceChange) ? "-" : ""}${Number(
          isNegative(newPairData.priceChange)
            ? newPairData.priceChange.replace("-", "")
            : newPairData.priceChange
        ).toFixed(2)}`,
      };

      setPairData((pData) => ({
        ...pData,
        [newPairData.symbol]:
          (pData[newPairData.symbol] || []).length > 7
            ? (pData[newPairData.symbol] || []).slice(1).concat(updated)
            : (pData[newPairData.symbol] || []).concat(updated),
      }));
    }
  }

  function updatePairInfo(newPairInfo) {
    if (newPairInfo?.symbol) {
      // {
      //   "marketCap": "860786378.55776360",
      //   "supply": "860786378.55776360",
      //   "volume": "9095.93288000",
      //   "24hourHigh": "95340.36000000",
      //   "24hourLow": "94100.60000000",
      //   "24hourPriceChange": "321.23000000",
      //   "24hourPriceChangePercent": "0.339"
      // }

      setPairInfo((pInfo) => ({
        ...pInfo,
        [newPairInfo.symbol]: {
          high24hr: Number(newPairInfo["24hourHigh"]).toFixed(2),
          low24hr: Number(newPairInfo["24hourLow"]).toFixed(2),
          priceChange24hr: Number(newPairInfo["24hourPriceChange"]).toFixed(2),
          priceChangePercent24hr: Number(
            newPairInfo["24hourPriceChangePercent"]
          ).toFixed(2),
        },
      }));
    }
  }

  async function updateSubscriptionList(pairs) {
    setSubscribedCoins(
      pairs.map((pair) => ({
        name: pair,
        ticker: "XXX",
        value: "$xx,xx.xx",
        change: "-0.xx%",
      }))
    );
  }

  return (
    <MarketContext.Provider
      value={{
        pairData,
        pairInfo,
        pairInView,
        tradingPairs,
        subscribedCoins,

        updatePairData,
        updatePairInfo,

        updateSelectedPair,
        updateTradingPairs,
        updateSubscriptionList,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export default MarketProvider;
