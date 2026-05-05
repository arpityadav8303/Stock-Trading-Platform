const express = require("express");
const {
  addFunds,
  getAllHoldings,
  getAllOrders,
  getAllPositions,
  getUserFunds,
  withdrawFunds,
} = require("../controllers/portfolioController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/allHoldings", requireAuth, getAllHoldings);
router.get("/allPositions", requireAuth, getAllPositions);
router.get("/allOrders", requireAuth, getAllOrders);
router.get("/userFunds", requireAuth, getUserFunds);
router.post("/addFunds", requireAuth, addFunds);
router.post("/withdrawFunds", requireAuth, withdrawFunds);

module.exports = router;
