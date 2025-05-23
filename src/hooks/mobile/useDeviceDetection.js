import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

// Singleton para compartir el estado entre múltiples instancias del hook
let deviceDataCache = null;
let subscribers = [];

// Notifica a todos los suscriptores de cambios en el estado
const notifySubscribers = (newData) => {
  subscribers.forEach(callback => callback(newData));
};

/**
 * Hook centralizado para detección de dispositivos y capacidades
 * Este hook proporciona toda la información necesaria sobre el dispositivo actual
 * y debe ser usado en lugar de implementaciones individuales de detección
 */
export function useDeviceDetection() {
  const [deviceData, setDeviceData] = useState(deviceDataCache || {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    hasTouchScreen: false,
    hasReducedMotion: false,
    isAndroid: false,
    isIOS: false,
    isLowPerformance: false,
    isLowMemory: false,
    isLowCPU: false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceMemory: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : null,
    hardwareConcurrency: typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : null,
    os: 'unknown'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detección avanzada de capacidades
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detección de preferencias y capacidades
      const hasTouchScreen = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             navigator.msMaxTouchPoints > 0;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detección de sistema operativo
      const userAgent = navigator.userAgent;
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      
      // Detección de memoria y CPU
      const deviceMemory = 'deviceMemory' in navigator ? navigator.deviceMemory : null;
      const hardwareConcurrency = 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : null;
      
      // Análisis de rendimiento
      const isLowMemory = deviceMemory !== null && deviceMemory < 4;
      const isLowCPU = hardwareConcurrency !== null && hardwareConcurrency < 4;
      const isMobile = width < 768;
      
      // Determinar OS
      let os = 'desktop';
      if (isAndroid) os = 'android';
      else if (isIOS) os = 'ios';
      
      // Cálculo combinado de rendimiento
      const isLowPerformance = isMobile && (isLowMemory || isLowCPU);

      const newData = {
        isMobile,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLandscape: width > height,
        hasTouchScreen,
        hasReducedMotion: prefersReducedMotion,
        isAndroid,
        isIOS,
        isLowPerformance,
        isLowMemory,
        isLowCPU,
        userAgent,
        windowWidth: width,
        windowHeight: height,
        deviceMemory,
        hardwareConcurrency,
        os
      };
      
      // Actualizar estado y caché global
      setDeviceData(newData);
      deviceDataCache = newData;
      
      // Notificar a todos los suscriptores
      notifySubscribers(newData);
    };

    // Detectar si es la primera vez que se monta este hook
    if (!deviceDataCache) {
      checkDevice();
    } else {
      // Usar cache si está disponible
      setDeviceData(deviceDataCache);
    }

    // Suscribir esta instancia a actualizaciones
    const onUpdate = (newData) => {
      setDeviceData(newData);
    };
    subscribers.push(onUpdate);

    // Optimizar el evento resize con debounce
    const debouncedCheckDevice = debounce(checkDevice, 250);
    window.addEventListener('resize', debouncedCheckDevice, { passive: true });

    // Detectar cambios en preferencias de movimiento
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', checkDevice);
    } else if (motionQuery.addListener) {
      // Compatibilidad con navegadores más antiguos
      motionQuery.addListener(checkDevice);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheckDevice);
      
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', checkDevice);
      } else if (motionQuery.removeListener) {
        motionQuery.removeListener(checkDevice);
      }
      
      // Eliminar esta instancia de suscriptores
      const index = subscribers.indexOf(onUpdate);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  // Utilidades computadas
  const utils = useMemo(() => ({
    /**
     * Determinar cantidad recomendada de partículas según rendimiento
     */
    getRecommendedParticleCount: (
      highPerformance = 200, 
      mediumPerformance = 120, 
      lowPerformance = 80
    ) => {
      if (deviceData.isLowPerformance) return lowPerformance;
      if (deviceData.isMobile) return mediumPerformance;
      return highPerformance;
    },
    
    /**
     * Obtener clase CSS basada en el dispositivo actual
     */
    getDeviceClass: () => {
      if (deviceData.isMobile) return 'mobile';
      if (deviceData.isTablet) return 'tablet';
      return 'desktop';
    },
    
    /**
     * Detectar si debe usar animaciones reducidas
     */
    shouldReduceMotion: () => {
      return deviceData.hasReducedMotion || deviceData.isLowPerformance;
    },
    
    /**
     * Detectar si es un dispositivo móvil (compatible con la API anterior)
     */
    isMobileDevice: () => {
      return deviceData.isMobile || deviceData.isTablet;
    },
    
    /**
     * Obtener el sistema operativo (compatible con getMobileOS)
     */
    getOS: () => deviceData.os
  }), [deviceData]);

  return { ...deviceData, ...utils };
}

// Exportamos funciones estáticas para uso sin hooks
export const getDeviceInfo = () => {
  return deviceDataCache || { isMobile: false, isDesktop: true };
};

// Para uso fuera de componentes React
export const detectDevice = () => {
  if (typeof window === 'undefined') return { isMobile: false, isDesktop: true };
  
  const width = window.innerWidth;
  const userAgent = navigator.userAgent;
  
  return {
    isMobile: width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isAndroid: /android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    os: /android/i.test(userAgent) ? 'android' : 
        /iPad|iPhone|iPod/.test(userAgent) ? 'ios' : 'desktop'
  };
};
