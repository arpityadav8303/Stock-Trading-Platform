const mongoose = require("mongoose");
const { Schema } = mongoose;

const WalletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  balance: { type: Number, default: 0 },
});

const WalletModel = mongoose.models.wallet || mongoose.model("wallet", WalletSchema);

module.exports = { WalletModel };
