const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter.js");
const chatRouter = require("./chatRouter.js");
const conversationtRouter = require("./conversationRouter.js");

router.use("/user", userRouter);
router.use("/chat", chatRouter);
router.use("/conversation", conversationtRouter);

module.exports = router;
