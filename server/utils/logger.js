const pino = require("pino");
require("dotenv").config();

const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  childCapabilities: true,
  browser: { asObject: true },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      //include: "level,time",
      ignore: "pid,hostname",
    },
  },
});

module.exports = logger;
