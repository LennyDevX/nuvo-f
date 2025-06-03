import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAnimationConfig } from '../../../animation/AnimationProvider';
import memoWithName from '../../../../utils/performance/memoWithName';

// Componente optimizado que no causa parpadeos
const TimeBlock = memoWithName(({ value, label }) => (
  <div className="relative bg-black/40 rounded-lg p-3 border border-pink-500/10 shadow-md">
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-white">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs font-semibold text-pink-300/70 uppercase tracking-wider">
        {label}
      </div>
    </div>
  </div>
));

const TimeCounter = ({ hideDetailsOnMobile = false }) => {
  // Usar useRef para evitar re-renders innecesarios al calcular el tiempo
  const timeRef = useRef({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Estado separado para el renderizado, actualizado sólo cuando es necesario
  const [displayTime, setDisplayTime] = useState({...timeRef.current});
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);
  
  // Obtener preferencias de animación
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const reduceAnimations = shouldReduceMotion || isLowPerformance;

  useEffect(() => {
    // Actualización de fechas para el próximo airdrop: 27 de mayo - 6 de junio 2025
    const startDate = new Date('2025-05-27T00:00:00').getTime();
    const endDate = new Date('2025-06-06T23:59:59').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      
      if (now < startDate) {
        // Si estamos antes de la fecha de inicio, contar hasta el inicio
        const difference = startDate - now;
        const newTime = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
        
        // Solo actualizar el estado si hay cambios en horas, minutos o segundos
        // Esto evita re-renders innecesarios cuando sólo cambian los segundos
        const shouldUpdate = 
          timeRef.current.days !== newTime.days ||
          timeRef.current.hours !== newTime.hours ||
          timeRef.current.minutes !== newTime.minutes ||
          // Si rendimiento bajo o reduce motion, actualizar menos frecuente
          (!reduceAnimations && timeRef.current.seconds !== newTime.seconds);
        
        timeRef.current = newTime;
        
        if (shouldUpdate) {
          setDisplayTime({...newTime});
        }
        
        setIsExpired(false);
        return;
      }
      
      if (now > endDate) {
        if (!isExpired) setIsExpired(true);
        return;
      }

      // Contar hasta la fecha final del evento
      const difference = endDate - now;
      const newTime = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
      
      // Solo actualizar el estado si hay cambios importantes
      const shouldUpdate = 
        timeRef.current.days !== newTime.days ||
        timeRef.current.hours !== newTime.hours ||
        timeRef.current.minutes !== newTime.minutes ||
        (!reduceAnimations && timeRef.current.seconds !== newTime.seconds);
      
      timeRef.current = newTime;
      
      if (shouldUpdate) {
        setDisplayTime({...newTime});
      }
    };

    // Ajustar intervalo según preferencias: más lento si reducedMotion o lowPerformance
    const interval = reduceAnimations ? 5000 : 1000;
    timerRef.current = setInterval(updateTimer, interval);
    updateTimer(); // Llamada inicial
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reduceAnimations, isExpired]);

  // Evitar animaciones si el usuario lo prefiere
  const animationProps = useMemo(() => {
    return reduceAnimations 
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } };
  }, [reduceAnimations]);

  return (
    <div className={`mb-4 lg:mb-6 ${hideDetailsOnMobile ? 'px-0' : 'px-2 sm:px-4 lg:px-6'}`}>
      <motion.div 
        className={`text-center mb-4 lg:mb-6 ${hideDetailsOnMobile ? 'hidden lg:block' : ''}`}
        {...animationProps}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
          Next Airdrop Distribution
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-purple-200/80 max-w-2xl mx-auto mb-2 leading-relaxed px-2">
          Join our community airdrop and be part of the next generation of decentralized finance.
        </p>
        <p className="text-purple-200/60 text-xs sm:text-sm">
          {isExpired 
            ? "Airdrop period has ended" 
            : "Time remaining until tokens are distributed"}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-sm sm:max-w-md lg:max-w-xl mx-auto">
        <TimeBlock value={displayTime.days} label="Days" />
        <TimeBlock value={displayTime.hours} label="Hours" />
        <TimeBlock value={displayTime.minutes} label="Minutes" />
        <TimeBlock value={displayTime.seconds} label="Seconds" />
      </div>

      <motion.div 
        className={`text-center mt-3 lg:mt-4 ${hideDetailsOnMobile ? 'hidden lg:block' : ''}`}
        initial={reduceAnimations ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceAnimations ? 0 : 0.3, duration: reduceAnimations ? 0 : 0.5 }}
      >
        <div className="text-xs sm:text-sm font-medium text-purple-200/60">
          {isExpired 
            ? "The airdrop period has concluded" 
            : "Distribution period"}
        </div>
        <div className="text-sm sm:text-base lg:text-lg font-semibold text-white">
          May 27, 2025 – June 6, 2025
        </div>
      </motion.div>
    </div>
  );
};

export default memoWithName(TimeCounter);