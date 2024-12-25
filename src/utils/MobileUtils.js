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
