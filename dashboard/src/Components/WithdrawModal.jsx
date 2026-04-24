import React, { useState } from "react";
import "./RazorpayModal.css"; // Reuse styling for consistency

const WithdrawModal = ({ isOpen, onClose, onConfirm, currentBalance }) => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input");

  if (!isOpen) return null;

  const handleWithdraw = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (Number(amount) > currentBalance) {
      alert("Insufficient funds in wallet");
      return;
    }
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      onConfirm(amount);
      setTimeout(() => {
        onClose();
        setStep("input");
        setAmount("");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="razorpay-overlay">
      <div className="razorpay-modal">
        <div className="razorpay-header" style={{ background: "#2c3e50" }}>
          <span>Secure Withdrawal</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {step === "input" && (
          <div className="razorpay-body">
            <div className="merchant-info">
              <h3>Withdraw Funds</h3>
              <p>Transfer money back to your bank account</p>
              <small style={{color: "#666"}}>Available: â‚¹{currentBalance.toLocaleString("en-IN")}</small>
            </div>
            <div className="amount-input" style={{ marginTop: "20px" }}>
              <label>Withdraw Amount (â‚¹)</label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <button className="pay-btn" onClick={handleWithdraw} style={{ background: "#2c3e50" }}>
              WITHDRAW TO BANK
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="razorpay-body status">
            <div className="loader" style={{ borderTopColor: "#2c3e50" }}></div>
            <p>Processing withdrawal...</p>
          </div>
        )}

        {step === "success" && (
          <div className="razorpay-body status">
            <div className="success-icon" style={{ background: "#2c3e50" }}>&#10004;</div>
            <h3>Withdrawal Initiated</h3>
            <p>â‚¹{amount} will be credited to your bank soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
