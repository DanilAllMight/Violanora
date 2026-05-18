require("./models/models");
const router = require("./routers");
const initDB = require("./utils");
const connectDB = require("./utils/mongo");
const cors = require("cors");
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const { setupWebSocket } = require("./services/webSocket");
const {
  generalLimiter,
  chatMessageLimiter,
} = require("./middlewares/rateLimiterMiddleware");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");
const logger = require("./utils/logger");

require("dotenv").config();
const app = require("express")();

const host = process.env.HOST;
const port = process.env.PORT || 3000;

initDB();
connectDB();

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://violanora.ru",
      "http://192.168.0.101:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", router);
app.use(generalLimiter);
app.use(errorMiddleware);

const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, host, function () {
  logger.debug({ host, port }, "Сервер запущен");
});
