const express = require("express");

const cookieParser = require("cookie-parser");
const uWS = require("uWebSockets.js");
const WebSocket = require("ws");
const cors = require("cors");

const logger = require("./lib/logger");
const config = require("./config");

const { getJWTFromHeader, parseJWT } = require("./helpers/jwt");
const SubscriptionClient = require("./helpers/subClients");
const { serializeTickerData } = require("./lib/binance");

const subscriptions = require("./queries/subscriptions");

const healtCheckRouter = require("./controllers/health-check");
const apiRouter = require("./routes");
const path = require("path");

const { port, wsPort, binanceWSAddress } = config;

const app = express();
const wsApp = uWS.App();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.redirect("/app/dashboard");
});

app.get("/app", (req, res) => {
  res.redirect("/app/dashboard");
});

app.use((req, res, next) => {
  if (
    /(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path) ||
    /\/api[\/]?.*/i.test(req.path)
  ) {
    return next();
  }

  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.use(express.static(path.join(__dirname, "dist")));

app.use("/", healtCheckRouter);
app.use("/api", apiRouter);

const binanceWs = new WebSocket(binanceWSAddress);
binanceWs.on("open", () => {
  logger.info(`[binance-ws][socket]: Connection established.`);
});

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
          params: [`${pair.toLowerCase()}@ticker`],
        })
      );
    });
    ws.send("Welcome to BTP WS API vs 1.0.0");
  },
  message: (ws, message, isBinary) => {
    try {
      const data = JSON.parse(Buffer.from(message).toString());

      if (data.action) {
        const pair = data.details.pair;
        const pairListenersCount = wsApp.numSubscribers(pair);

        switch (data.action) {
          case "subscribe":
            if (pairListenersCount === 0) {
              binanceWs.send(
                JSON.stringify({
                  method: "SUBSCRIBE",
                  params: [`${pair.toLowerCase()}@ticker`],
                })
              );
            }

            ws.subscribe(pair);
            break;

          case "unsubscribe":
            if (pairListenersCount === 1) {
              binanceWs.send(
                JSON.stringify({
                  method: "UNSUBSCRIBE",
                  params: [`${pair.toLowerCase()}@ticker`],
                })
              );
            }

            ws.unsubscribe(pair);
            break;
        }
      }
    } catch (error) {
      logger.error(error);
    }

    logger.info(`[ws][server]: Received message: ${message}`);
  },
  close: async (ws, code, message) => {
    const { email } = await ws.getUserData();

    logger.info(`[ws][server][${code}]: Subscriber disconnected: ${email}`);
  },
});

binanceWs.on("message", (data) => {
  const message = JSON.parse(data);

  const ticker = serializeTickerData(message);

  if (ticker.symbol) {
    wsApp.publish(ticker.symbol, JSON.stringify(ticker));
  }
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
