// src/components/layout/TradingDashboard/TradingDashboard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import useTradingSimulator from "./TradingSimulator";

const formatPrice = (price) => {
  return price ? parseFloat(price).toFixed(4) : "0.0000";
};

const TradingDashboard = () => {
  const {
    tradingBotProfit,
    lastTradingUpdate,
    getTradingIcon,
    performance,
    botBalance,
    winningTrades,
    totalTrades,
    recentTrades,
    currentPrice
  } = useTradingSimulator();

  const profitDistributionData = {
    labels: [
      'Smart Contract Pool',
      'Airdrops',
      'Marketing',
      'Development',
      'Community'
    ],
    datasets: [{
      data: [40, 20, 15, 15, 10],
      backgroundColor: [
        '#8B5CF6',
        '#EC4899',
        '#06B6D4',
        '#10B981',
        '#F59E0B'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          padding: 20,
          font: { size: 14 }
        }
      }
    }
  };

  return (
    <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full pt-16 pb-6 md:pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trading Bot <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-500">Dashboard</span>
            </h1>
            <p className="text-gray-300">Real-time trading performance and metrics</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Bot Balance",
                value: `$${parseFloat(botBalance || 0).toFixed(2)}`,
                icon: "💰",
                color: "text-green-400"
              },
              {
                label: "Total Profit/Loss",
                value: `${tradingBotProfit > 0 ? "+" : ""}$${tradingBotProfit}`,
                icon: getTradingIcon(tradingBotProfit),
                color: tradingBotProfit >= 0 ? "text-green-400" : "text-red-400"
              },
              {
                label: "Win Rate",
                value: `${performance?.winRate || 0}%`,
                subtext: `${winningTrades || 0}/${totalTrades || 0} trades`,
                icon: "🎯",
                color: "text-blue-400"
              },
              {
                label: "Avg. Profit per Trade",
                value: `${performance?.avgProfit || 0}%`,
                icon: "📊",
                color: (performance?.avgProfit >= 0) ? "text-green-400" : "text-red-400"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-sm text-purple-400">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-sm text-gray-400 mt-1">{stat.subtext}</p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Profit Distribution</h2>
              <div className="h-[300px]">
                <Pie data={profitDistributionData} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Recent Trades</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {recentTrades?.map((trade, index) => (
                  <motion.div
                    key={`${trade.time}-${index}`}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.type}
                      </span>
                      <span className={`font-bold ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit > 0 ? '+' : ''}{trade.profit}%
                        <span className="text-sm text-gray-400 ml-1">
                          (${trade.profitAmount})
                        </span>
                      </span>
                      <span className="text-gray-400 text-sm">
                        {parseFloat(trade.amount).toFixed(2)} MATIC
                      </span>
                      <span className="text-gray-400 text-sm">
                        @${formatPrice(trade.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">
                        {new Date(trade.time).toLocaleTimeString()}
                      </span>
                      <p className="text-xs text-gray-500">
                        Balance: ${parseFloat(trade.balance).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-400">
                  Current MATIC Price: ${formatPrice(currentPrice)}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="text-center mt-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Last updated: {lastTradingUpdate ? new Date(lastTradingUpdate).toLocaleTimeString() : 'Never'}
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default TradingDashboard;