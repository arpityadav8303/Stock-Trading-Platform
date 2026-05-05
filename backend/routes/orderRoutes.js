const express = require("express");
const { addPosition, createOrder } = require("../controllers/orderController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/newOrder", requireAuth, createOrder);
router.post("/addPosition", requireAuth, addPosition);

module.exports = router;
