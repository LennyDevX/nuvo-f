import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToBottomButton = memo(({ 
  isAtBottom, 
  showScrollButton, 
  messages, 
  onScrollToBottom,
  containerRef,
  lastReadMessageIndex = 0,
  isMobile = false 
}) => {
  // Estados para las mejoras
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  
  const hideTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTime = useRef(Date.now());
  const buttonRef = useRef(null);

  // Detección de orientación
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Detección de teclado virtual en móviles
  useEffect(() => {
    if (!isMobile) return;
    
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      setKeyboardVisible(heightDifference > 150); // Threshold para detectar teclado
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobile]);

  // Detección de safe areas
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaBottomValue = computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0px';
    setSafeAreaBottom(parseInt(safeAreaBottomValue) || 0);
  }, []);

  // Contador de mensajes no leídos
  useEffect(() => {
    if (messages.length > lastReadMessageIndex) {
      setUnreadCount(messages.length - lastReadMessageIndex - 1);
    } else {
      setUnreadCount(0);
    }
  }, [messages.length, lastReadMessageIndex]);

  // Detección de scroll activo
  useEffect(() => {
    if (!containerRef?.current) return;
    
    const handleScroll = () => {
      setIsScrolling(true);
      lastScrollTime.current = Date.now();
      
      // Limpiar timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Marcar como no scrolleando después de 150ms de inactividad
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    containerRef.current.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [containerRef]);

  // Auto-hide mejorado
  useEffect(() => {
    const shouldShow = (!isAtBottom || showScrollButton) && 
                     messages.length > 3 && 
                     !isScrolling;
    
    if (shouldShow) {
      setIsVisible(true);
      
      // Auto-hide después de 4 segundos de inactividad
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        if (!isScrolling && Date.now() - lastScrollTime.current > 3000) {
          setIsVisible(false);
        }
      }, 4000);
    } else {
      setIsVisible(false);
    }
    
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isAtBottom, showScrollButton, messages.length, isScrolling]);

  // Scroll inteligente con velocidad adaptativa
  const handleSmartScroll = useCallback(async () => {
    if (!containerRef?.current) return;
    
    // Haptic feedback en dispositivos móviles
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    const container = containerRef.current;
    const scrollDistance = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    setIsLoading(true);
    
    try {
      // Determinar velocidad basada en distancia
      let scrollBehavior = 'smooth';
      
      if (scrollDistance > 2000) {
        // Para distancias largas, usar scroll progresivo
        const steps = Math.ceil(scrollDistance / 1000);
        const stepSize = scrollDistance / steps;
        
        for (let i = 0; i < steps; i++) {
          const targetScroll = container.scrollTop + stepSize;
          container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
          
          // Esperar un poco entre pasos
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Scroll final al bottom
      onScrollToBottom(true);
      
      // Marcar mensajes como leídos
      setTimeout(() => {
        setUnreadCount(0);
      }, 500);
      
    } finally {
      setIsLoading(false);
    }
  }, [containerRef, onScrollToBottom, isMobile]);

  // Calcular posición dinámica
  const getButtonPosition = () => {
    let bottom = isMobile ? 160 : 120; // Reducido de 140px a 120px en móvil para mejor espaciado
    
    // Ajustar por safe area
    bottom += safeAreaBottom;
    
    // Ajustar por teclado virtual
    if (keyboardVisible) {
      bottom += 60; // Reducido de 50px a 40px
    }
    
    // Ajustar por orientación landscape en móvil
    if (isMobile && orientation === 'landscape') {
      bottom = Math.max(bottom - 30, 15); // Reducido para mejor ajuste
    }
    
    return bottom;
  };

  const buttonPosition = getButtonPosition();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          ref={buttonRef}
          onClick={handleSmartScroll}
          disabled={isLoading}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            // Pulsación más intensa cuando hay mensajes nuevos
            ...(unreadCount > 0 && {
              boxShadow: [
                '0 0 0 0 rgba(168, 85, 247, 0.4)',
                '0 0 0 10px rgba(168, 85, 247, 0)',
                '0 0 0 0 rgba(168, 85, 247, 0)'
              ]
            })
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.2,
            ...(unreadCount > 0 && {
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            })
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            fixed z-50
            w-11 h-11 md:w-12 md:h-12
            bg-gradient-to-br from-purple-600/95 via-purple-700/95 to-purple-800/95
            hover:from-purple-700 hover:via-purple-800 hover:to-purple-900
            active:from-purple-800 active:via-purple-900 active:to-purple-950
            text-white rounded-full
            shadow-lg hover:shadow-xl hover:shadow-purple-500/25
            border border-purple-500/30 hover:border-purple-400/50
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:ring-offset-1 focus:ring-offset-gray-900
            backdrop-blur-sm
            flex items-center justify-center
            touch-manipulation
            group
            disabled:opacity-50 disabled:cursor-not-allowed
            ${orientation === 'landscape' && isMobile ? 'right-2' : 'right-4 md:right-6'}
          `}
          style={{
            bottom: `${buttonPosition}px`
          }}
          aria-label={unreadCount > 0 ? `Ir a ${unreadCount} mensajes nuevos` : 'Ir al último mensaje'}
          title={unreadCount > 0 ? `${unreadCount} mensajes nuevos` : 'Ir al último mensaje'}
        >
          {/* Contenido del botón */}
          <div className="relative flex items-center justify-center">
            {/* Icono principal */}
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <svg 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.svg 
                className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-y-0.5 transition-transform duration-150" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                animate={unreadCount > 0 ? { y: [0, -2, 0] } : {}}
                transition={unreadCount > 0 ? { duration: 0.6, repeat: Infinity } : {}}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            )}
            
            {/* Contador de mensajes no leídos */}
            {unreadCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-br from-pink-500 to-red-500 rounded-full border border-gray-900 flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.div>
            )}
            
            {/* Efecto de pulso para atención */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-purple-400/30 pointer-events-none"
              animate={unreadCount > 0 ? {
                opacity: [0, 0.6, 0],
                scale: [1, 1.2, 1]
              } : { opacity: 0 }}
              transition={unreadCount > 0 ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              } : {}}
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

ScrollToBottomButton.displayName = 'ScrollToBottomButton';

export default ScrollToBottomButton;