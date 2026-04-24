const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance();

async function testChart() {
  const stockName = "RELIANCE";
  const now = new Date();
  const period1 = new Date(now);
  period1.setDate(now.getDate() - 5);

  const query5m = { period1, period2: now, interval: "5m" };
  const query15m = { period1, period2: now, interval: "15m" };
  const symbol = `${stockName}.NS`;

  try {
    console.log(`Fetching 5m chart for ${symbol}...`);
    const res5m = await yahooFinance.chart(symbol, query5m);
    console.log("5m Quotes count:", res5m?.quotes?.length);

    console.log(`Fetching 15m chart for ${symbol}...`);
    const res15m = await yahooFinance.chart(symbol, query15m);
    console.log("15m Quotes count:", res15m?.quotes?.length);
  } catch (error) {
    console.error("Error:", error);
  }
}

testChart();
