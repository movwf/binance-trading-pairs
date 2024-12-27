const Knex = require("knex");
const config = require("../knexfile");

const pgClient = Knex(config);

module.exports = pgClient;
