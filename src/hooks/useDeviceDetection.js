import { useState, useEffect } from 'react';

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowPerformance: false
  });

  useEffect(() => {
    // Check for mobile/tablet devices
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent.toLowerCase());
    
    // Determine if device is likely low performance
    let isLowPerformance = false;
    
    // Check for low memory devices (less than 4GB)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      isLowPerformance = true;
    }
    
    // Check for hardware concurrency (low CPU cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      isLowPerformance = true;
    }
    
    // Check for older mobile devices
    if (isMobile && userAgent.indexOf('Android') > -1) {
      const match = userAgent.match(/Android\s([0-9\.]*)/);
      const version = match ? parseFloat(match[1]) : 0;
      if (version < 8) {
        isLowPerformance = true;
      }
    }
    
    // iOS version check
    if (isMobile && /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      const match = userAgent.match(/OS\s([0-9_]*)/);
      const versionString = match ? match[1] : '0';
      const version = parseFloat(versionString.replace('_', '.'));
      if (version < 13) {
        isLowPerformance = true;
      }
    }

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isLowPerformance
    });
  }, []);

  return deviceInfo;
}
