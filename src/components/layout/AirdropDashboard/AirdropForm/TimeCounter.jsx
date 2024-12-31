import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TimeCounter = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const startDate = new Date('2025-01-15T00:00:00').getTime();
    const endDate = new Date('2025-01-29T23:59:59').getTime(); // Two weeks after start

    const updateTimer = () => {
      const now = new Date().getTime();
      
      if (now < startDate) {
        // If before start date, count down to start
        const difference = startDate - now;
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
        return;
      }
      
      if (now > endDate) {
        setIsExpired(true);
        return;
      }

      // Count down to end date
      const difference = endDate - now;
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }) => (
    <div className="relative bg-gradient-to-b from-purple-900/30 to-black/30 rounded-lg p-4 backdrop-blur-sm border border-purple-500/10">
      <div className="absolute -top-1 left-1/2 w-full h-px bg-purple-500/10 transform -translate-x-1/2" />
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ 
            duration: 0.2,
            ease: "easeInOut"
          }}
          className="relative overflow-hidden"
        >
          <div className="text-3xl font-bold text-white/90">
            {String(value).padStart(2, '0')}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="text-xs font-medium text-purple-200/40 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="mb-8 p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Next Airdrop Distribution
          </h2>
          
        </div>
        <p className="text-lg text-purple-200/60 max-w-2xl mx-auto mb-2">
          Join our community airdrop event and be part of the next generation of decentralized finance.
        </p>
        <p className="text-purple-200/40 text-sm">
          {isExpired 
            ? "Airdrop period has ended" 
            : "Time remaining until tokens are distributed"}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <TimeBlock value={timeLeft.days} label="Days" />
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <TimeBlock value={timeLeft.minutes} label="Minutes" />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>

      <div className="text-center mt-6 space-y-2">
        <div className="text-sm font-medium text-purple-200/50">
          {isExpired 
            ? "The airdrop period has concluded" 
            : "Distribution period"}
        </div>
        <div className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          January 15, 2025 - January 29, 2025
        </div>
      </div>
    </div>
  );
};

export default TimeCounter;