// backend/schema/JS/PositionsSchema.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PositionsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  product: { type: String, default: "MIS" },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  net: { type: String, default: "0.00%" },
  day: { type: String, required: true },
  isLoss: { type: Boolean, required: true }
});

PositionsSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

module.exports = { PositionsSchema };
