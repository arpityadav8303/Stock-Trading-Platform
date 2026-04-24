import React, { useEffect, useState } from "react";
import api from "../api";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/allOrders")
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]));
  }, []);

  if (!orders.length) {
    return (
      <div className="orders">
        <div className="section empty-state-panel">
          <span className="section-title">Order Flow</span>
          <div className="empty-state-icon">..</div>
          <p>
            You have not placed any orders yet. Your executed trades will appear here with mode,
            value, and timestamp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero-panel">
        <div className="hero-panel-copy">
          <span className="hero-eyebrow">Execution Ledger</span>
          <h3 className="title">Order History ({orders.length})</h3>
          <p className="hero-text">Review every buy and sell with clean trade-level detail.</p>
        </div>
      </div>
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Mode</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: "700" }}>{order.name}</td>
                <td className={order.mode === "BUY" ? "profit" : "loss"}>{order.mode}</td>
                <td>{Number(order.qty || 0).toFixed(2)}</td>
                <td>₹{formatMoney(order.price || 0)}</td>
                <td>₹{formatMoney((order.qty || 0) * (order.price || 0))}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
