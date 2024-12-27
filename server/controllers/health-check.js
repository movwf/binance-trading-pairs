const { Router } = require("express");
const pgClient = require("../clients/postgres");
const logger = require("../lib/logger");

const healtCheckRouter = Router();

async function checkPostgresHealth() {
  try {
    await pgClient.raw("SELECT 1;");
  } catch (error) {
    logger.error(`[pg][health-check][Error]: ${error.message}`);
    throw error;
  }
}

["/health-liveness", "/health-readiness"].forEach((path) => {
  healtCheckRouter.get(path, async (req, res) => {
    try {
      await checkPostgresHealth();
      res.status(200).send();
    } catch (error) {
      res.status(500).send();
    }
  });
});

module.exports = healtCheckRouter;
