const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { HoldingsModel } = require('./model/HoldingsModel');
const { PositionsModel } = require('./model/PositionsModel');
const { WatchlistModel } = require('./model/WatchlistModel');



async function updatePrices() {
  try {
    // 1. Get all unique tickers from both collections
    const holdings = await HoldingsModel.find({}, 'name');
    const positions = await PositionsModel.find({}, 'name');
    const watchlists = await WatchlistModel.find({}, 'name');
    
    const uniqueTickers = new Set([
      ...holdings.map(h => h.name),
      ...positions.map(p => p.name),
      ...watchlists.map(w => w.name)
    ]);

    if (uniqueTickers.size === 0) return;

    // 2. Fetch prices from Yahoo Finance concurrently
    const fetchPromises = Array.from(uniqueTickers).map(async (ticker) => {
      try {
        let quote;
        try {
          quote = await yahooFinance.quote(ticker + '.NS');
        } catch (err) {
          quote = await yahooFinance.quote(ticker);
        }
        const currentPrice = quote.regularMarketPrice;
        
        if (currentPrice !== undefined && currentPrice !== null) {
          // 3. Update the price field in both collections
          await HoldingsModel.updateMany({ name: ticker }, { price: currentPrice });
          await PositionsModel.updateMany({ name: ticker }, { price: currentPrice });
          await WatchlistModel.updateMany({ name: ticker }, { price: currentPrice });
          console.log(`[Yahoo Finance] Updated ${ticker} to ₹${currentPrice}`);
        }
      } catch (err) {
        console.error(`[Yahoo Finance Error] Failed to fetch/update price for ${ticker}. Make sure the symbol exists on Yahoo Finance.`);
      }
    });

    await Promise.allSettled(fetchPromises);
  } catch (error) {
    console.error('Error in price updater interval:', error);
  }
}

function startPriceUpdater() {
  console.log('⏳ Starting live price updater (runs every 10 seconds)...');
  
  // Run immediately once
  updatePrices();
  
  // Set interval for every 10 seconds (10000 ms)
  setInterval(updatePrices, 10000);
}

module.exports = startPriceUpdater;
