const { PositionsModel } = require("../model/PositionsModel");

const syncPositionsForStock = async (userId, stockName, holdingQty, holdingAvg, marketPrice) => {
  const positions = await PositionsModel.find({ userId, name: stockName });
  if (!positions.length) return;

  if (!Number.isFinite(holdingQty) || holdingQty <= 0) {
    await PositionsModel.deleteMany({ userId, name: stockName });
    return;
  }

  const base = positions[0];
  base.qty = holdingQty;
  base.avg = Number.isFinite(holdingAvg) ? holdingAvg : Number(base.avg) || 0;
  base.price = Number.isFinite(marketPrice) ? marketPrice : Number(base.price) || 0;
  base.net = base.net || "0.00%";
  base.day = base.day || "0.00%";
  base.isLoss = base.price < base.avg;
  await base.save();

  if (positions.length > 1) {
    const duplicateIds = positions.slice(1).map((row) => row._id);
    await PositionsModel.deleteMany({ _id: { $in: duplicateIds } });
  }
};

module.exports = { syncPositionsForStock };
