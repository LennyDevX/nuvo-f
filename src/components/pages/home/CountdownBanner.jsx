import React, { useState, useEffect, useMemo } from 'react';
import { m } from 'framer-motion';
import { FaClock } from 'react-icons/fa';

const CountdownBanner = () => {
  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Define consistent animation settings
  const mainAnimationSettings = useMemo(() => ({
    duration: 0.6,
    staggerDelay: 0.08,
  }), []);

  // Setup countdown timer
  useEffect(() => {
    const targetDate = new Date('January 1, 2026 00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };
    
    // Initial update
    updateCountdown();
    
    // Setup interval
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: mainAnimationSettings.duration }
        }
      }}
      initial="hidden"
      animate="visible"
      className="mb-14 rounded-xl overflow-hidden relative group"
    >
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-purple-600/5 opacity-0"></div>
      
      <div className="flex flex-col items-center justify-center relative z-10">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-black/10 border border-purple-500/30 rounded-lg py-2 px-1 sm:py-3">
                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <FaClock className="text-purple-400" />
          <h4 className="text-transparent bg-clip-text mt-2 bg-nuvo-gradient-text text-lg font-semibold">NUVOS Token Pre-Sale Countdown</h4>
        </div>
        <p className="text-gray-300 text-xs sm:text-sm text-center">
          Mark your calendar for January 1, 2026 – The official NUVOS token pre-sale launch
        </p>
      </div>
    </m.div>
  );
};

export default CountdownBanner;
