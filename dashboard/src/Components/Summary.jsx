import React, { useState, useEffect } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import { DoughnutChart } from "./DoughnoutChart";

const REFRESH_INTERVAL_MS = 10000;
const toNumber = (value) => Number(value) || 0;
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Summary = () => {
  const [holdings, setHoldings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const generalContext = React.useContext(GeneralContext);

  useEffect(() => {
    const fetchSummaryData = () => {
      Promise.all([
        api.get("/allHoldings"),
        api.get("/userFunds"),
        api.get("/allWatchlist"),
      ])
        .then(([hRes, bRes, wRes]) => {
          setHoldings(hRes.data || []);
          setBalance(bRes.data?.balance || 0);
          setWatchlist(wRes.data || []);
        })
        .catch((err) => console.error("Error fetching summary data:", err))
        .finally(() => setIsLoading(false));
    };

    fetchSummaryData();
    const intervalId = setInterval(fetchSummaryData, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [generalContext.tradeRefreshTrigger]);

  const totalInvestment = holdings.reduce(
    (acc, stock) => acc + toNumber(stock.avg) * toNumber(stock.qty),
    0
  );
  const currentValue = holdings.reduce(
    (acc, stock) => acc + toNumber(stock.price) * toNumber(stock.qty),
    0
  );
  const pnl = currentValue - totalInvestment;
  const pnlPercent = totalInvestment > 0 ? ((pnl / totalInvestment) * 100).toFixed(2) : 0;
  const positiveHoldings = holdings.filter((stock) => String(stock.net || "").startsWith("+")).length;
  const negativeHoldings = Math.max(holdings.length - positiveHoldings, 0);
  const topHolding = holdings.reduce((best, stock) => {
    if (!best) return stock;

    const bestValue = toNumber(best.price) * toNumber(best.qty);
    const stockValue = toNumber(stock.price) * toNumber(stock.qty);
    return stockValue > bestValue ? stock : best;
  }, null);

  const chartData = {
    labels: watchlist.map((s) => s.name),
    datasets: [
      {
        label: "Price",
        data: watchlist.map((s) => toNumber(s.price)),
        backgroundColor: [
          "#2563eb",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#0f766e",
          "#ec4899",
          "#06b6d4",
          "#84cc16",
          "#f97316",
          "#14b8a6",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="summary-page">
      <div className="hero-panel">
        <div className="hero-panel-copy">
          <span className="hero-eyebrow">Market Snapshot</span>
          <h3 className="title" style={{ marginBottom: "8px" }}>
            Dashboard Overview
          </h3>
          <p className="hero-text">
            Track capital, live exposure, and your strongest portfolio signals in one place.
          </p>
        </div>
        <div className="hero-chip-row">
          <div className="hero-chip">
            <span className="hero-chip-label">Holdings</span>
            <strong>{holdings.length}</strong>
          </div>
          <div className="hero-chip">
            <span className="hero-chip-label">Watchlist</span>
            <strong>{watchlist.length}</strong>
          </div>
          <div className="hero-chip">
            <span className="hero-chip-label">Refresh</span>
            <strong>3s</strong>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-mini-card">
          <span className="summary-mini-label">Portfolio Mood</span>
          <strong className={pnl >= 0 ? "profit" : "loss"}>
            {pnl >= 0 ? "In Profit" : "Under Pressure"}
          </strong>
          <p>{positiveHoldings} green and {negativeHoldings} red counters right now.</p>
        </div>
        <div className="summary-mini-card">
          <span className="summary-mini-label">Top Exposure</span>
          <strong>{topHolding?.name || "No holdings yet"}</strong>
          <p>
            {topHolding
              ? `₹${formatMoney(toNumber(topHolding.price) * toNumber(topHolding.qty))} current value`
              : "Add your first holding to unlock deeper portfolio insights."}
          </p>
        </div>
        <div className="summary-mini-card">
          <span className="summary-mini-label">Cash Readiness</span>
          <strong>₹{formatMoney(balance)}</strong>
          <p>{balance > 0 ? "Capital ready for the next trade setup." : "No available balance right now."}</p>
        </div>
      </div>

      <div className="section">
        <span className="section-title">Equity Summary</span>
        <div className="stat-group">
          <div>
            <p className="stat-label">Available Margin</p>
            <h3 className="stat-value">₹{formatMoney(balance)}</h3>
          </div>
          <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
            <p className="stat-label">Margins Used</p>
            <h3 className="stat-value" style={{ fontSize: "1.5rem", marginTop: "16px" }}>
              ₹0.00
            </h3>
          </div>
          <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
            <p className="stat-label">Opening Balance</p>
            <h3 className="stat-value" style={{ fontSize: "1.5rem", marginTop: "16px" }}>
              ₹{formatMoney(balance)}
            </h3>
          </div>
        </div>
      </div>

      <div className="section">
        <span className="section-title">Portfolio Holdings ({holdings.length})</span>
        <div className="stat-group">
          <div>
            <p className="stat-label">Total Unrealized P&amp;L</p>
            <h3 className={`stat-value ${pnl >= 0 ? "profit" : "loss"}`}>
              {pnl >= 0 ? "+" : ""}₹{formatMoney(pnl)}
              <small style={{ fontSize: "0.9rem", marginLeft: "12px", fontWeight: "600" }}>
                {pnlPercent}%
              </small>
            </h3>
          </div>
          <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value" style={{ fontSize: "1.5rem", marginTop: "16px" }}>
              ₹{formatMoney(currentValue)}
            </h3>
          </div>
          <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
            <p className="stat-label">Total Investment</p>
            <h3 className="stat-value" style={{ fontSize: "1.5rem", marginTop: "16px" }}>
              ₹{formatMoney(totalInvestment)}
            </h3>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="section empty-state-panel">
          <span className="section-title">Loading</span>
          <div className="empty-state-icon">...</div>
          <p>Refreshing portfolio metrics and watchlist allocation.</p>
        </div>
      )}

      {!isLoading && holdings.length === 0 && (
        <div className="section empty-state-panel">
          <span className="section-title">Portfolio Starter</span>
          <div className="empty-state-icon">+</div>
          <p>
            No holdings yet. Once you place your first order, this dashboard will light up with live
            allocation and P&amp;L insights.
          </p>
        </div>
      )}

      {watchlist.length > 0 && (
        <div className="section">
          <span className="section-title">Watchlist Distribution</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "320px",
              margin: "0 auto",
              padding: "16px 0",
            }}
          >
            <DoughnutChart data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
