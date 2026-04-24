const YahooFinance = require("yahoo-finance2").default;

const yahooFinance = new YahooFinance();
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { WatchlistModel } = require("./model/WatchlistModel");

const REFRESH_INTERVAL_MS = 3000;
let isUpdating = false;

const toNumber = (value) => Number(value) || 0;
const formatSignedPercent = (value) => {
  const numericValue = Number.isFinite(value) ? value : 0;
  return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(2)}%`;
};

async function updatePrices() {
  if (isUpdating) {
    console.log("[Yahoo Finance] Skipping update because the previous cycle is still running.");
    return;
  }

  isUpdating = true;

  try {
    const holdings = await HoldingsModel.find({}, "name");
    const positions = await PositionsModel.find({}, "name");
    const watchlists = await WatchlistModel.find({}, "name");

    const uniqueTickers = new Set([
      ...holdings.map((holding) => holding.name),
      ...positions.map((position) => position.name),
      ...watchlists.map((watchlist) => watchlist.name),
    ]);

    if (uniqueTickers.size === 0) {
      return;
    }

    const fetchPromises = Array.from(uniqueTickers).map(async (ticker) => {
      try {
        let quote;

        try {
          quote = await yahooFinance.quote(`${ticker}.NS`);
        } catch (error) {
          quote = await yahooFinance.quote(ticker);
        }

        const currentPrice = quote.regularMarketPrice;
        const previousClose = toNumber(quote.regularMarketPreviousClose) || toNumber(currentPrice);
        const dayChangePercent =
          previousClose > 0 ? ((toNumber(currentPrice) - previousClose) / previousClose) * 100 : 0;

        if (currentPrice !== undefined && currentPrice !== null) {
          const [holdings, positions] = await Promise.all([
            HoldingsModel.find({ name: ticker }),
            PositionsModel.find({ name: ticker }),
          ]);

          await Promise.all([
            ...holdings.map((holding) => {
              const avg = toNumber(holding.avg);
              const netChangePercent = avg > 0 ? ((toNumber(currentPrice) - avg) / avg) * 100 : 0;

              return HoldingsModel.updateOne(
                { _id: holding._id },
                {
                  price: currentPrice,
                  net: formatSignedPercent(netChangePercent),
                  day: formatSignedPercent(dayChangePercent),
                  isLoss: dayChangePercent < 0,
                }
              );
            }),
            ...positions.map((position) => {
              const avg = toNumber(position.avg);
              const netChangePercent = avg > 0 ? ((toNumber(currentPrice) - avg) / avg) * 100 : 0;

              return PositionsModel.updateOne(
                { _id: position._id },
                {
                  price: currentPrice,
                  net: formatSignedPercent(netChangePercent),
                  day: formatSignedPercent(dayChangePercent),
                  isLoss: dayChangePercent < 0,
                }
              );
            }),
            WatchlistModel.updateMany(
              { name: ticker },
              {
                price: currentPrice,
                percent: formatSignedPercent(dayChangePercent),
                isDown: dayChangePercent < 0,
              }
            ),
          ]);

          console.log(`[Yahoo Finance] Updated ${ticker} to Rs.${currentPrice}`);
        }
      } catch (error) {
        console.error(
          `[Yahoo Finance Error] Failed to fetch/update price for ${ticker}. Make sure the symbol exists on Yahoo Finance.`
        );
      }
    });

    await Promise.allSettled(fetchPromises);
  } catch (error) {
    console.error("Error in price updater interval:", error);
  } finally {
    isUpdating = false;
  }
}

function startPriceUpdater() {
  console.log(
    `[Yahoo Finance] Starting live price updater (runs every ${REFRESH_INTERVAL_MS / 1000} seconds)...`
  );

  updatePrices();
  setInterval(updatePrices, REFRESH_INTERVAL_MS);
}

module.exports = startPriceUpdater;
