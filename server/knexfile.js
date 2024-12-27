const config = require("./config/index.js");

module.exports = {
  client: "pg",
  connection: config.db.postgres,
  pool: {
    min: 0,
    max: 5,
  },
  migrations: {
    directory: "./migrations",
    extension: "js",
  },
  seeds: {
    directory: "./seeds",
    extension: "js",
  },
};
