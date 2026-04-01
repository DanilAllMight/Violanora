import pino from "pino";

const logger = pino({
  browser: {
    asObject: true, // Logs appear as expandable objects in DevTools
  },
  level: import.meta.env.MODE === "development" ? "debug" : "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export default logger;
