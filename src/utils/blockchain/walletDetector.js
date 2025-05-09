export const detectWallet = () => {
  const { ethereum } = window;
  
  if (!ethereum) {
    return {
      available: false,
      type: null,
      reason: 'No Web3 wallet detected'
    };
  }

  // Detect different wallet providers
  const isMetaMask = ethereum.isMetaMask;
  const isTrust = ethereum.isTrust;
  const isCoinbase = ethereum.isCoinbaseWallet;
  
  // Check if multiple wallets are installed
  const hasMultipleWallets = Object.keys(ethereum.providers || {}).length > 1;
  
  // Determine primary wallet
  let primaryWallet = 'unknown';
  if (isMetaMask) primaryWallet = 'metamask';
  if (isTrust) primaryWallet = 'trust';
  if (isCoinbase) primaryWallet = 'coinbase';

  return {
    available: true,
    type: primaryWallet,
    hasMultipleWallets,
    providers: ethereum.providers,
    isExtension: !navigator.userAgent.match(/Android|iPhone|iPad|iPod/i),
    isMobile: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)
  };
};

export const getWalletDownloadLink = (walletType) => {
  const links = {
    metamask: {
      extension: 'https://metamask.io/download/',
      android: 'https://play.google.com/store/apps/details?id=io.metamask',
      ios: 'https://apps.apple.com/us/app/metamask/id1438144202'
    },
    trust: {
      extension: 'https://trustwallet.com/browser-extension',
      android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      ios: 'https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409'
    }
  };

  return links[walletType] || links.metamask;
};

export const openWalletDeepLink = (walletType, dappUrl) => {
  const deepLinks = {
    metamask: `metamask://dapp/${dappUrl}`,
    trust: `trust://open_url?url=${dappUrl}`,
  };

  // Try to open deep link
  window.location.href = deepLinks[walletType];

  // Fallback timer to redirect to store if deep link fails
  setTimeout(() => {
    const links = getWalletDownloadLink(walletType);
    const os = getMobileOS();
    window.location.href = links[os] || links.extension;
  }, 1500);
};

export const getMobileOS = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'extension';
};
