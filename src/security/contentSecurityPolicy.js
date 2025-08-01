export const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'connect-src': [
      "'self'",
      'https://api.gemini.com',
      'https://generativelanguage.googleapis.com',
      'https://polygon-rpc.com',
      'https://polygon.drpc.org',
      'https://mumbai.polygonscan.com',
      'https://polygonscan.com',
      'https://api.polygonscan.com',
      'https://api-testnet.polygonscan.com',
      'wss://polygon-rpc.com',
      'wss://polygon.drpc.org'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://images.dodoex.io',
      'https://*.nftstorage.link',
      'https://*.dodoex.io',
      'https://static.okx.com',
      'https://polygonscan.com',
      'https://*.googleapis.com',
      'https://gateway.pinata.cloud',
      'https://ipfs.io',
      'https://cloudflare-ipfs.com',
      'https://dweb.link',
      'https://*.ipfs.dweb.link',
      'https://*.ipfs.cf-ipfs.com',
      'https://ipfs.cf-ipfs.com',
      'https://*.ipfs.nftstorage.link',
      'https://nftstorage.link', // Add explicit domain without wildcard
      'https://*.ipfs.w3s.link',
      'https://w3s.link',
      'https://gateway.ipfs.io',
      'https://nuvos.app',
      'https://*.nuvos.app',
      'https://*.vercel.app',
      // Add popular NFT image hosts
      'https://*.arweave.net',
      'https://*.infura-ipfs.io'
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://*.firebaseapp.com',
      'https://apis.google.com',
      'https://*.vercel.app',
      'https://*.vercel.com',
      'https://vercel.live'
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'frame-src': [
      "'self'",
      'https://widget.dodoex.io',
      'https://*.firebaseapp.com',
      'https://*.vercel.app',
      'https://*.vercel.com'
    ],
    'worker-src': [
      "'self'",
      'blob:',
      'data:'
    ]
  }
};
