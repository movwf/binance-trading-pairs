const memCache = require("../lib/mem-cache");

class SubscriptionClient {
  constructor(email, pairsFromDB = []) {
    this.email = email;

    if (!this.getPairs()) {
      this.publishPairs(pairsFromDB, email);

      this.isNew = true;
    } else {

      this.isNew = false;
    }

  }

  publishPairs(pairsFromDB, email = this.email) {
    return memCache.set({
      key: this.CLIENT_PAIRS_CACHE_KEY(email),
      value: pairsFromDB,
      bypassProcessMemory: false,
    });
  }

  getPairs(email = this.email) {
    return memCache.get({
      key: this.CLIENT_PAIRS_CACHE_KEY(email),
      bypassProcessMemory: false,
    });
  }

  subscribePair(pair) {
    const currentPairs = this.getPairs() || [];

    if (currentPairs.includes(pair)) return true;

    return this.publishPairs(currentPairs.concat(pair));
  }

  unsubscribePair(pair) {
    const currentPairs = this.getPairs() || [];

    if (!currentPairs.includes(pair)) return false;

    return this.publishPairs(currentPairs.filter((p) => p !== pair));
  }

  CLIENT_PAIRS_CACHE_KEY(email) {
    return `pairs::${email}`;
  }
}

module.exports = SubscriptionClient;
