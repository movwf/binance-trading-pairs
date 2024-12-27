const pgClient = require("../clients/postgres");
const logger = require("../lib/logger");

async function findOne(email) {
  const query = await pgClient("subscriptions")
    .leftJoin("users", "users.id", "subscriptions.user_id")
    .where({ "users.email": email })
    .select("id", "pairs");

  const result = await query;

  if (result.length) {
    return result.map((r) => ({
      ...r,
      pairs: r.pairs.split(",").filter(Boolean),
    }))[0];
  }

  return null;
}

async function subscribePair(email, pair) {
  const subscriptions = await findOne(email);

  try {
    if (!subscriptions) {
      await pgClient("subscriptions").insert({
        user_id: pgClient.raw(
          `(SELECT id FROM users WHERE email = '${email}')`
        ),
        pairs: `${pair}`,
      });
    } else {
      if (subscriptions.pairs.includes(pair)) {
        return true;
      }
      await pgClient("subscriptions")
        .update({
          pairs: subscriptions.pairs.concat(pair).join(","),
        })
        .where({ user_id: subscriptions.id });
    }

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function unsubscripePair(email, pair) {
  const subscriptions = await findOne(email);

  try {
    if (subscriptions) {
      if (!subscriptions.pairs.includes(pair)) {
        return true;
      }

      const query = pgClient("subscriptions")
        .update({
          pairs: subscriptions.pairs.filter((p) => p !== pair).join(","),
        })
        .where("user_id", "=", subscriptions.id);

      await query;
    }

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

const subscriptions = {
  findOne,
  subscribePair,
  unsubscripePair,
};
module.exports = subscriptions;
