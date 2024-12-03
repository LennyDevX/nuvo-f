import { useState, useEffect } from 'react';

const MARKET_HOURS = {
  START: 9, // 9 AM
  END: 17, // 5 PM
  HIGH_VOLATILITY: [10, 15], // High volatility hours
  LOW_VOLATILITY: [12, 14], // Low volatility hours (lunch time)
};

const TRADING_CONFIG = {
  BASE_CHANGE: 2, // Base percentage change
  MAX_VOLATILITY: 3, // Maximum additional volatility
  MARKET_MULTIPLIER: 1.5, // Market hours multiplier
  OFF_HOURS_MULTIPLIER: 0.8, // Non-market hours multiplier
  UPDATE_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
  TREND_DURATION: 4, // Hours before trend changes
};

const isMarketHours = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= MARKET_HOURS.START && hour <= MARKET_HOURS.END;
};

const getTradingIcon = (profit) => {
  if (profit > 3) return "🚀";
  if (profit > 0) return "📈";
  if (profit < -3) return "📉";
  return "💹";
};

const useTradingSimulator = () => {
  const [tradingBotProfit, setTradingBotProfit] = useState(0);
  const [lastTradingUpdate, setLastTradingUpdate] = useState(null);

  useEffect(() => {
    const simulateTradingBot = () => {
      const now = new Date();
      const hour = now.getHours();

      // Market conditions
      const marketOpen = isMarketHours();
      const isHighVolatility =
        hour >= MARKET_HOURS.HIGH_VOLATILITY[0] && hour <= MARKET_HOURS.HIGH_VOLATILITY[1];
      const isLowVolatility =
        hour >= MARKET_HOURS.LOW_VOLATILITY[0] && hour <= MARKET_HOURS.LOW_VOLATILITY[1];

      // Base volatility calculation
      let volatility = TRADING_CONFIG.BASE_CHANGE;

      // Adjust volatility based on market conditions
      if (marketOpen) {
        volatility *= TRADING_CONFIG.MARKET_MULTIPLIER;
        if (isHighVolatility) volatility *= 1.5;
        if (isLowVolatility) volatility *= 0.5;
      } else {
        volatility *= TRADING_CONFIG.OFF_HOURS_MULTIPLIER;
      }

      // Add random factor with trend consideration
      const trend = Math.sin(Date.now() / (TRADING_CONFIG.TREND_DURATION * 3600000)) * 0.5;
      const randomFactor = (Math.random() * 2 - 1 + trend) * TRADING_CONFIG.MAX_VOLATILITY;

      // Calculate final change
      const change = (volatility + randomFactor) * (marketOpen ? 1 : 0.8);
      const finalChange = Math.round(change * 100) / 100;

      // Additional market data
      const volume = Math.floor(Math.random() * 100000) + 50000;
      const trades = Math.floor(Math.random() * 500) + 100;

      const timestamp = new Date().toISOString();
      const marketData = {
        change: finalChange,
        volume,
        trades,
        timestamp,
        isMarketHours: marketOpen,
        trend: trend > 0 ? "bullish" : "bearish",
      };

      setTradingBotProfit(finalChange);
      setLastTradingUpdate(timestamp);

      // Store enhanced data
      localStorage.setItem("tradingBotData", JSON.stringify(marketData));
    };

    // Initial update
    simulateTradingBot();

    // Set interval for updates
    const interval = setInterval(simulateTradingBot, TRADING_CONFIG.UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { tradingBotProfit, lastTradingUpdate, getTradingIcon, isMarketHours };
};

export default useTradingSimulator;