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

  let updatedPairs;

  try {
    if (!subscriptions) {
      updatedPairs = `${pair}`;
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

      updatedPairs = subscriptions.pairs.concat(pair).join(",");
      await pgClient("subscriptions")
        .update({
          pairs: updatedPairs,
        })
        .where({ user_id: subscriptions.id });
    }

    return updatedPairs.split(',');
  } catch (error) {
    logger.error(error);
    return [];
  }
}

async function unsubscripePair(email, pair) {
  const subscriptions = await findOne(email);

  let updatedPairs;

  try {
    if (subscriptions) {
      if (!subscriptions.pairs.includes(pair)) {
        return true;
      }

      updatedPairs = subscriptions.pairs.filter((p) => p !== pair).join(",");
      const query = pgClient("subscriptions")
        .update({
          pairs: updatedPairs,
        })
        .where("user_id", "=", subscriptions.id);

      await query;
    }

    return updatedPairs.split(',');
  } catch (error) {
    logger.error(error);
    return [];
  }
}

const subscriptions = {
  findOne,
  subscribePair,
  unsubscripePair,
};
module.exports = subscriptions;
