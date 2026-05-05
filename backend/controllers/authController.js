const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");
const { UserModel } = require("../model/UserModel");
const { WatchlistModel } = require("../model/WatchlistModel");
const { getOrCreateWallet } = require("../services/walletService");
const { signJwt, hashPassword, verifyPassword } = require("../utils/security");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const buildUserToken = (user) =>
  signJwt(
    {
      userId: String(user._id),
      email: user.email,
      fullName: user.fullName,
    },
    JWT_SECRET,
    60 * 60 * 24 * 7
  );

const register = async (req, res) => {
  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new UserModel({
      fullName,
      email,
      passwordHash: hashPassword(password),
    });
    await user.save();

    await getOrCreateWallet(String(user._id));

    const token = buildUserToken(user);
    return res.status(201).json({
      token,
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Failed to register" });
  }
};

const login = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await getOrCreateWallet(String(user._id));

    const token = buildUserToken(user);
    return res.json({
      token,
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Failed to login" });
  }
};

const me = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.userId);
    const [holdingsCount, positionsCount, watchlistCount] = await Promise.all([
      HoldingsModel.countDocuments({ userId: req.user.userId }),
      PositionsModel.countDocuments({ userId: req.user.userId, qty: { $gt: 0 } }),
      WatchlistModel.countDocuments({ userId: req.user.userId }),
    ]);

    return res.json({
      user: {
        id: req.user.userId,
        fullName: req.user.fullName,
        email: req.user.email,
      },
      stats: {
        walletBalance: wallet.balance,
        holdingsCount,
        positionsCount,
        watchlistCount,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

module.exports = { register, login, me };
