const express = require("express");

const cookieParser = require("cookie-parser");
const uWS = require("uWebSockets.js");
const WebSocket = require("ws");
const cors = require("cors");

const config = require("./config");

const { getJWTFromHeader, parseJWT } = require("./helpers/jwt");
const subscriptions = require("./queries/subscriptions");
const logger = require("./lib/logger");

const healtCheckRouter = require("./controllers/health-check");

const apiRouter = require("./routes");
const pgClient = require("./clients/postgres");
const SubscriptionClient = require("./helpers/subClients");

const { port, wsPort } = config;

const app = express();
const wsApp = uWS.App();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/", healtCheckRouter);

app.use("/api", apiRouter);

const binanceWs = new WebSocket("wss://stream.binance.com:9443/ws");

wsApp.ws("/ws", {
  upgrade: (res, req, context) => {
    const headers = req.getHeader("cookie");
    const jwtToken = getJWTFromHeader(headers);

    if (!jwtToken) {
      res.writeStatus("401 Unauthorized").end("Unauthorized. Invalid token.");

      return;
    }

    const { email } = parseJWT(jwtToken);

    res.upgrade(
      { email },
      req.getHeader("sec-websocket-key"),
      req.getHeader("sec-websocket-protocol"),
      req.getHeader("sec-websocket-extensions"),
      context
    );
  },
  open: async (ws) => {
    const { email } = await ws.getUserData();

    const client = new SubscriptionClient(email);

    if (client.isNew) {
      const userSubscriptions = await subscriptions.findOne(email);

      client.publishPairs(userSubscriptions?.pairs || []);
    }

    logger.info(`[ws][server]: Subscriber connected: ${email}`);

    client.getPairs().forEach((pair) => {
      ws.subscribe(pair);

      binanceWs.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`${pair.toLowerCase()}@trade`],
        })
      );
    });
    ws.send("Welcome to BTP WS API vs 1.0.0");
  },
  message: (ws, message, isBinary) => {
    logger.info(`[ws][server]: Received message: ${message}`);
  },
  close: async (ws, code, message) => {
    const { email } = await ws.getUserData();

    logger.info(`[ws][server][${code}]: Subscriber disconnected: ${email}`);
  },
});

binanceWs.on("message", (data) => {
  const message = JSON.parse(data);

  console.log(message.s);

  const ticker = {
    symbol: message?.s,
    price: message?.c,
    high: message?.h,
    low: message?.l,
    priceChange: message?.p,
    priceChangePercent: message?.P,
    volume: message?.v,
    timestamp: message?.E,
  };

  setTimeout(() => wsApp.publish(message.s, JSON.stringify(ticker)), 100);
});

wsApp.listen(wsPort, (socket) => {
  if (socket) {
    logger.info(`[ws][Server]: Started on: ${wsPort}`);
  } else {
    logger.error(`[ws][Server][Start]: Failed to start`);
  }
});

app.listen(port, () => {
  logger.info(`[App][Start]: ${port}`);
});
