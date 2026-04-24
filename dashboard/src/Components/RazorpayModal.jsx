import React, { useState } from "react";
import "./RazorpayModal.css";

const RazorpayModal = ({ isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input"); // input, processing, success

  if (!isOpen) return null;

  const handlePay = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
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
    }, 2000);
  };

  return (
    <div className="razorpay-overlay">
      <div className="razorpay-modal">
        <div className="razorpay-header">
          <img src="https://razorpay.com/favicon.png" alt="RP" width="24" />
          <span>Razorpay Trusted</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {step === "input" && (
          <div className="razorpay-body">
            <div className="merchant-info">
              <h3>Stock Trading App</h3>
              <p>Add funds to your wallet</p>
            </div>
            <div className="amount-input">
              <label>Amount (â‚¹)</label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <button className="pay-btn" onClick={handlePay}>
              PROCEED TO PAY
            </button>
            <div className="methods">
              <small>Cards, UPI, Netbanking, Wallet</small>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="razorpay-body status">
            <div className="loader"></div>
            <p>Processing your payment...</p>
            <small>Do not refresh or close this window</small>
          </div>
        )}

        {step === "success" && (
          <div className="razorpay-body status">
            <div className="success-icon">&#10004;</div>
            <h3>Payment Successful</h3>
            <p>â‚¹{amount} added to your wallet</p>
          </div>
        )}

        <div className="razorpay-footer">
          <p>Powered by Razorpay</p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
