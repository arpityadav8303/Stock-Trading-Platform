import React, { useEffect, useState } from "react";
import api from "../api";

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
        <div className="no-orders">
          <p>You have not placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="title">Order History ({orders.length})</h3>
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
                <td>{order.name}</td>
                <td className={order.mode === "BUY" ? "profit" : "loss"}>{order.mode}</td>
                <td>{Number(order.qty || 0).toFixed(2)}</td>
                <td>{Number(order.price || 0).toFixed(2)}</td>
                <td>{Number((order.qty || 0) * (order.price || 0)).toFixed(2)}</td>
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
