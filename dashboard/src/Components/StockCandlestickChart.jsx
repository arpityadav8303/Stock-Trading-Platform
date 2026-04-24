import React, { useMemo, useState } from "react";

const CHART_WIDTH = 820;
const CHART_HEIGHT = 360;
const PADDING = { top: 20, right: 18, bottom: 42, left: 62 };
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const StockCandlestickChart = ({ points = [], range = "1mo" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chart = useMemo(() => {
    if (!points.length) {
      return null;
    }

    const values = points.flatMap((point) => [point.high, point.low]).filter(Number.isFinite);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valuePadding = Math.max((maxValue - minValue) * 0.08, maxValue * 0.005, 1);
    const chartMin = minValue - valuePadding;
    const chartMax = maxValue + valuePadding;
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const candleSlot = innerWidth / points.length;
    const candleWidth = Math.max(Math.min(candleSlot * 0.8, 32), 4);

    const yScale = (value) => {
      const safeRange = chartMax - chartMin || 1;
      return PADDING.top + ((chartMax - value) / safeRange) * innerHeight;
    };

    const xScale = (index) => PADDING.left + candleSlot * index + candleSlot / 2;

    const yTicks = Array.from({ length: 5 }, (_, index) => chartMin + ((chartMax - chartMin) / 4) * index).reverse();
    const labelIndexes = Array.from(
      new Set(
        [0, Math.floor(points.length * 0.25), Math.floor(points.length * 0.5), Math.floor(points.length * 0.75), points.length - 1]
          .filter((index) => index >= 0 && index < points.length)
      )
    );

    return {
      innerHeight,
      candleWidth,
      xScale,
      yScale,
      yTicks,
      labelIndexes,
    };
  }, [points]);

  if (!chart) {
    return <div className="stock-chart-empty">No chart data available</div>;
  }

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="candlestick-chart-shell">
      <svg
        className="candlestick-chart-svg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Candlestick stock chart"
      >
        {chart.yTicks.map((tickValue) => {
          const y = chart.yScale(tickValue);
          return (
            <g key={`tick-${tickValue}`}>
              <line x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={y} y2={y} className="candlestick-grid-line" />
              <text x={PADDING.left - 12} y={y + 4} textAnchor="end" className="candlestick-axis-label">
                ₹{Number(tickValue).toFixed(0)}
              </text>
            </g>
          );
        })}

        {chart.labelIndexes.map((index) => {
          const point = points[index];
          const x = chart.xScale(index);
          const date = new Date(point.date);
          const label =
            range === "5d"
              ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

          return (
            <text key={`label-${index}`} x={x} y={CHART_HEIGHT - 12} textAnchor="middle" className="candlestick-axis-label">
              {label}
            </text>
          );
        })}

        {points.map((point, index) => {
          const x = chart.xScale(index);
          const openY = chart.yScale(point.open);
          const closeY = chart.yScale(point.close);
          const highY = chart.yScale(point.high);
          const lowY = chart.yScale(point.low);
          const isUp = point.close >= point.open;
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

          return (
            <g
              key={`${point.date}-${index}`}
              className="candlestick-group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <line
                x1={x}
                x2={x}
                y1={highY}
                y2={lowY}
                className={`candlestick-wick ${isUp ? "candlestick-up" : "candlestick-down"}`}
              />
              <rect
                x={x - chart.candleWidth / 2}
                y={bodyTop}
                width={chart.candleWidth}
                height={bodyHeight}
                rx="2"
                className={`candlestick-body ${isUp ? "candlestick-up" : "candlestick-down"}`}
              />
              <rect
                x={x - chart.candleWidth}
                y={PADDING.top}
                width={chart.candleWidth * 2}
                height={chart.innerHeight}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      {hoveredPoint && (
        <div className="candlestick-tooltip">
          <strong>{new Date(hoveredPoint.date).toLocaleString()}</strong>
          <span>Open: ₹{formatMoney(hoveredPoint.open)}</span>
          <span>High: ₹{formatMoney(hoveredPoint.high)}</span>
          <span>Low: ₹{formatMoney(hoveredPoint.low)}</span>
          <span>Close: ₹{formatMoney(hoveredPoint.close)}</span>
        </div>
      )}
    </div>
  );
};

export default StockCandlestickChart;
