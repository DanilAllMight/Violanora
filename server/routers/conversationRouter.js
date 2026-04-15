const express = require("express");
const conversationConroller = require("../controllers/conversation-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get(
  "/conversations/:userId",
  authMiddleware,
  conversationConroller.getConversations,
);
router.get(
  "/conversation/:userId/:partnerId",
  authMiddleware,
  conversationConroller.getConversation,
);

module.exports = router;
