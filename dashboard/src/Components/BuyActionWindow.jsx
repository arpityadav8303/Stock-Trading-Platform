import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const toNumber = (value) => Number(value) || 0;
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BuyActionWindow = ({ uid }) => {
  const generalContext = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(toNumber(generalContext.selectedStockPrice));
  const [userFunds, setUserFunds] = useState(0);

  useEffect(() => {
    api.get("/userFunds").then((res) => {
      setUserFunds(toNumber(res.data.balance));
    });
  }, []);

  const handleBuyClick = async () => {
    const quantity = toNumber(stockQuantity);
    const price = toNumber(stockPrice);

    if (quantity <= 0 || price <= 0) {
      generalContext.showNotification("Quantity and price must be greater than 0", "error");
      return;
    }

    const totalCost = quantity * price;
    if (totalCost > userFunds) {
      generalContext.showNotification("Insufficient funds in your wallet", "error");
      return;
    }

    try {
      await api.post("/newOrder", {
        name: uid,
        qty: quantity,
        price,
        mode: "BUY",
      });

      await api.post("/addPosition", {
        product: "CNC",
        name: uid,
        qty: quantity,
        avg: price,
        price,
        net: "0.00%",
        day: "0.00%",
        isLoss: false,
      });

      generalContext.showNotification(`Bought ${quantity} share(s) of ${uid}`, "success");
      generalContext.notifyTradeComplete();
      generalContext.closeBuyWindow();
    } catch (error) {
      generalContext.showNotification(error.response?.data?.message || "Failed to place order", "error");
    }
  };

  const totalCost = toNumber(stockQuantity) * toNumber(stockPrice);

  return (
    <div className="modal-overlay">
      <div className="container" id="buy-window">
        <div className="buy-header">
          <p>
            Buy {uid} x {toNumber(stockQuantity)} Qty
          </p>
          <button className="close-btn" onClick={() => generalContext.closeBuyWindow()}>
            &times;
          </button>
        </div>
        <div className="regular-order">
          <div className="inputs">
            <fieldset>
              <legend>Qty.</legend>
              <input
                type="number"
                name="qty"
                min="1"
                autoFocus
                onChange={(e) => setStockQuantity(e.target.value)}
                value={stockQuantity}
              />
            </fieldset>
            <fieldset>
              <legend>Price</legend>
              <input
                type="number"
                name="price"
                step="0.05"
                min="0"
                onChange={(e) => setStockPrice(e.target.value)}
                value={stockPrice}
              />
            </fieldset>
          </div>
        </div>

        <div className="buttons">
          <div className="margin-info">
            <p>
              Margin required: <span>₹{formatMoney(totalCost)}</span>
            </p>
            <p>
              Available: <span>₹{formatMoney(userFunds)}</span>
            </p>
          </div>
          <div className="modal-actions">
            <button className="btn btn-blue" onClick={handleBuyClick}>
              Buy
            </button>
            <button className="btn btn-grey" onClick={() => generalContext.closeBuyWindow()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;

