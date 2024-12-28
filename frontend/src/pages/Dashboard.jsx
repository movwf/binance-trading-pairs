import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MarketContext } from "../contexts/MarketContext";

import PairSocket from "../helpers/PairSocket";
import clsx from "../helpers/clsx";

import subscriptionService from "../services/subscriptionService";
import tradeServices from "../services/tradeServices";
import authServices from "../services/authServices";

import SelectWithSearch from "../components/dashboard/SelectWithSearch";
import pairServices from "../services/pairServices";

function Dashboard() {
  const navigate = useNavigate();
  /** @type {React.MutableRefObject<PairSocket | null>} */
  const socketRef = useRef(null);
  const {
    pairInfo,
    pairData,
    pairInView,
    subscribedCoins,
    updatePairData,
    updatePairInfo,
    updateSelectedPair,
    updateTradingPairs,
    updateSubscriptionList,
  } = useContext(MarketContext);

  function handleSubscribePair(pair) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.subscribePair(pair);
      subscriptionService.subscribePair(pair).then((res) => {
        updateSubscriptionList(res.data?.subscriptions);
      });
    }
  }

  useEffect(() => {
    authServices.getToken().then((res) => {
      if (!res.data.token) {
        // NOTE: This is workaround for document.cookie on http
        // TODO: Fix it later
        navigate("/login");
      } else {
        socketRef.current = new PairSocket({ updatePairData });

        tradeServices.getTradingPairs().then((res) => {
          updateTradingPairs(res.data);
        });

        subscriptionService.getAllSubscriptions().then((res) => {
          updateSubscriptionList(res.data?.subscriptions || []);

          pairServices.getPairInfo(res.data?.subscriptions || []).then((r) => {
            r.data.forEach((pairInfo) => updatePairInfo(pairInfo));
          });
        });
      }
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNegative = (num) => num.startsWith("-");
  const getPriceChange = (pair) =>
    pairData[pair] ? pairData[pair].at(-1).priceChange : "";
  const getPriceChangePercent = (pair) =>
    pairData[pair] ? pairData[pair].at(-1).priceChangePercent : "";
  const getPriceInFormat = (pair) =>
    pairData[pair] ? pairData[pair].at(-1).formattedNumber : "";

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
                  {pairInView}
                </div>
                <div className="text-3xl font-bold mt-2">
                  {getPriceInFormat(pairInView)}{" "}
                  <span
                    className={clsx(
                      "text-sm",
                      isNegative(getPriceChange(pairInView))
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {getPriceChange(pairInView)} (
                    {getPriceChangePercent(pairInView)}%)
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
                <LineChart data={pairData[pairInView]}>
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
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div>
                <div className="text-sm">High</div>
                <div className="font-bold">{pairInfo[pairInView]?.high24hr}</div>
                {/* $1.34M USD */}
              </div>
              <div>
                <div className="text-sm">Low</div>
                <div className="font-bold">{pairInfo[pairInView]?.low24hr}</div>
                {/* $1.34M BTC */}
              </div>
              <div>
                <div className="text-sm">Price Change</div>
                <div className="font-bold">{pairInfo[pairInView]?.priceChange24hr}</div>
                {/* 201M USD */}
              </div>
              <div>
                <div className="text-sm">Price Change %</div>
                <div className="font-bold">{pairInfo[pairInView]?.priceChangePercent24hr}</div>
                {/* 201M USD */}
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
            <SelectWithSearch
              onPairSelected={(pair) => {
                handleSubscribePair(pair);
              }}
            />
            <div className="max-h-64 overflow-x-scroll">
              {subscribedCoins.map((coin) => (
                <div
                  key={coin.name}
                  className="h-12 flex justify-between items-center p-2 hover:bg-gray-700 rounded-md transition-all cursor-pointer"
                  onClick={() => {
                    updateSelectedPair(coin.name);
                  }}
                >
                  <div>
                    {coin.name}{" "}
                    <span className="text-gray-500">{coin.ticker}</span>
                  </div>
                  <div>
                    <span className="text-green-500">
                      {getPriceInFormat(coin.name)}
                    </span>{" "}
                    <span
                      className={clsx(
                        "text-xs",
                        isNegative(getPriceChangePercent(coin.name))
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {getPriceChangePercent(coin.name)}%
                    </span>
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
