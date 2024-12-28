const { createClient } = require("redis");

const config = require("../config");
const logger = require("./logger");

const { url, processCacheChannel } = config.db.redis;

const clients = {
  redisClient: createClient({ url }),
  subscriber: createClient({ url }),
  publisher: createClient({ url }),
};

Object.keys(clients).forEach((clientName) => {
  clients[clientName].connect().catch((err) => {
    logger.error(`[mem-cache][Error][${clientName}]: ${err.message}`);
  });
});

const processMemory = new Map();

clients.subscriber.subscribe(processCacheChannel, (message) => {
  try {
    if (!message) return;

    const { action, key, payload } = JSON.parse(message);

    if (action === "set") {
      processMemory.set(key, payload);
    } else if (action === "del") {
      processMemory.delete(key);
    }
  } catch (error) {
    logger.error(`[mem-cache][subscriber][Error]: ${error.message}`);
  }
});

function get({ key, bypassProcessMemory = true }) {
  if (!bypassProcessMemory) {
    return processMemory.get(key);
  }

  return clients.redisClient.get(key).then((result) => JSON.parse(result));
}

function set({ key, value, bypassProcessMemory = true, ttl }) {
  if (!bypassProcessMemory) {
    const message = {
      action: "set",
      key,
      payload: value,
    };

    processMemory.set(key, value);

    return clients.publisher.publish(
      processCacheChannel,
      JSON.stringify(message)
    );
  }

  return clients.redisClient.set(key, JSON.stringify(value), { PX: ttl });
}

function del({ key, bypassProcessMemory = true }) {
  if (!bypassProcessMemory) {
    processMemory.delete(key);

    return true;
  }

  try {
    return clients.redisClient.del(key);
  } catch (error) {
    logger.error(`[mem-cache][del][Error]: ${error.message}`);

    return false;
  }
}

const memCache = {
  get,
  set,
  del,
};

module.exports = memCache;
