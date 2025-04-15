import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';

const TokenomicsSystem = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add listener for window resize with throttling
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Memoize token data to prevent recreation on each render
  const tokenData = useMemo(() => [
    { name: 'Community Rewards', value: 30, color: '#8B5CF6' },
    { name: 'Ecosystem Growth', value: 30, color: '#6D28D9' },
    { name: 'Team & Development', value: 20, color: '#4C1D95' },
    { name: 'Marketing', value: 10, color: '#7C3AED' },
    { name: 'Liquidity', value: 10, color: '#5B21B6' },
  ], []);

  // Optimize event handler with useCallback
  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  // Memoize animation settings based on device capability
  const shouldReduceMotion = useMemo(() => 
    prefersReducedMotion || isMobile, 
    [prefersReducedMotion, isMobile]
  );

  // Memoize motion animation values
  const motionProps = useMemo(() => ({
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: shouldReduceMotion ? 0.3 : 0.6 }
  }), [shouldReduceMotion]);

  // Memoize mobile-optimized chart
  const pieChart = useMemo(() => {
    const chartSize = isMobile ? 250 : 320;
    const innerRadius = isMobile ? 60 : 80;
    const outerRadius = isMobile ? 120 : 160;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={tokenData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
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
                  // Optimize rendering with hardware acceleration
                  transform: 'translateZ(0)',
                  willChange: activeIndex === index ? 'filter' : 'auto'
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (payload && payload[0]) {
                return (
                  <div className="bg-gray-800 p-2 rounded-lg">
                    <p className="text-white">{`${payload[0].name}: ${payload[0].value}%`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [tokenData, activeIndex, onPieEnter, isMobile]);

  // Memoize key points section
  const keyPoints = useMemo(() => (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold text-purple-400 mb-2 tracking-wide">
        Key Points
      </h3>
      <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
        {tokenData.map((item) => (
          <li 
            key={item.name} 
            className="flex items-center space-x-2 hover:text-purple-300 transition-colors"
          >
            <span className="text-purple-500 flex-shrink-0">•</span>
            <span>{item.name} - {item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  ), [tokenData]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            {...motionProps}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Tokenomics That Drive Value
            </h2>
            <p className="text-gray-300 mb-8">
              Our token distribution is designed to ensure long-term sustainability and 
              community benefits. With 60% allocated to community initiatives, we're 
              building a truly decentralized ecosystem.
            </p>
            {keyPoints}
          </motion.div>

          {/* Right Content - Interactive Chart */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.6 }}
            className="h-[400px]"
          >
            {pieChart}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TokenomicsSystem);