import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TimeCounter = ({ hideDetailsOnMobile = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Actualización de fechas para el próximo airdrop: 15-29 de abril 2025
    const startDate = new Date('2025-04-15T00:00:00').getTime();
    const endDate = new Date('2025-04-29T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      
      if (now < startDate) {
        // Si estamos antes de la fecha de inicio, contar hasta el inicio
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

      // Contar hasta la fecha final del evento
      const difference = endDate - now;
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Llamada inicial
    return () => clearInterval(timer);
  }, []);

  // Componente optimizado que no causa parpadeos
  const TimeBlock = ({ value, label }) => (
    <div className="relative bg-black/30 rounded-lg p-3 border border-purple-500/10">
      <div className="text-center">
        {/* El valor se mantiene estable, solo el contenido cambia */}
        <div className="text-2xl sm:text-3xl font-bold text-white">
          {String(value).padStart(2, '0')}
        </div>
        <div className="text-xs font-medium text-purple-200/60 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`mb-6 ${hideDetailsOnMobile ? 'px-0' : 'px-4 sm:px-6'}`}>
      <motion.div 
        className={`text-center mb-6 ${hideDetailsOnMobile ? 'hidden lg:block' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          Next Airdrop Distribution
        </h2>
        <p className="text-base sm:text-lg text-purple-200/80 max-w-2xl mx-auto mb-2">
          Join our community airdrop and be part of the next generation of decentralized finance.
        </p>
        <p className="text-purple-200/60 text-sm">
          {isExpired 
            ? "Airdrop period has ended" 
            : "Time remaining until tokens are distributed"}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-md sm:max-w-xl mx-auto">
        <TimeBlock value={timeLeft.days} label="Days" />
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <TimeBlock value={timeLeft.minutes} label="Minutes" />
        <TimeBlock value={timeLeft.seconds} label="Seconds" />
      </div>

      <motion.div 
        className={`text-center mt-4 ${hideDetailsOnMobile ? 'hidden lg:block' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="text-sm font-medium text-purple-200/60">
          {isExpired 
            ? "The airdrop period has concluded" 
            : "Distribution period"}
        </div>
        <div className="text-base sm:text-lg font-semibold text-white">
          April 15, 2025 - April 29, 2025
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCounter;