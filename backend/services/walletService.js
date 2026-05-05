const { WalletModel } = require("../model/WalletModel");

const getOrCreateWallet = async (userId) => {
  let wallet = await WalletModel.findOne({ userId });
  if (!wallet) {
    wallet = new WalletModel({ userId, balance: 100000 });
    await wallet.save();
  }
  return wallet;
};

module.exports = { getOrCreateWallet };
