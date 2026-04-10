const express = require("express");
const router = express.Router();
const subsribeController = require("../controllers/subscribe-controller");

router.post("/", subsribeController.subscribeUser);

module.exports = router;
