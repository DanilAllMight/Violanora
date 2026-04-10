const express = require("express");
const userController = require("../controllers/user-controller");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", userController.login);
router.post("/registration", userController.registration);
router.post("/refresh", userController.refresh);
router.post("/logout", userController.logout);
router.get("/users", userController.getUsers);
router.post(
  "/upload-avatar",
  upload.single("avatar"),
  userController.uploadAvatar,
);
router.post("/fcm-token", userController.updateFcmToken);
router.post("/update", userController.updateUserData);

module.exports = router;
