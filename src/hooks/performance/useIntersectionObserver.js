import { useState, useEffect, useRef } from 'react';

/**
 * Hook para detectar cuando un elemento es visible en el viewport
 * @param {Object} options - Opciones para IntersectionObserver
 * @param {Number} options.threshold - Porcentaje del elemento visible para activar (0-1)
 * @param {String} options.rootMargin - Margen alrededor del elemento raíz
 * @param {Boolean} options.triggerOnce - Si debe dispararse solo una vez
 * @returns {Array} [ref, isVisible, entry] - Referencia a observar, estado de visibilidad y entrada del observador
 */
const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  const prevElement = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    // Omitir si el elemento no ha cambiado y estamos usando triggerOnce y ya es visible
    if (
      prevElement.current === element && 
      triggerOnce && 
      isVisible
    ) {
      return;
    }
    
    prevElement.current = element;
    
    // Restablecer visibilidad si el elemento cambia
    if (!triggerOnce || !isVisible) {
      setIsVisible(false);
    }
    
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Dejar de observar después de volverse visible si triggerOnce es true
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, isVisible]);
  
  return [elementRef, isVisible, entry];
};

export default useIntersectionObserver;
