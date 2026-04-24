import React, { useState, useEffect } from "react";
import api from "../api";
import RazorpayModal from "./RazorpayModal";
import WithdrawModal from "./WithdrawModal";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Funds = () => {
  const [balance, setBalance] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = () => {
    api.get("/userFunds").then((res) => {
      setBalance(res.data.balance || 0);
    });
  };

  const handleAddFunds = (amount) => {
    api
      .post("/addFunds", { amount: Number(amount) })
      .then((res) => {
        setBalance(res.data.balance || 0);
      });
  };

  const handleWithdrawFunds = (amount) => {
    api
      .post("/withdrawFunds", { amount: Number(amount) })
      .then((res) => {
        setBalance(res.data.balance || 0);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Withdrawal failed");
      });
  };

  return (
    <div className="funds-page">
      <div className="hero-panel">
        <div className="hero-panel-copy">
          <span className="hero-eyebrow">Capital Desk</span>
          <h3 className="title" style={{ marginBottom: "8px" }}>Funds Management</h3>
          <p className="hero-text">
            Move money quickly, track usable capital, and keep your trading account ready.
          </p>
        </div>
        <div className="hero-chip-row">
          <div className="hero-chip">
            <span className="hero-chip-label">Available</span>
            <strong>₹{formatMoney(balance)}</strong>
          </div>
          <div className="hero-chip">
            <span className="hero-chip-label">Transfer Type</span>
            <strong>UPI</strong>
          </div>
        </div>
      </div>

      <div className="funds-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Instant, zero-cost fund transfers powered by UPI.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-success" onClick={() => setIsAddModalOpen(true)}>
            Add Funds
          </button>
          <button className="btn btn-primary" onClick={() => setIsWithdrawModalOpen(true)}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="stat-group" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        <div className="section">
          <span className="section-title">Equity</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p className="stat-label">Available Margin</p>
                <h3 className="stat-value" style={{ color: "var(--success)" }}>₹{formatMoney(balance)}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="stat-label">Available Cash</p>
                <p style={{ fontSize: "1.25rem", fontWeight: "700", margin: "4px 0" }}>₹{formatMoney(balance)}</p>
              </div>
            </div>

            <div style={{ padding: "20px", background: "var(--bg-main)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Used Margin</p>
                <p style={{ fontWeight: "600" }}>₹0.00</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Opening Balance</p>
                <p style={{ fontWeight: "600" }}>₹{formatMoney(balance)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section empty-state-panel" style={{ background: "var(--bg-main)", borderStyle: "dashed", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ padding: "32px" }}>
            <p className="section-title" style={{ marginBottom: "16px" }}>Commodity</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              You don't have a commodity account active at the moment.
            </p>
            <button className="btn btn-primary" style={{ background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)" }}>
              Activate Account
            </button>
          </div>
        </div>
      </div>

      <RazorpayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFunds}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawFunds}
        currentBalance={balance}
      />
    </div>
  );
};

export default Funds;
