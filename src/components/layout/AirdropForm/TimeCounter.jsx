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
    const startDate = new Date('2024-12-14T00:00:00').getTime();
    const endDate = new Date('2024-12-28T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      
      if (now < startDate) {
        setIsExpired(true);
        return;
      }
      
      if (now > endDate) {
        setIsExpired(true);
        return;
      }

      const difference = endDate - now;
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    const timer = setInterval(updateTimer, 1000);
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white/90 mb-2">
          Airdrop Distribution Period
        </h2>
        <p className="text-purple-200/40">
          {isExpired ? "Airdrop period has ended" : "Time remaining until airdrop ends"}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <TimeBlock value={timeLeft.days} label="Days" />
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <TimeBlock value={timeLeft.minutes} label="Minutes" />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>

      <div className="text-center mt-6 text-sm text-purple-200/30">
        {isExpired ? (
          "The airdrop period has concluded"
        ) : (
          "Distribution period: Dec 14, 2024 - Dec 28, 2024"
        )}
      </div>
    </div>
  );
};

export default TimeCounter;