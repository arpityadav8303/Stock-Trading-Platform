import React, { useEffect, useState } from "react";
import api from "../api";
import Menu from "./Menu";

const REFRESH_INTERVAL_MS = 3000;
const FALLBACK_INDICES = [
  { key: "nifty50", label: "NIFTY 50", price: 0, changePercent: 0, isUp: true },
  { key: "sensex", label: "SENSEX", price: 0, changePercent: 0, isUp: true },
];

const formatIndexValue = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatChangePercent = (value) =>
  `${value >= 0 ? "+" : ""}${Number(value || 0).toFixed(2)}%`;

const TopBar = () => {
  const [indices, setIndices] = useState(FALLBACK_INDICES);

  useEffect(() => {
    const fetchMarketIndices = () => {
      api
        .get("/marketIndices")
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length) {
            setIndices(res.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching market indices:", error);
        });
    };

    fetchMarketIndices();
    const intervalId = setInterval(fetchMarketIndices, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="topbar-container">
      <div className="logo-section">
        <div className="brand-mark">
          <img
            src="logo.svg"
            alt="App Logo"
            className="logo"
            style={{ width: "22px", filter: "brightness(0) invert(1)" }}
          />
        </div>
        <div className="brand-copy">
          <span className="brand-name">FINSPRINT</span>
          <span className="brand-tagline">Trading workspace</span>
        </div>
      </div>

      <div className="indices-container">
        {indices.map((index) => {
          const trendClass = index.isUp ? "up" : "down";

          return (
            <div className="market-pill" key={index.key}>
              <span className="index-label">{index.label}</span>
              <span className={`index-value ${trendClass}`}>{formatIndexValue(index.price)}</span>
              <span className={`market-change ${trendClass}`}>
                {formatChangePercent(index.changePercent)}
              </span>
            </div>
          );
        })}
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
