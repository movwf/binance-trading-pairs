/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 * */
function up(knex) {
  return Promise.all([
    knex.schema.createTable("users", (table) => {
      table.increments("id").primary().unsigned();
      table.string("email").unique().notNullable().index("users_email_index");
      table.string("password").notNullable();
      table.string("refresh_token");
      table.timestamps(true, true);
    }),

    knex.schema.createTable("subscriptions", (table) => {
      table
        .integer("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
        .primary();
      table.string("pairs").defaultTo(""); // e.g BNBBTC/USDT,BNBUSDT/USD
      table.timestamps(true, true);
    }),
  ]);
}
/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 * */
function down(knex) {
  return Promise.all([
    knex.schema.dropTable("users"),
    knex.schema.dropTable("subscriptions"),
  ]);
}

module.exports = { up, down };
