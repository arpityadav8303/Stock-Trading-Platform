const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrderModel } = require("./model/OrderModel");
const { WatchlistModel } = require("./model/WatchlistModel");
const { WalletModel } = require("./model/WalletModel");
const { UserModel } = require("./model/UserModel");
const { STOCKS_LIST } = require("./stocksList");
const { signJwt, verifyJwt, hashPassword, verifyPassword } = require("./utils/security");
require("dotenv").config();
const startPriceUpdater = require("./priceUpdater");
const YahooFinance = require("yahoo-finance2").default;

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const yahooFinance = new YahooFinance();
const MARKET_INDEX_REFRESH_MS = 3000;
const MARKET_INDEX_SYMBOLS = [
  { key: "nifty50", label: "NIFTY 50", symbol: "^NSEI" },
  { key: "sensex", label: "SENSEX", symbol: "^BSESN" },
];

let marketIndicesCache = {
  data: null,
  fetchedAt: 0,
};

app.use(cors());
app.use(bodyParser.json());

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

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyJwt(token, JWT_SECRET);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      userId: String(user._id),
      email: user.email,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const getOrCreateWallet = async (userId) => {
  let wallet = await WalletModel.findOne({ userId });
  if (!wallet) {
    wallet = new WalletModel({ userId, balance: 100000 });
    await wallet.save();
  }
  return wallet;
};

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

app.get("/", (req, res) => {
  res.send("Hello World! Your server is working.");
});

app.post("/auth/register", async (req, res) => {
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
});

app.post("/auth/login", async (req, res) => {
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
});

app.get("/auth/me", requireAuth, async (req, res) => {
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
});

app.get("/allHoldings", requireAuth, async (req, res) => {
  const allHoldings = await HoldingsModel.find({ userId: req.user.userId });
  res.json(allHoldings);
});

app.get("/allPositions", requireAuth, async (req, res) => {
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
});

app.get("/allOrders", requireAuth, async (req, res) => {
  const orders = await OrderModel.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

app.get("/allWatchlist", requireAuth, async (req, res) => {
  const allWatchlist = await WatchlistModel.find({ userId: req.user.userId });
  res.json(allWatchlist);
});

app.get("/userFunds", requireAuth, async (req, res) => {
  const wallet = await getOrCreateWallet(req.user.userId);
  res.json({ balance: wallet.balance });
});

app.get("/marketIndices", requireAuth, async (req, res) => {
  try {
    const now = Date.now();
    if (marketIndicesCache.data && now - marketIndicesCache.fetchedAt < MARKET_INDEX_REFRESH_MS) {
      return res.json(marketIndicesCache.data);
    }

    const quotes = await Promise.all(
      MARKET_INDEX_SYMBOLS.map(async ({ key, label, symbol }) => {
        const quote = await yahooFinance.quote(symbol);
        const price = Number(quote.regularMarketPrice) || 0;
        const previousClose = Number(quote.regularMarketPreviousClose) || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        return {
          key,
          label,
          price,
          change,
          changePercent,
          isUp: change >= 0,
        };
      })
    );

    marketIndicesCache = {
      data: quotes,
      fetchedAt: now,
    };

    return res.json(quotes);
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return res.status(500).json({ message: "Failed to fetch market indices" });
  }
});

app.post("/addFunds", requireAuth, async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }
  const wallet = await getOrCreateWallet(req.user.userId);
  wallet.balance += amount;
  await wallet.save();
  res.json({ balance: wallet.balance });
});

app.post("/withdrawFunds", requireAuth, async (req, res) => {
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
});

app.post("/newOrder", requireAuth, async (req, res) => {
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
});

app.post("/addPosition", requireAuth, async (req, res) => {
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
});

app.get("/searchStocks", requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json([]);
  }

  const query = q.toUpperCase().trim();
  const results = STOCKS_LIST.filter(
    (stock) =>
      stock.name.toUpperCase().includes(query) ||
      stock.fullName.toUpperCase().includes(query) ||
      stock.sector.toUpperCase().includes(query)
  ).slice(0, 15);

  const watchlistNames = (await WatchlistModel.find({ userId: req.user.userId }, "name")).map((w) => w.name);
  const enriched = results.map((stock) => ({
    ...stock,
    inWatchlist: watchlistNames.includes(stock.name),
  }));

  res.json(enriched);
});

app.post("/addToWatchlist", requireAuth, async (req, res) => {
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
});

app.delete("/removeFromWatchlist/:name", requireAuth, async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`App is started on port ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to DB");
      startPriceUpdater();
    })
    .catch((err) => console.error("DB connection error:", err));
});
