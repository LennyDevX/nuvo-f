export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getMobileDeepLinks = () => {
  return {
    metamask: {
      android: 'https://metamask.app.link/dapp/',
      ios: 'metamask://dapp/',
    },
    trust: {
      android: 'https://link.trustwallet.com/open_url?url=',
      ios: 'trust://',
    }
  };
};

export const openWalletApp = (wallet = 'metamask') => {
  const deepLinks = getMobileDeepLinks();
  const currentUrl = window.location.href;
  
  if (isMobile()) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isAndroid) {
      window.location.href = `${deepLinks[wallet].android}${currentUrl}`;
    } else if (isIOS) {
      window.location.href = `${deepLinks[wallet].ios}${currentUrl}`;
    }
  }
};

/**
 * More reliable check for mobile devices using feature detection
 * alongside user agent
 */
export const isMobileDevice = () => {
  // Feature detection
  const hasTouchScreen = (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
  
  // User agent check as fallback
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return hasTouchScreen && isMobileUA;
};

/**
 * Detect low-performance devices (useful for graphics optimization)
 */
export const isLowPerformanceDevice = () => {
  // Check if mobile first
  const mobile = isMobileDevice();
  
  // Memory check if available
  const lowMemory = 'deviceMemory' in navigator && navigator.deviceMemory < 4;
  
  // CPU cores check if available
  const lowCPU = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4;
  
  // Basic heuristic: consider it low performance if it's mobile AND has either low memory or low CPU
  return mobile && (lowMemory || lowCPU);
};

/**
 * Get recommended particle count based on device performance
 * @param {number} highPerformance - Particle count for high-performance devices
 * @param {number} mediumPerformance - Particle count for medium-performance devices
 * @param {number} lowPerformance - Particle count for low-performance devices
 */
export const getRecommendedParticleCount = (
  highPerformance = 200, 
  mediumPerformance = 120, 
  lowPerformance = 80
) => {
  if (isLowPerformanceDevice()) {
    return lowPerformance;
  }
  
  if (isMobileDevice()) {
    return mediumPerformance;
  }
  
  return highPerformance;
};
