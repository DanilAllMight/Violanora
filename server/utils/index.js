const sequelize = require("../config/db");
const logger = require("./logger");

async function initDB() {
  try {
    logger.debug("Подклюение к бд postgres");
    await sequelize.authenticate();
    await sequelize.sync({ alter: false, force: false });
    logger.debug("Подключено к postgres");
  } catch (err) {
    logger.error(err, "Ошибка подключения");
  }
}

module.exports = initDB;
