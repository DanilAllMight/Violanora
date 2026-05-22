const express = require("express");
const conversationConroller = require("../controllers/conversation-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();

router.get(
  "/conversations/:userId",
  authMiddleware,
  catchAsync((req, res, next) =>
    conversationConroller.getConversations(req, res, next),
  ),
);

router.get(
  "/conversation/:userId/:partnerId",
  authMiddleware,
  catchAsync((req, res, next) =>
    conversationConroller.getConversation(req, res, next),
  ),
);

router.get(
  "/unreadConversations",
  authMiddleware,
  catchAsync((req, res, next) =>
    conversationConroller.getUnreadConversations(req, res, next),
  ),
);

module.exports = router;
