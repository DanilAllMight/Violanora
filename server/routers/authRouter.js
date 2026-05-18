const express = require("express");
const authController = require("../controllers/auth-controller");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const catchAsync = require("../utils/catchAsync");

router.post(
  "/login",
  catchAsync((req, res, next) => authController.login(req, res, next)),
);

router.post(
  "/registration",
  catchAsync((req, res, next) => authController.registration(req, res, next)),
);

router.post(
  "/refresh",
  catchAsync((req, res, next) => authController.refresh(req, res, next)),
);

router.post(
  "/logout",
  authMiddleware,
  catchAsync((req, res, next) => authController.logout(req, res, next)),
);

router.post(
  "/check",
  authMiddleware,
  catchAsync((req, res, next) => authController.check(req, res, next)),
);

module.exports = router;
