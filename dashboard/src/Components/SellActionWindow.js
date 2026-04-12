import React, { useState, useContext } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const toNumber = (value) => Number(value) || 0;
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SellActionWindow = ({ uid }) => {
  const generalContext = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(toNumber(generalContext.selectedStockPrice));

  const handleSellClick = async () => {
    const quantity = toNumber(stockQuantity);
    const price = toNumber(stockPrice);

    if (quantity <= 0 || price <= 0) {
      alert("Quantity and price must be greater than 0");
      return;
    }

    try {
      await api.post("/newOrder", {
        name: uid,
        qty: quantity,
        price,
        mode: "SELL",
      });

      alert(`Successfully sold ${quantity} shares of ${uid}`);
      generalContext.notifyTradeComplete();
      generalContext.closeSellWindow();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place sell order");
    }
  };

  const credit = toNumber(stockQuantity) * toNumber(stockPrice);

  return (
    <div className="modal-overlay">
      <div className="container" id="sell-window" style={{ borderColor: "#ff5252" }}>
        <div className="buy-header" style={{ background: "#ff5252" }}>
          <p>
            Sell {uid} x {toNumber(stockQuantity)} Qty
          </p>
          <button className="close-btn" onClick={() => generalContext.closeSellWindow()}>
            &times;
          </button>
        </div>
        <div className="regular-order">
          <div className="inputs">
            <fieldset>
              <legend>Qty.</legend>
              <input
                type="number"
                min="1"
                autoFocus
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </fieldset>
            <fieldset>
              <legend>Price</legend>
              <input
                type="number"
                step="0.05"
                min="0"
                value={stockPrice}
                onChange={(e) => setStockPrice(e.target.value)}
              />
            </fieldset>
          </div>
        </div>

        <div className="buttons">
          <div className="margin-info">
            <p>
              Credit: <span>₹{formatMoney(credit)}</span>
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn" style={{ background: "#ff5252", color: "#fff" }} onClick={handleSellClick}>
              Sell
            </button>
            <button className="btn btn-grey" onClick={() => generalContext.closeSellWindow()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;

