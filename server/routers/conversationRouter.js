const express = require("express");
const conversationConroller = require("../controllers/conversation-controller");
const router = express.Router();

router.get("/conversations/:userId", conversationConroller.getConversations);
router.get(
  "/conversation/:userId/:partnerId",
  conversationConroller.getConversation,
);

module.exports = router;
