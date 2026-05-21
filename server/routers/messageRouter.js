const express = require("express");
const messageController = require("../controllers/message-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const multer = require("multer");
const logger = require("../utils/logger");
const path = require("path");
const { s3Client } = require("../utils/s3");
require("dotenv").config();
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/messages/:senderId/:receiverId",
  authMiddleware,
  catchAsync((req, res, next) => messageController.getMessages(req, res, next)),
);

router.post(
  "/upload-chat-media",
  authMiddleware,
  upload.array("chatFiles", 10),
  catchAsync((req, res, next) =>
    messageController.uploadChatMedia(req, res, next),
  ),
);

router.post(
  "/delete",
  authMiddleware,
  catchAsync((req, res, next) =>
    messageController.deleteMessage(req, res, next),
  ),
);

router.post(
  "/edit",
  authMiddleware,
  catchAsync((req, res, next) => messageController.editMessage(req, res, next)),
);

router.post(
  "/reply",
  authMiddleware,
  catchAsync((req, res, next) =>
    messageController.replyMessage(req, res, next),
  ),
);

router.post(
  "/forward",
  authMiddleware,
  catchAsync((req, res, next) =>
    messageController.forwardMessage(req, res, next),
  ),
);

module.exports = router;
