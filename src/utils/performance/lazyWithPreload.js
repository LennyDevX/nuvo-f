import { lazy } from 'react';

/**
 * Enhanced lazy loading with preload capability and Suspense support
 * @param {Function} factory - Import function
 * @returns {Object} Component with preload method
 */
const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = () => factory();
  return Component;
};

export default lazyWithPreload;
