const express = require("express");
const chatController = require("../controllers/chat-controller");
const router = express.Router();

router.get("/messages/:senderId/:receiverId", chatController.getMessages);

module.exports = router;
