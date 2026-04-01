const pino = require("pino");
require("dotenv").config();

const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",

  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard", // Добавит читаемое время
            ignore: "pid,hostname", // Уберет лишний шум из консоли
          },
        }
      : undefined,
});

module.exports = logger;
