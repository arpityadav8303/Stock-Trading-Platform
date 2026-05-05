const { WatchlistModel } = require("../model/WatchlistModel");

const getAllWatchlist = async (req, res) => {
  const allWatchlist = await WatchlistModel.find({ userId: req.user.userId });
  res.json(allWatchlist);
};

const addToWatchlist = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Stock name is required" });
  }

  try {
    const userId = req.user.userId;
    const existing = await WatchlistModel.findOne({ userId, name });
    if (existing) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }

    const count = await WatchlistModel.countDocuments({ userId });
    if (count >= 50) {
      return res.status(400).json({ message: "Watchlist is full (max 50 stocks)" });
    }

    const newWatchlistItem = new WatchlistModel({
      userId,
      name,
      price: Number((Math.random() * 3000 + 100).toFixed(2)),
      percent: "0.00%",
      isDown: false,
    });

    await newWatchlistItem.save();
    res.status(201).json({ message: "Added to watchlist", stock: newWatchlistItem });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ message: "Failed to add to watchlist" });
  }
};

const removeFromWatchlist = async (req, res) => {
  const { name } = req.params;

  try {
    const result = await WatchlistModel.deleteOne({ userId: req.user.userId, name });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Stock not found in watchlist" });
    }
    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ message: "Failed to remove from watchlist" });
  }
};

module.exports = { getAllWatchlist, addToWatchlist, removeFromWatchlist };
