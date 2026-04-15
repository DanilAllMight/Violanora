const express = require("express");
const userController = require("../controllers/user-controller");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", userController.login);
router.post("/registration", userController.registration);
router.post("/refresh", userController.refresh);
router.post("/logout", authMiddleware, userController.logout);
router.get("/users", userController.getUsers);
router.get(
  "/users/admin",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  userController.getUsersForAdmin,
);
router.post(
  "/relive",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  userController.reliveUser,
);
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.uploadAvatar,
);
router.post("/fcm-token", userController.updateFcmToken);
router.post("/update", authMiddleware, userController.updateUserData);
router.post("/check", authMiddleware, userController.check);
router.post(
  "/delete",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  userController.deleteUser,
);

module.exports = router;
