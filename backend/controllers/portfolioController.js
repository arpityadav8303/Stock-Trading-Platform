const { HoldingsModel } = require("../model/HoldingsModel");
const { OrderModel } = require("../model/OrderModel");
const { PositionsModel } = require("../model/PositionsModel");
const { getOrCreateWallet } = require("../services/walletService");

const getAllHoldings = async (req, res) => {
  const allHoldings = await HoldingsModel.find({ userId: req.user.userId });
  res.json(allHoldings);
};

const getAllPositions = async (req, res) => {
  const holdings = await HoldingsModel.find({ userId: req.user.userId }, "name");
  const holdingNames = holdings.map((h) => h.name);

  await PositionsModel.deleteMany({
    userId: req.user.userId,
    $or: [{ qty: { $lte: 0 } }, { name: { $nin: holdingNames } }],
  });

  const allPositions = await PositionsModel.find({
    userId: req.user.userId,
    qty: { $gt: 0 },
    name: { $in: holdingNames },
  });
  res.json(allPositions);
};

const getAllOrders = async (req, res) => {
  const orders = await OrderModel.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(orders);
};

const getUserFunds = async (req, res) => {
  const wallet = await getOrCreateWallet(req.user.userId);
  res.json({ balance: wallet.balance });
};

const addFunds = async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }
  const wallet = await getOrCreateWallet(req.user.userId);
  wallet.balance += amount;
  await wallet.save();
  res.json({ balance: wallet.balance });
};

const withdrawFunds = async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const wallet = await getOrCreateWallet(req.user.userId);
  if (wallet.balance < amount) {
    return res.status(400).json({ message: "Insufficient funds" });
  }

  wallet.balance -= amount;
  await wallet.save();
  res.json({ balance: wallet.balance });
};

module.exports = {
  getAllHoldings,
  getAllPositions,
  getAllOrders,
  getUserFunds,
  addFunds,
  withdrawFunds,
};
