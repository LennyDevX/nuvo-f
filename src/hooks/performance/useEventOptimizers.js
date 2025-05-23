import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook que proporciona una versión throttled de una función
 * Limita la frecuencia de ejecución de una función
 * 
 * @param {Function} callback - Función a aplicar throttle
 * @param {Number} delay - Tiempo mínimo entre ejecuciones (ms)
 * @returns {Function} Función con throttle aplicado
 */
export const useThrottle = (callback, delay = 300) => {
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);
  const savedCallback = useRef(callback);

  // Actualiza el callback guardado cuando cambia
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    const now = Date.now();
    const remaining = delay - (now - lastRun.current);

    // Limpiar cualquier timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (remaining <= 0) {
      // Si ha pasado suficiente tiempo, ejecuta inmediatamente
      lastRun.current = now;
      savedCallback.current(...args);
    } else {
      // De lo contrario, programa para más tarde
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now();
        savedCallback.current(...args);
      }, remaining);
    }
  }, [delay]);
};

/**
 * Hook que proporciona una versión debounced de una función
 * Espera hasta que la función deje de ser llamada durante el tiempo especificado
 * 
 * @param {Function} callback - Función a aplicar debounce
 * @param {Number} delay - Tiempo a esperar (ms)
 * @returns {Function} Función con debounce aplicado
 */
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  const savedCallback = useRef(callback);

  // Actualiza el callback guardado cuando cambia
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Limpiar el timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      savedCallback.current(...args);
    }, delay);
  }, [delay]);
};

/**
 * Hook para optimizar el manejo de eventos de scroll
 * 
 * @param {Function} callback - Función a ejecutar en el evento scroll
 * @param {Number} delay - Tiempo de throttle (ms)
 */
export const useOptimizedScroll = (callback, delay = 100) => {
  const throttledCallback = useThrottle(callback, delay);
  
  useEffect(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true });
    return () => window.removeEventListener('scroll', throttledCallback);
  }, [throttledCallback]);
};

/**
 * Hook para optimizar el manejo de eventos de resize
 * 
 * @param {Function} callback - Función a ejecutar en el evento resize
 * @param {Number} delay - Tiempo de debounce (ms)
 */
export const useOptimizedResize = (callback, delay = 200) => {
  const debouncedCallback = useDebounce(callback, delay);
  
  useEffect(() => {
    window.addEventListener('resize', debouncedCallback);
    return () => window.removeEventListener('resize', debouncedCallback);
  }, [debouncedCallback]);
};
