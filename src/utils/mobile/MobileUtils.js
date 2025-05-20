import { detectDevice } from '../../hooks/mobile/useDeviceDetection';

/**
 * @deprecated Use useDeviceDetection().isMobile instead
 */
export const isMobile = () => {
  console.warn("Deprecated: Use useDeviceDetection().isMobile instead");
  return detectDevice().isMobile;
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
  const device = detectDevice();
  
  if (device.isMobile) {
    if (device.isAndroid) {
      window.location.href = `${deepLinks[wallet].android}${currentUrl}`;
    } else if (device.isIOS) {
      window.location.href = `${deepLinks[wallet].ios}${currentUrl}`;
    }
  }
};

/**
 * @deprecated Use useDeviceDetection().isMobileDevice() instead
 */
export const isMobileDevice = () => {
  console.warn("Deprecated: Use useDeviceDetection().isMobileDevice() instead");
  return detectDevice().isMobile;
};

/**
 * @deprecated Use useDeviceDetection().isLowPerformance instead
 */
export const isLowPerformanceDevice = () => {
  console.warn("Deprecated: Use useDeviceDetection().isLowPerformance instead");
  return detectDevice().isLowPerformance;
};

/**
 * @deprecated Use useDeviceDetection().getRecommendedParticleCount() instead
 */
export const getRecommendedParticleCount = (
  highPerformance = 200, 
  mediumPerformance = 120, 
  lowPerformance = 80
) => {
  console.warn("Deprecated: Use useDeviceDetection().getRecommendedParticleCount() instead");
  const device = detectDevice();
  
  if (device.isLowPerformance) {
    return lowPerformance;
  }
  
  if (device.isMobile) {
    return mediumPerformance;
  }
  
  return highPerformance;
};
