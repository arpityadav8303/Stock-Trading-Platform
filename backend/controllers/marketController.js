const YahooFinance = require("yahoo-finance2").default;
const { HoldingsModel } = require("../model/HoldingsModel");
const { PositionsModel } = require("../model/PositionsModel");
const { WatchlistModel } = require("../model/WatchlistModel");
const { STOCKS_LIST } = require("../stocksList");

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const MARKET_INDEX_REFRESH_MS = 3000;
const MARKET_INDEX_SYMBOLS = [
  { key: "nifty50", label: "NIFTY 50", symbol: "^NSEI", fallbackPrice: 24000 },
  { key: "sensex", label: "SENSEX", symbol: "^BSESN", fallbackPrice: 77000 },
];

let marketIndicesCache = {
  data: null,
  fetchedAt: 0,
};

const fallbackMarketIndices = MARKET_INDEX_SYMBOLS.map(({ key, label, fallbackPrice }) => ({
  key,
  label,
  price: fallbackPrice,
  change: 0,
  changePercent: 0,
  isUp: true,
  stale: true,
}));

const getCachedMarketIndex = (key) =>
  marketIndicesCache.data?.find((index) => index.key === key) ||
  fallbackMarketIndices.find((index) => index.key === key);

const getMarketIndices = async (req, res) => {
  const now = Date.now();
  if (marketIndicesCache.data && now - marketIndicesCache.fetchedAt < MARKET_INDEX_REFRESH_MS) {
    return res.json(marketIndicesCache.data);
  }

  const quotes = await Promise.all(
    MARKET_INDEX_SYMBOLS.map(async ({ key, label, symbol }) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        const price = Number(quote.regularMarketPrice) || 0;
        const previousClose = Number(quote.regularMarketPreviousClose) || price;
        if (!price) {
          throw new Error(`Missing price for ${symbol}`);
        }

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
      } catch (error) {
        console.error(`Error fetching market index ${symbol}:`, error.message || error);
        return getCachedMarketIndex(key);
      }
    })
  );

  if (quotes.some((quote) => !quote?.stale)) {
    marketIndicesCache = {
      data: quotes,
      fetchedAt: now,
    };
  }

  return res.json(quotes);
};

const getStockChart = async (req, res) => {
  const stockName = String(req.params.symbol || "").trim().toUpperCase();
  const requestedRange = String(req.query.range || "1mo").trim();
  const allowedRanges = new Set(["5d", "1mo", "3mo", "6mo", "1y"]);
  const range = allowedRanges.has(requestedRange) ? requestedRange : "1mo";

  if (!stockName) {
    return res.status(400).json({ message: "Stock symbol is required" });
  }

  try {
    const buildChartQuery = () => {
      const now = new Date();
      const period1 = new Date(now);

      if (range === "5d") {
        period1.setDate(now.getDate() - 5);
        return { period1, period2: now, interval: "5m" };
      }
      if (range === "3mo") {
        period1.setMonth(now.getMonth() - 3);
      } else if (range === "6mo") {
        period1.setMonth(now.getMonth() - 6);
      } else if (range === "1y") {
        period1.setFullYear(now.getFullYear() - 1);
      } else {
        period1.setMonth(now.getMonth() - 1);
      }

      return { period1, period2: now, interval: "1d" };
    };

    const fetchChart = async () => {
      const query = buildChartQuery();
      const symbolsToTry = [`${stockName}.NS`, `${stockName}.BO`, stockName];
      let lastError;

      for (const symbol of symbolsToTry) {
        try {
          const result = await yahooFinance.chart(symbol, query);
          if (result?.quotes?.length) {
            return result;
          }
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError || new Error("No chart data found");
    };

    const [chartResult, holding, position] = await Promise.all([
      fetchChart(),
      HoldingsModel.findOne({ userId: req.user.userId, name: stockName }),
      PositionsModel.findOne({ userId: req.user.userId, name: stockName }),
    ]);

    const points = (chartResult?.quotes || [])
      .filter((quote) => Number.isFinite(Number(quote.close)) && quote.date)
      .map((quote) => ({
        date: quote.date,
        close: Number(quote.close),
        open: Number(quote.open) || Number(quote.close),
        high: Number(quote.high) || Number(quote.close),
        low: Number(quote.low) || Number(quote.close),
        volume: Number(quote.volume) || 0,
      }));

    if (!points.length) {
      return res.status(404).json({ message: "No chart data found for this stock" });
    }

    const latestPrice = Number(chartResult?.meta?.regularMarketPrice) || points[points.length - 1].close;
    const previousClose = Number(chartResult?.meta?.previousClose) || latestPrice;

    return res.json({
      symbol: stockName,
      range,
      currency: chartResult?.meta?.currency || "INR",
      latestPrice,
      previousClose,
      change: latestPrice - previousClose,
      changePercent: previousClose > 0 ? ((latestPrice - previousClose) / previousClose) * 100 : 0,
      points,
      holding: holding
        ? {
            qty: Number(holding.qty) || 0,
            avg: Number(holding.avg) || 0,
          }
        : null,
      position: position
        ? {
            qty: Number(position.qty) || 0,
            avg: Number(position.avg) || 0,
            product: position.product || "MIS",
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching stock chart:", error);
    return res.status(500).json({ message: "Failed to fetch chart for this stock" });
  }
};

const searchStocks = async (req, res) => {
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
};

module.exports = { getMarketIndices, getStockChart, searchStocks };
