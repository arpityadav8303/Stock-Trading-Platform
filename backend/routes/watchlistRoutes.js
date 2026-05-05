const express = require("express");
const {
  addToWatchlist,
  getAllWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/allWatchlist", requireAuth, getAllWatchlist);
router.post("/addToWatchlist", requireAuth, addToWatchlist);
router.delete("/removeFromWatchlist/:name", requireAuth, removeFromWatchlist);

module.exports = router;
