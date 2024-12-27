import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Icons from "../components/Icons";

import tradeServices from "../services/tradeServices";
import subscriptionService from "../services/subscriptionService";

const EXAMPLE_PAIR_PRICE_DATA = [
  { time: "22:15", price: 20750 },
  { time: "22:20", price: 20760 },
  { time: "22:25", price: 20780 },
  { time: "22:30", price: 20770 },
  { time: "22:35", price: 20790 },
  { time: "22:40", price: 20760 },
  { time: "22:45", price: 20780 },
  { time: "22:50", price: 20773 },
];

function Dashboard() {
  const [isCoinsMenuOpen, showCoins] = useState(false);
  const [tradingPairs, setTradingPairs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [subscribedCoins, setSubscribedCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("BTCUSDT");
  const [pairData, setPairData] = useState({
    BTCUSDT: EXAMPLE_PAIR_PRICE_DATA,
  });
  const selectRef = useRef(null);

  const fuse = new Fuse(tradingPairs);

  function handleSearch(keyword) {
    if (keyword === "") {
      setSearchResults(tradingPairs.map((p) => ({ item: p })));
    } else {
      if (!isCoinsMenuOpen) {
        showCoins(true);
      }

      const result = fuse.search(keyword);

      setSearchResults(result);
    }
  }

  function handleClickOutside(event) {
    if (selectRef?.current && !selectRef.current?.contains(event.target)) {
      showCoins(false);
    }
  }

  function handleSubscribePair(pair) {
    subscriptionService.subscribePair(pair).then(() => {
      window.location.reload();
    });

    // setSubscribedCoins([
    //   ...subscribedCoins,
    //   ...(subscribedCoins.findIndex((c) => c.name === pair) > -1
    //     ? []
    //     : [
    //         {
    //           name: pair,
    //           ticker: "XXX",
    //           value: "$xx,xx.xx",
    //           change: "0.xx%",
    //         },
    //       ]),
    // ]);
  }

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8422/ws");

    socket.onmessage = function (m) {
      const { data } = m;

      const priceData = JSON.parse(data);

      if(priceData?.symbol) {
        console.log(priceData.priceChange)

        setPairData((pData) => ({
          ...pData,
          [priceData.symbol]: [
            ...(pData[priceData.symbol] || []).slice(1),
            {
              price: Number(priceData.priceChange).toFixed(2),
              time: moment(priceData.timestamp).format("HH:mm"),
            },
          ],
        }));
      }

    };

    tradeServices.getTradingPairs().then((res) => {
      setTradingPairs(res.data);
      setSearchResults(res.data.map((p) => ({ item: p })));
    });

    subscriptionService.getAllSubscriptions().then((res) => {
      setSubscribedCoins(
        res.data.subscriptions.map((p) => ({
          name: p,
          ticker: "XXX",
          value: "$xx,xx.xx",
          change: "-0.xx%",
        }))
      );
    });

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample chart data

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen p-4 flex items-center justify-center">
      <div className="w-full flex flex-col max-w-5xl">
        <div>
          {/* Top Bar */}
          <div className="flex justify-end items-center mb-4 px-4">
            <div className="text-sm">⚙️ Settings</div>
          </div>
        </div>

        <div className="w-full h-full flex flex-row">
          {/* Main Card */}
          <div className="w-3/5 bg-gray-800 rounded-lg p-4 shadow-lg">
            {/* Bitcoin Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xl font-bold flex items-center">
                  {selectedCoin}
                </div>
                <div className="text-3xl font-bold mt-2">
                  $20,759.71{" "}
                  <span className="text-red-500 text-sm">
                    - $20.77 (-0.10%)
                  </span>
                </div>
              </div>
              {/* <div>
                <button className="h-8 w-8 bg-gray-700 fill-white p-2 rounded-md">
                  <Icons.HeartEmpty />
                </button>
                <button className="bg-gray-700 p-2 rounded-md">❤️</button> 
              </div> */}
            </div>

            {/* Chart Area */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pairData[selectedCoin]}>
                  <XAxis dataKey="time" tick={{ fill: "#ccc", fontSize: 12 }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "#ccc", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4fd1c5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-sm">Market cap</div>
                <div className="font-bold">$1.34M USD</div>
              </div>
              <div>
                <div className="text-sm">Circulating supply</div>
                <div className="font-bold">$1.34M BTC</div>
              </div>
              <div>
                <div className="text-sm">Volume (1h)</div>
                <div className="font-bold">201M USD</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-2/5 bg-gray-800 rounded-lg ml-4 p-4 shadow-lg">
            {/* 
              Resolution selectors
            <div className="flex justify-between items-center mb-2">
              <div className="text-gray-400">1H</div>
              <div className="text-gray-400">1D</div>
              <div className="text-gray-400">7D</div>
            </div> */}
            <div className="relative h-14 flex justify-between items-center mb-2">
              <div
                ref={selectRef}
                className="relative h-10 w-full bg-gray-600 rounded-lg pr-8 pl-4 cursor-pointer hover:bg-gray-500"
                onClick={() => {
                  showCoins(!isCoinsMenuOpen);
                }}
              >
                <input
                  type="text"
                  className="w-full h-full bg-transparent outline-none"
                  onChange={(ev) => {
                    handleSearch(ev.target.value);
                  }}
                />
                <div className="absolute top-3 right-2 w-4 h-4">
                  <Icons.Down />
                </div>
                {isCoinsMenuOpen && (
                  <div
                    className="absolute h-64 w-full flex flex-col overflow-x-hidden hide-scrollbar z-55 top-12 -left-0 bg-gray-900 border border-gray-600 rounded-lg transition-all"
                    onMouseLeave={() => {
                      showCoins(false);
                    }}
                  >
                    {searchResults.map((result) => (
                      <div
                        key={result.item}
                        className="border-b border-gray-700"
                        onClick={() => {
                          handleSubscribePair(result.item);
                        }}
                      >
                        <div className="h-16 w-full flex justify-between items-center px-4 hover:bg-gray-700">
                          <div className="flex flex-col">
                            {result.item}{" "}
                            <span className="text-gray-500">XXX</span>
                          </div>
                          <div
                            className={`${
                              Math.random(1) > 0.5
                                ? "text-green-500"
                                : "text-red-500"
                            } flex flex-col items-end`}
                          >
                            $11.111.11{" "}
                            <span className="text-xs">
                              {Math.random(1) > 0.5 ? "" : "-"}0.XX%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="max-h-64 overflow-x-scroll">
              {subscribedCoins.map((coin) => (
                <div
                  key={coin.name}
                  className="h-12 flex justify-between items-center p-2 hover:bg-gray-700 rounded-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCoin(coin.name);
                  }}
                >
                  <div>
                    {coin.name}{" "}
                    <span className="text-gray-500">{coin.ticker}</span>
                  </div>
                  <div
                    className={`${
                      parseFloat(coin.change) > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {coin.value} <span className="text-xs">{coin.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
