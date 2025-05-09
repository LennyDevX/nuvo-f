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

/**
 * Optimized touch event handler with throttling
 * @param {HTMLElement} element - DOM element to attach listener to
 * @param {Function} handler - Event handler function
 * @param {number} wait - Throttle wait time in milliseconds
 */
export const addThrottledTouchListener = (element, handler, wait = 100) => {
  const throttledHandler = throttle(handler, wait);
  
  const touchStartHandler = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handler(e.touches[0].clientX, e.touches[0].clientY, e);
    }
  };
  
  const touchMoveHandler = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      throttledHandler(e.touches[0].clientX, e.touches[0].clientY, e);
    }
  };
  
  element.addEventListener('touchstart', touchStartHandler, { passive: false });
  element.addEventListener('touchmove', touchMoveHandler, { passive: false });
  
  return () => {
    element.removeEventListener('touchstart', touchStartHandler);
    element.removeEventListener('touchmove', touchMoveHandler);
  };
};

/**
 * Optimized mouse event handler with throttling
 * @param {HTMLElement} element - DOM element to attach listener to
 * @param {Function} handler - Event handler function
 * @param {number} wait - Throttle wait time in milliseconds
 */
export const addThrottledMouseListener = (element, handler, wait = 100) => {
  const throttledMoveHandler = throttle((e) => {
    if (e.buttons > 0) {
      handler(e.clientX, e.clientY, e);
    }
  }, wait);
  
  const mouseDownHandler = (e) => {
    handler(e.clientX, e.clientY, e);
  };
  
  element.addEventListener('mousemove', throttledMoveHandler);
  element.addEventListener('mousedown', mouseDownHandler);
  
  return () => {
    element.removeEventListener('mousemove', throttledMoveHandler);
    element.removeEventListener('mousedown', mouseDownHandler);
  };
};

/**
 * Utility to add multiple event listeners and get a single cleanup function
 * @param {Array} listenerSetups - Array of setup functions that return cleanup functions
 * @returns {Function} - Combined cleanup function
 */
export const combineEventListeners = (listenerSetups) => {
  const cleanupFunctions = listenerSetups.map(setup => setup());
  return () => cleanupFunctions.forEach(cleanup => cleanup());
};
