const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter.js");
const authRouter = require("./authRouter.js");
const messageRouter = require("./messageRouter.js");
const conversationtRouter = require("./conversationRouter.js");
const subscribeRouter = require("./subscribeRouter.js");

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/chat", messageRouter);
router.use("/conversation", conversationtRouter);
router.use("/subscribe", subscribeRouter);

module.exports = router;
