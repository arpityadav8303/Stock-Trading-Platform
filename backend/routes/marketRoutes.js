const express = require("express");
const { getMarketIndices, getStockChart, searchStocks } = require("../controllers/marketController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/marketIndices", requireAuth, getMarketIndices);
router.get("/stockChart/:symbol", requireAuth, getStockChart);
router.get("/searchStocks", requireAuth, searchStocks);

module.exports = router;
