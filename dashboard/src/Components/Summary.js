import React, { useState, useEffect } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import { DoughnutChart } from "./DoughnoutChart";

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
  const generalContext = React.useContext(GeneralContext);

  useEffect(() => {
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
      .catch((err) => console.error("Error fetching summary data:", err));
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

  const chartData = {
    labels: watchlist.map((s) => s.name),
    datasets: [
      {
        label: "Price",
        data: watchlist.map((s) => toNumber(s.price)),
        backgroundColor: [
          "#4f46e5",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
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
      <div className="username">
        <h3 className="title" style={{ marginBottom: "8px" }}>
          Dashboard Overview
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>
          Welcome back! Here's what's happening with your portfolio today.
        </p>
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

