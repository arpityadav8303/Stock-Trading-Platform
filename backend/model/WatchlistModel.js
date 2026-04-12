const mongoose = require("mongoose");
const { Schema } = mongoose;

const WatchlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  percent: { type: String, default: '0.00%' },
  isDown: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
});

WatchlistSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

const WatchlistModel = mongoose.models.watchlist || mongoose.model("watchlist", WatchlistSchema);

module.exports = { WatchlistModel };
