const WebSocket = require("ws");

(() => {
  const binanceWs = new WebSocket("wss://stream.binance.com:9443/ws");

  binanceWs.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.e === "24hrTicker") {
      const ticker = {
        symbol: message.s,
        price: message.c,
        high: message.h,
        low: message.l,
        priceChange: message.p,
        priceChangePercent: message.P,
        volume: message.v,
        timestamp: message.E,
      };
    }
    console.log(message);
  });
  binanceWs.on("open", () => {
    console.log("connected");
    binanceWs.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: ["btcusdt@trade"],
      })
    );
  });
})();
