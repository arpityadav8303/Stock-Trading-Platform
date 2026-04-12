import React from "react";
import Menu from "./Menu";

const TopBar = () => {
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
        <div className="market-pill">
          <span className="index-label">NIFTY 50</span>
          <span className="index-value up">22,345.20</span>
          <span className="market-change up">+0.45%</span>
        </div>
        <div className="market-pill">
          <span className="index-label">SENSEX</span>
          <span className="index-value up">73,456.10</span>
          <span className="market-change up">+0.38%</span>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
