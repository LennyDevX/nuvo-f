import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TokenomicsSystem = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  const tokenData = [
    { name: 'Community Rewards', value: 20, color: '#8B5CF6' },
    { name: 'Staking Growth', value: 40, color: '#6D28D9' },
    { name: 'Team & Development', value: 15, color: '#4C1D95' },
    { name: 'Liquidity', value: 25, color: '#5B21B6' },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Título con degradado */}
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Tokenomics That Drive Value
              </span>
            </h2>
            <p className="text-gray-300 mb-8">
              Our token distribution is designed to ensure long-term sustainability and 
              community benefits. With 60% allocated to community initiatives, we're 
              building a truly decentralized ecosystem.
            </p>
            
            <div className="space-y-4">
              {tokenData.map((item) => (
                <div 
                  key={item.name}
                  className="flex items-center space-x-3"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white">
                    {item.name} - {item.value}%
                  </span>
                  
                </div>
                
              ))}
            </div>
            <button
              onClick={() => navigate('/tokenomics')}
              className="px-6 py-4 mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg"
            >
              Learn More About Tokenomics
            </button>
          </motion.div>

          {/* Right Content - Interactive Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={160}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {tokenData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      return (
                        <div className="bg-gray-900 p-3 rounded-lg shadow-md">
                          <p className="text-white text-sm font-semibold">
                            {`${payload[0].name}: ${payload[0].value}%`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSystem;
