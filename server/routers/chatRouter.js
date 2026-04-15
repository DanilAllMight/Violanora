const express = require("express");
const chatController = require("../controllers/chat-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get(
  "/messages/:senderId/:receiverId",
  authMiddleware,
  chatController.getMessages,
);

module.exports = router;
