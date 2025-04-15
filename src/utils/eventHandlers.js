import { throttle, debounce } from 'lodash';

/**
 * Re-exports lodash throttle and debounce with optimal defaults for UI events
 */
export const uiThrottle = (func, wait = 100) => throttle(func, wait);
export const uiDebounce = (func, wait = 200) => debounce(func, wait);

/**
 * Optimized scroll handler with passive option
 * @param {Function} handler - Event handler function
 * @param {Object} options - AddEventListener options
 */
export const addPassiveScrollListener = (handler, options = {}) => {
  window.addEventListener('scroll', handler, { passive: true, ...options });
  return () => window.removeEventListener('scroll', handler);
};

/**
 * Optimized resize handler with debounce
 * @param {Function} handler - Event handler function
 * @param {number} wait - Debounce wait time in milliseconds
 */
export const addDebouncedResizeListener = (handler, wait = 200) => {
  const debouncedHandler = debounce(handler, wait);
  window.addEventListener('resize', debouncedHandler);
  return () => window.removeEventListener('resize', debouncedHandler);
};
