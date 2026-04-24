import React, { useContext, useEffect, useRef, useState } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import StockCandlestickChart from "./StockCandlestickChart";
import "./StockChartModal.css";

const RANGE_OPTIONS = [
  { value: "5d", label: "5D" },
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
];

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercent = (value) => `${value >= 0 ? "+" : ""}${Number(value || 0).toFixed(2)}%`;

const StockChartModal = ({ uid, initialPrice }) => {
  const generalContext = useContext(GeneralContext);
  const [range, setRange] = useState("1mo");
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [chartState, setChartState] = useState({
    isLoading: true,
    error: "",
    data: null,
  });
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    let isMounted = true;

    setChartState((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
    }));

    api
      .get(`/stockChart/${encodeURIComponent(uid)}?range=${range}`)
      .then((res) => {
        if (!isMounted) return;
        setChartState({
          isLoading: false,
          error: "",
          data: res.data,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setChartState({
          isLoading: false,
          error: error.response?.data?.message || "Failed to load chart data",
          data: null,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [uid, range]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragRef.current.isDragging) {
        return;
      }

      const nextX = dragRef.current.originX + (event.clientX - dragRef.current.startX);
      const nextY = dragRef.current.originY + (event.clientY - dragRef.current.startY);
      const maxOffsetX = Math.max((window.innerWidth - 360) / 2, 40);
      const maxOffsetY = Math.max((window.innerHeight - 240) / 2, 20);

      setDragPosition({
        x: Math.min(Math.max(nextX, -maxOffsetX), maxOffsetX),
        y: Math.min(Math.max(nextY, -maxOffsetY), maxOffsetY),
      });
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDragStart = (event) => {
    if (event.target.closest("button")) {
      return;
    }

    dragRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: dragPosition.x,
      originY: dragPosition.y,
    };
  };

  const chartPayload = chartState.data;

  return (
    <div className="modal-overlay">
      <div className="stock-chart-modal" style={{ transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)` }}>
        <div className="stock-chart-header" onMouseDown={handleDragStart}>
          <div>
            <p className="stock-chart-title">{uid} Candlestick Chart</p>
            <span className="stock-chart-subtitle">Simple Yahoo-backed OHLC chart</span>
          </div>
          <button className="close-btn" onClick={() => generalContext.closeChartWindow()}>
            &times;
          </button>
        </div>

        <div className="stock-chart-toolbar">
          <div className="stock-chart-stat">
            <span>Live Price</span>
            <strong>₹{formatMoney(chartPayload?.latestPrice ?? initialPrice)}</strong>
          </div>
          <div className="stock-chart-stat">
            <span>Day Change</span>
            <strong className={(chartPayload?.change ?? 0) >= 0 ? "profit" : "loss"}>
              {formatPercent(chartPayload?.changePercent ?? 0)}
            </strong>
          </div>
          <div className="stock-chart-stat">
            <span>Previous Close</span>
            <strong>₹{formatMoney(chartPayload?.previousClose ?? initialPrice)}</strong>
          </div>
          <div className="stock-chart-stat">
            <span>Range</span>
            <strong>{RANGE_OPTIONS.find((option) => option.value === range)?.label || "1M"}</strong>
          </div>
        </div>

        <div className="stock-chart-range-row">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`stock-range-btn ${range === option.value ? "stock-range-btn-active" : ""}`}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="stock-chart-body">
          {chartState.isLoading ? (
            <div className="stock-chart-empty">Loading chart...</div>
          ) : chartState.error ? (
            <div className="stock-chart-empty">{chartState.error}</div>
          ) : (
            <StockCandlestickChart points={chartPayload?.points || []} range={range} />
          )}
        </div>

        <div className="stock-chart-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              generalContext.closeChartWindow();
              generalContext.openBuyWindow(uid, chartPayload?.latestPrice ?? initialPrice);
            }}
          >
            Buy
          </button>
          <button
            className="btn"
            style={{ background: "var(--danger)", color: "#fff" }}
            onClick={() => {
              generalContext.closeChartWindow();
              generalContext.openSellWindow(uid, chartPayload?.latestPrice ?? initialPrice);
            }}
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockChartModal;
