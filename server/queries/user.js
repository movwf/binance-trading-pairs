const pgClient = require("../clients/postgres");

async function findOne(email) {
  const query = pgClient("users").where({ email }).select("*");

  const result = await query;

  if (result.length) {
    return result[0];
  }

  return null;
}

async function createUser(email, hashedPassword) {
  return pgClient("users").insert({
    email,
    password: hashedPassword,
  });
}

const users = {
  findOne,
  createUser,
};
module.exports = users;
