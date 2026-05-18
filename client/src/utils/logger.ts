import pino from "pino";

const logger = pino({
  browser: {
    asObject: true,
  },
  level: import.meta.env.MODE === "development" ? "debug" : "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export default logger;
