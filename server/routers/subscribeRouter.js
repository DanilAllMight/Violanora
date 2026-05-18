const express = require("express");
const router = express.Router();
const subsribeController = require("../controllers/subscribe-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const catchAsync = require("../utils/catchAsync");

router.post(
  "/",
  authMiddleware,
  catchAsync((req, res, next) =>
    subsribeController.subscribeUser(req, res, next),
  ),
);

module.exports = router;
