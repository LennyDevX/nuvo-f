import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LazyMotion, domAnimation, AnimatePresence, MotionConfig } from 'framer-motion';
import useReducedMotion from '../../hooks/performance/useReducedMotion';
import { isLowPerformanceDevice } from '../../utils/mobile/MobileUtils';

// Animation defaults
const DEFAULT_DURATION = 0.4;
const DEFAULT_EASE = [0.25, 0.1, 0.25, 1.0];

// Create context for animation settings
const AnimationContext = createContext({
  shouldReduceMotion: false,
  isLowPerformance: false,
  animationLevel: 'full',
});

// Detector de dispositivos de bajo rendimiento
const detectLowPerformanceDevice = () => {
  // Detección básica de dispositivos de rendimiento limitado
  const isLowEndDevice = 
    navigator.hardwareConcurrency < 4 || // Menos de 4 núcleos
    navigator.deviceMemory < 4 || // Menos de 4GB RAM (si está disponible)
    /Android [4-7]|iPhone OS [8-9]|iPad OS [8-9]/.test(navigator.userAgent); // Dispositivos antiguos
  
  // Verificar memoria insuficiente
  const isMemoryLimited = 
    (performance && performance.memory && performance.memory.jsHeapSizeLimit < 2147483648); // < 2GB
  
  return isLowEndDevice || isMemoryLimited;
};

/**
 * Provider component that shares animation configuration based on
 * user preferences and device capabilities
 */
const AnimationProvider = ({ children }) => {
  // Get user's motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Check device performance
  const lowPerformance = isLowPerformanceDevice();
  
  // Estado para controlar la reducción de movimiento
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  // Estado para detectar dispositivos de bajo rendimiento
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  // Nivel de animación basado en capacidades y preferencias
  const [animationLevel, setAnimationLevel] = useState('full');

  // Detectar preferencia de reducción de movimiento
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = (event) => {
      setShouldReduceMotion(event.matches);
      // Actualizar nivel de animación
      updateAnimationLevel(event.matches, isLowPerformance);
    };
    
    // Configuración inicial
    updateMotionPreference(query);
    
    // Detectar cambios en la preferencia
    query.addEventListener('change', updateMotionPreference);
    
    return () => {
      query.removeEventListener('change', updateMotionPreference);
    };
  }, [isLowPerformance]);

  // Detectar dispositivos de bajo rendimiento
  useEffect(() => {
    const isLowEnd = detectLowPerformanceDevice();
    setIsLowPerformance(isLowEnd);
    
    // Actualizar nivel de animación
    updateAnimationLevel(shouldReduceMotion, isLowEnd);
  }, [shouldReduceMotion]);
  
  // Función para actualizar el nivel de animación
  const updateAnimationLevel = (reduceMotion, lowPerformance) => {
    if (reduceMotion) {
      setAnimationLevel('minimal');
    } else if (lowPerformance) {
      setAnimationLevel('reduced');
    } else {
      setAnimationLevel('full');
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    shouldReduceMotion,
    isLowPerformance,
    animationLevel,
    // Combine both checks for a single flag when needed
    shouldOptimizeAnimations: prefersReducedMotion || lowPerformance,
  }), [prefersReducedMotion, lowPerformance, shouldReduceMotion, isLowPerformance, animationLevel]);

  return (
    <AnimationContext.Provider value={contextValue}>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user" transition={{ 
          duration: DEFAULT_DURATION, 
          ease: DEFAULT_EASE 
        }}>
          {/* Change mode from "wait" to "sync" to allow multiple animations */}
          <AnimatePresence mode="sync">
            {children}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </AnimationContext.Provider>
  );
};

// Custom hook to consume the context
export const useAnimationConfig = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationConfig must be used within an AnimationProvider');
  }
  return context;
};

// Export an alias for backward compatibility
export const useAnimationContext = useAnimationConfig;

export default AnimationProvider;
