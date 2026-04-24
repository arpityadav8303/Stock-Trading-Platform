import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import api from "../api";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
  Search,
  Close,
  Add,
  CheckCircle,
  Delete,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import "./WatchList.css";

const REFRESH_INTERVAL_MS = 3000;

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notification, setNotification] = useState(null);
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch watchlist
  useEffect(() => {
    const fetchWatchlist = () => {
      api.get("/allWatchlist").then((res) => {
        setWatchlist(res.data || []);
      });
    };

    fetchWatchlist();
    const intervalId = setInterval(fetchWatchlist, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      api
        .get(`/searchStocks?q=${encodeURIComponent(query)}`)
        .then((res) => {
          setSearchResults(res.data || []);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 300);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToWatchlist = async (stockName) => {
    try {
      await api.post("/addToWatchlist", { name: stockName });
      showNotification(`${stockName} added to watchlist`);
      // Refresh watchlist
      const res = await api.get("/allWatchlist");
      setWatchlist(res.data || []);
      // Refresh search results to update inWatchlist status
      if (searchQuery.trim()) {
        const searchRes = await api.get(`/searchStocks?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(searchRes.data || []);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to add stock", "error");
    }
  };

  const handleRemoveFromWatchlist = async (stockName) => {
    try {
      await api.delete(`/removeFromWatchlist/${encodeURIComponent(stockName)}`);
      showNotification(`${stockName} removed from watchlist`);
      const res = await api.get("/allWatchlist");
      setWatchlist(res.data || []);
      // Refresh search results
      if (searchQuery.trim()) {
        const searchRes = await api.get(`/searchStocks?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(searchRes.data || []);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to remove stock", "error");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchFocused(false);
    searchRef.current?.focus();
  };

  return (
    <div className="watchlist-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`wl-toast ${notification.type === "error" ? "wl-toast-error" : "wl-toast-success"}`}>
          {notification.type === "error" ? (
            <Close style={{ fontSize: "1rem" }} />
          ) : (
            <CheckCircle style={{ fontSize: "1rem" }} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search Area */}
      <div className="wl-search-area" ref={searchContainerRef}>
        <div className={`wl-search-box ${isSearchFocused ? "wl-search-box-active" : ""}`}>
          <Search className="wl-search-icon" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search stocks, sectors..."
            className="wl-search-input"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery && (
            <button className="wl-search-clear" onClick={clearSearch}>
              <Close style={{ fontSize: "0.9rem" }} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && (searchQuery.trim() || isSearching) && (
          <div className="wl-search-dropdown">
            {isSearching ? (
              <div className="wl-search-loading">
                <div className="wl-spinner"></div>
                <span>Searching...</span>
              </div>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <div className="wl-search-empty">
                <Search style={{ fontSize: "2rem", color: "var(--text-light)", marginBottom: "8px" }} />
                <p>No stocks found for "{searchQuery}"</p>
                <span>Try a different search term</span>
              </div>
            ) : (
              <>
                <div className="wl-search-header">
                  <span>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</span>
                </div>
                <ul className="wl-search-list">
                  {searchResults.map((stock, idx) => (
                    <li key={idx} className="wl-search-item">
                      <div className="wl-search-item-left">
                        <div className="wl-stock-badge">
                          {stock.name.substring(0, 2)}
                        </div>
                        <div className="wl-search-item-info">
                          <span className="wl-search-item-name">{stock.name}</span>
                          <span className="wl-search-item-full">{stock.fullName}</span>
                        </div>
                      </div>
                      <div className="wl-search-item-right">
                        <span className="wl-sector-tag">{stock.sector}</span>
                        {stock.inWatchlist ? (
                          <button
                            className="wl-action-btn wl-action-btn-added"
                            onClick={() => handleRemoveFromWatchlist(stock.name)}
                            title="Remove from watchlist"
                          >
                            <CheckCircle style={{ fontSize: "1rem" }} />
                            <span>Added</span>
                          </button>
                        ) : (
                          <button
                            className="wl-action-btn wl-action-btn-add"
                            onClick={() => handleAddToWatchlist(stock.name)}
                            title="Add to watchlist"
                          >
                            <Add style={{ fontSize: "1rem" }} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="wl-header-bar">
          <span className="wl-header-label">WATCHLIST</span>
          <span className="wl-header-count">{watchlist.length} / 50</span>
        </div>
      </div>

      {/* Watchlist Items */}
      <ul className="list" style={{ listStyle: "none", padding: 0, margin: 0, overflowY: "auto", flex: 1, minHeight: 0 }}>
        {watchlist.length === 0 ? (
          <div className="wl-empty-state">
            <TrendingUp style={{ fontSize: "2.5rem", color: "var(--text-light)", marginBottom: "12px" }} />
            <p>No stocks in watchlist</p>
            <span>Search and add stocks above</span>
          </div>
        ) : (
          watchlist.map((stock, index) => (
            <WatchListItem
              stock={stock}
              key={stock._id || index}
              onRemove={handleRemoveFromWatchlist}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  return (
    <li className="wl-stock-row">
      <div
        className="item"
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p className={stock.isDown ? "loss" : "profit"} style={{ fontWeight: "700", margin: 0 }}>
          {stock.name}
        </p>
        <div className="itemInfo wl-item-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="percent" style={{ fontSize: "0.75rem", fontWeight: "600" }}>
            {stock.percent}
          </span>
          {stock.isDown ? (
            <KeyboardArrowDown style={{ fontSize: "1rem" }} className="loss" />
          ) : (
            <KeyboardArrowUp style={{ fontSize: "1rem" }} className="profit" />
          )}
          <span className="price" style={{ fontFamily: "JetBrains Mono", fontWeight: "700" }}>
            {stock.price?.toFixed(2)}
          </span>
        </div>
      </div>
      <WatchListActions uid={stock.name} price={stock.price} onRemove={onRemove} />
    </li>
  );
};

const WatchListActions = ({ uid, price, onRemove }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <div className="actions wl-row-actions">
      <Tooltip title="Buy" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn wl-row-btn wl-row-btn-buy" onClick={() => generalContext.openBuyWindow(uid, price)}>
          BUY
        </button>
      </Tooltip>
      <Tooltip title="Sell" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn wl-row-btn wl-row-btn-sell" onClick={() => generalContext.openSellWindow(uid, price)}>
          SELL
        </button>
      </Tooltip>
      <Tooltip title="Chart" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn wl-row-icon-btn">
          <BarChartOutlined style={{ fontSize: "1.1rem" }} />
        </button>
      </Tooltip>
      <Tooltip title="Remove" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn wl-remove-btn wl-row-icon-btn" onClick={() => onRemove(uid)}>
          <Delete style={{ fontSize: "1.1rem" }} />
        </button>
      </Tooltip>
    </div>
  );
};

