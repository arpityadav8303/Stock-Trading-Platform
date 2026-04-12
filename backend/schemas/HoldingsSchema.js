const { Schema } = require("mongoose");

const HoldingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    avg: { type: Number, required: true },
    price: { type: Number, required: true },
    net: { type: String, required: true },
    day: { type: String, required: true },
  },
  { timestamps: true }
);

HoldingsSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

module.exports = { HoldingsSchema };
