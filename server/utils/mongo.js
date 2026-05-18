const mongoose = require("mongoose");
const logger = require("./logger");
require("dotenv").config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/real-time-chat";

async function connectDB() {
  try {
    logger.debug({ mongoURI }, "Запускаем mongo");
    await mongoose.connect(mongoURI);
    logger.debug("Подключено к mongo");
  } catch (err) {
    logger.error(err, "Ошибка подключения");
    process.exit(1);
  }
}

module.exports = connectDB;
