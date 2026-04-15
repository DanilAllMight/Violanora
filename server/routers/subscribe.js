const express = require("express");
const router = express.Router();
const subsribeController = require("../controllers/subscribe-controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, subsribeController.subscribeUser);

module.exports = router;
