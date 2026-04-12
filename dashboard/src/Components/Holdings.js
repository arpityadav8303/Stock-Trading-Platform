import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";

const toNumber = (value) => Number(value) || 0;
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isClosingSelected, setIsClosingSelected] = useState(false);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    const fetchHoldings = () => {
      api.get("/allHoldings").then((res) => {
        setAllHoldings(res.data || []);
      });
    };
    fetchHoldings();
  }, [generalContext.tradeRefreshTrigger]);

  useEffect(() => {
    const ids = new Set(allHoldings.map((s, idx) => s._id || `${s.name}-${idx}`));
    setSelectedRows((prev) => prev.filter((id) => ids.has(id)));
  }, [allHoldings]);

  const totalInvestment = allHoldings.reduce(
    (acc, stock) => acc + toNumber(stock.avg) * toNumber(stock.qty),
    0
  );
  const currentValue = allHoldings.reduce(
    (acc, stock) => acc + toNumber(stock.price) * toNumber(stock.qty),
    0
  );
  const totalPnL = currentValue - totalInvestment;
  const pnlClass = totalPnL >= 0 ? "profit" : "loss";
  const pnlPercent = totalInvestment > 0 ? ((totalPnL / totalInvestment) * 100).toFixed(2) : 0;

  const toggleRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === allHoldings.length) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows(allHoldings.map((s, idx) => s._id || `${s.name}-${idx}`));
  };

  const handleCloseSelected = async () => {
    const selectedStocks = allHoldings.filter((s, idx) =>
      selectedRows.includes(s._id || `${s.name}-${idx}`)
    );
    if (selectedStocks.length === 0) {
      return;
    }

    setIsClosingSelected(true);
    try {
      await Promise.all(
        selectedStocks.map((stock) =>
          api.post("/newOrder", {
            name: stock.name,
            qty: toNumber(stock.qty),
            price: toNumber(stock.price),
            mode: "SELL",
          })
        )
      );

      setSelectedRows([]);
      generalContext.notifyTradeComplete();
      alert(`${selectedStocks.length} holding(s) closed successfully`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to close selected holdings");
    } finally {
      setIsClosingSelected(false);
    }
  };

  return (
    <div className="holdings-page">
      <div className="holdings-header" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <h3 className="title" style={{ margin: 0 }}>
            Holdings ({allHoldings.length})
          </h3>
          <button
            className="btn btn-primary"
            style={{
              padding: "8px 14px",
              fontSize: "0.78rem",
              borderRadius: "6px",
              background: selectedRows.length ? "var(--danger)" : "#cbd5e1",
              cursor: selectedRows.length && !isClosingSelected ? "pointer" : "not-allowed",
            }}
            disabled={!selectedRows.length || isClosingSelected}
            onClick={handleCloseSelected}
          >
            {isClosingSelected ? "Closing..." : `Close Selected (${selectedRows.length})`}
          </button>
        </div>

        <div className="section" style={{ padding: "24px" }}>
          <div className="stat-group">
            <div>
              <p className="stat-label">Total Investment</p>
              <h4 style={{ margin: "8px 0", fontSize: "1.5rem", fontWeight: "700" }}>₹{formatMoney(totalInvestment)}</h4>
            </div>
            <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
              <p className="stat-label">Current Value</p>
              <h4 style={{ margin: "8px 0", fontSize: "1.5rem", fontWeight: "700" }}>₹{formatMoney(currentValue)}</h4>
            </div>
            <div style={{ paddingLeft: "32px", borderLeft: "1px solid var(--border-light)" }}>
              <p className="stat-label">Total P&amp;L</p>
              <h4 className={pnlClass} style={{ margin: "8px 0", fontSize: "1.5rem", fontWeight: "700" }}>
                {totalPnL >= 0 ? "+" : ""}₹{formatMoney(totalPnL)}
                <span style={{ fontSize: "0.9rem", marginLeft: "10px", opacity: 0.8 }}>({pnlPercent}%)</span>
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allHoldings.length > 0 && selectedRows.length === allHoldings.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all holdings"
                />
              </th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&amp;L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const rowId = stock._id || `${stock.name}-${index}`;
              const qty = toNumber(stock.qty);
              const avg = toNumber(stock.avg);
              const price = toNumber(stock.price);
              const curValue = price * qty;
              const pnlValue = curValue - avg * qty;
              const isProfit = pnlValue >= 0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={rowId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowId)}
                      onChange={() => toggleRow(rowId)}
                      aria-label={`Select ${stock.name}`}
                    />
                  </td>
                  <td style={{ fontWeight: "700", color: "var(--text-main)" }}>{stock.name}</td>
                  <td>{qty}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{avg.toFixed(2)}</td>
                  <td style={{ fontFamily: "JetBrains Mono", fontWeight: "600" }}>{price.toFixed(2)}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{curValue.toFixed(2)}</td>
                  <td className={profClass} style={{ fontWeight: "600", fontFamily: "JetBrains Mono" }}>
                    {isProfit ? "+" : ""}
                    {pnlValue.toFixed(2)}
                  </td>
                  <td className={profClass}>{stock.net || "0.00%"}</td>
                  <td className={dayClass}>{stock.day || "0.00%"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "6px 16px", fontSize: "0.75rem", borderRadius: "6px" }}
                      onClick={() => generalContext.openSellWindow(stock.name, stock.price)}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holdings;

