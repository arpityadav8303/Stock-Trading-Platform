import React, { useEffect, useState } from "react";

import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";
import StockChartModal from "./StockChartModal";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, price) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid, price) => {},
  closeSellWindow: () => {},
  openChartWindow: (uid, price) => {},
  closeChartWindow: () => {},
  showNotification: (message, type) => {},
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isChartWindowOpen, setIsChartWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockPrice, setSelectedStockPrice] = useState(0);
  const [tradeRefreshTrigger, setTradeRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setNotification(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [notification]);

  const handleOpenBuyWindow = (uid, price) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockPrice(price || 0);
  };

  const notifyTradeComplete = () => {
    setTradeRefreshTrigger((prev) => prev + 1);
  };

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
      id: Date.now(),
    });
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockPrice(0);
  };

  const handleOpenSellWindow = (uid, price) => {
    setIsSellWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockPrice(price || 0);
  };

  const handleOpenChartWindow = (uid, price) => {
    setIsChartWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockPrice(price || 0);
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockPrice(0);
  };

  const handleCloseChartWindow = () => {
    setIsChartWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockPrice(0);
  };

  return (
    <GeneralContext.Provider
      value={{
        isBuyWindowOpen,
        selectedStockUID,
        selectedStockPrice,
        tradeRefreshTrigger,
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        openChartWindow: handleOpenChartWindow,
        closeChartWindow: handleCloseChartWindow,
        notifyTradeComplete,
        showNotification,
      }}
    >
      {props.children}
      {notification && (
        <div className={`app-toast app-toast-${notification.type}`} key={notification.id}>
          <span className="app-toast-indicator"></span>
          <span>{notification.message}</span>
        </div>
      )}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} />}
      {isChartWindowOpen && <StockChartModal uid={selectedStockUID} initialPrice={selectedStockPrice} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
