const express = require("express");
const userController = require("../controllers/user-controller");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const catchAsync = require("../utils/catchAsync");

const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/users",
  catchAsync((req, res, next) => userController.getUsers(req, res, next)),
);
router.get(
  "/users/admin",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  catchAsync((req, res, next) =>
    userController.getUsersForAdmin(req, res, next),
  ),
);
router.get(
  "/userData/:userId",
  authMiddleware,
  catchAsync((req, res, next) => userController.getUserData(req, res, next)),
);
router.post(
  "/relive",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  catchAsync((req, res, next) => userController.reliveUser(req, res, next)),
);
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  catchAsync((req, res, next) => userController.uploadAvatar(req, res, next)),
);
router.post(
  "/update",
  authMiddleware,
  catchAsync((req, res, next) => userController.updateUserData(req, res, next)),
);
router.post(
  "/delete",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  catchAsync((req, res, next) => userController.deleteUser(req, res, next)),
);

module.exports = router;
