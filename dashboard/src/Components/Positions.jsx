import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";

const REFRESH_INTERVAL_MS = 3000;
const toNumber = (value) => Number(value) || 0;

const Positions = () => {
  const generalContext = useContext(GeneralContext);
  const [allPositions, setAllPositions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isClosingSelected, setIsClosingSelected] = useState(false);

  useEffect(() => {
    const fetchPositions = () => {
      api
        .get("/allPositions")
        .then((res) => {
          setAllPositions(res.data || []);
        })
        .catch((err) => {
          console.error("Error fetching positions:", err);
        });
    };

    fetchPositions();
    const intervalId = setInterval(fetchPositions, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [generalContext.tradeRefreshTrigger]);

  useEffect(() => {
    const ids = new Set(allPositions.map((s, idx) => s._id || `${s.name}-${idx}`));
    setSelectedRows((prev) => prev.filter((id) => ids.has(id)));
  }, [allPositions]);

  const toggleRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === allPositions.length) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows(allPositions.map((s, idx) => s._id || `${s.name}-${idx}`));
  };

  const handleCloseSelected = async () => {
    const selectedStocks = allPositions.filter((s, idx) =>
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
      alert(`${selectedStocks.length} position(s) closed successfully`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to close selected positions");
    } finally {
      setIsClosingSelected(false);
    }
  };

  return (
    <div className="positions-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <h3 className="title" style={{ margin: 0 }}>
          Active Positions ({allPositions.length})
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

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allPositions.length > 0 && selectedRows.length === allPositions.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all positions"
                />
              </th>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. Price</th>
              <th>LTP</th>
              <th>P&amp;L</th>
              <th>Chg.</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((stock, index) => {
              const rowId = stock._id || `${stock.name}-${index}`;
              const qty = toNumber(stock.qty);
              const avg = toNumber(stock.avg);
              const price = toNumber(stock.price);
              const pnl = price * qty - avg * qty;
              const isProfit = pnl >= 0;
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
                  <td style={{ fontWeight: "600", color: "var(--text-muted)" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "var(--bg-main)",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {stock.product || "MIS"}
                    </span>
                  </td>
                  <td style={{ fontWeight: "700", color: "var(--text-main)" }}>{stock.name}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{qty.toFixed(2)}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{avg.toFixed(2)}</td>
                  <td style={{ fontFamily: "JetBrains Mono", fontWeight: "600" }}>{price.toFixed(2)}</td>
                  <td className={profClass} style={{ fontWeight: "700", fontFamily: "JetBrains Mono" }}>
                    {isProfit ? "+" : ""}
                    {pnl.toFixed(2)}
                  </td>
                  <td className={profClass}>{stock.net || "0.00%"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "6px 16px", fontSize: "0.75rem", borderRadius: "6px", background: "var(--danger)" }}
                      onClick={() => generalContext.openSellWindow(stock.name, stock.price)}
                    >
                      Exit
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

export default Positions;

