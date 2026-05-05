const { HoldingsModel } = require("../model/HoldingsModel");
const { OrderModel } = require("../model/OrderModel");
const { PositionsModel } = require("../model/PositionsModel");
const { syncPositionsForStock } = require("../services/positionService");
const { getOrCreateWallet } = require("../services/walletService");

const createOrder = async (req, res) => {
  const { name, mode } = req.body;
  const qty = Number(req.body?.qty);
  const price = Number(req.body?.price);

  if (!name || !mode) {
    return res.status(400).json({ message: "Name and mode are required" });
  }
  if (mode !== "BUY" && mode !== "SELL") {
    return res.status(400).json({ message: "Mode must be BUY or SELL" });
  }
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ message: "Qty and price must be positive numbers" });
  }

  try {
    const userId = req.user.userId;
    const wallet = await getOrCreateWallet(userId);
    const totalCost = qty * price;

    if (mode === "BUY") {
      if (wallet.balance < totalCost) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      wallet.balance -= totalCost;

      let holding = await HoldingsModel.findOne({ userId, name });
      if (holding) {
        const currentQty = Number(holding.qty) || 0;
        const currentAvg = Number(holding.avg) || 0;
        const newQty = currentQty + qty;
        const weightedAvg = newQty > 0 ? (currentQty * currentAvg + qty * price) / newQty : 0;

        holding.qty = newQty;
        holding.avg = Number(weightedAvg.toFixed(2));
        holding.price = price;
        await holding.save();
      } else {
        const newHolding = new HoldingsModel({
          userId,
          name,
          qty,
          avg: price,
          price,
          net: "+0.00%",
          day: "+0.00%",
        });
        await newHolding.save();
      }
    } else if (mode === "SELL") {
      const holding = await HoldingsModel.findOne({ userId, name });
      if (!holding || holding.qty < qty) {
        return res.status(400).json({ message: "Insufficient holding quantity to sell" });
      }

      wallet.balance += totalCost;
      holding.qty -= qty;
      holding.price = price;

      if (holding.qty <= 0) {
        await HoldingsModel.deleteOne({ userId, name });
      } else {
        await holding.save();
      }

      await syncPositionsForStock(userId, name, Number(holding.qty) || 0, Number(holding.avg) || 0, price);
    }

    await wallet.save();

    const newOrder = new OrderModel({ userId, name, qty, price, mode });
    await newOrder.save();
    res.status(201).json({ message: "Order saved!", balance: wallet.balance });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
};

const addPosition = async (req, res) => {
  const { product, name, net, day, isLoss } = req.body;
  const qty = Number(req.body?.qty);
  const avg = Number(req.body?.avg);
  const price = Number(req.body?.price);

  if (
    !name ||
    !Number.isFinite(qty) ||
    qty <= 0 ||
    !Number.isFinite(avg) ||
    avg <= 0 ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return res.status(400).json({ message: "Invalid position payload" });
  }

  try {
    const userId = req.user.userId;
    const existing = await PositionsModel.findOne({ userId, name });
    if (existing) {
      const currentQty = Number(existing.qty) || 0;
      const currentAvg = Number(existing.avg) || 0;
      const newQty = currentQty + qty;
      const weightedAvg = newQty > 0 ? (currentQty * currentAvg + qty * avg) / newQty : 0;

      existing.qty = newQty;
      existing.avg = Number(weightedAvg.toFixed(2));
      existing.price = price;
      existing.product = product || existing.product || "MIS";
      existing.net = net || existing.net || "0.00%";
      existing.day = day || existing.day || "0.00%";
      existing.isLoss = Boolean(isLoss);
      await existing.save();
      return res.status(200).json({ message: "Position updated successfully" });
    }

    const newPosition = new PositionsModel({
      userId,
      product: product || "MIS",
      name,
      qty,
      avg,
      price,
      net: net || "0.00%",
      day: day || "0.00%",
      isLoss: Boolean(isLoss),
    });

    await newPosition.save();
    res.status(201).json({ message: "Position added successfully" });
  } catch (error) {
    console.error("Error saving position:", error);
    res.status(500).json({ message: "Failed to add position" });
  }
};

module.exports = { createOrder, addPosition };
