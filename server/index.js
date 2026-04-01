require("./models/models");
const router = require("./routers");
const initDB = require("./utils");
const connectDB = require("./utils/mongo");
const cors = require("cors");
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const { setupWebSocket } = require("./webSocket");
const {
  generalLimiter,
  chatMessageLimiter,
} = require("./middlewares/rateLimiterMiddleware");

require("dotenv").config();
const app = require("express")();

const host = process.env.HOST;
const port = process.env.PORT || 3000;

initDB();
connectDB();

app.use(helmet()); // Защита 1
app.use(
  cors({
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", router);
app.use(generalLimiter);

const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});
