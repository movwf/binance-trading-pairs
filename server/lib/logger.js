const { pino } = require("pino");

const logger = pino({
  ...(process.env.NODE_ENV === "dev"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : { messageKey: "message" }),
  formatters: {
    bindings() {
      return {};
    },
    level(level) {
      return { level };
    },
  },
});

module.exports = logger;
