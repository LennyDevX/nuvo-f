export const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'connect-src': [
      "'self'",
      'data:',
      'https://api.dodoex.io',
      'https://polygon-mainnet.g.alchemy.com',
      'wss://polygon-mainnet.g.alchemy.com',
      "https://api.pinata.cloud",
      "https://gateway.pinata.cloud",
      "https://ipfs.io",
      "https://cloudflare-ipfs.com",
      "https://*.ipfs.dweb.link",
      "https://*.ipfs.cf-ipfs.com",
      "https://*.ipfs.nftstorage.link", 
      "https://*.ipfs.w3s.link",
      'https://*.dodoex.io',
      'https://nuvos.app',
      'https://*.nuvos.app',
      'https://*.alchemy.com',
      'wss://*.alchemy.com',
      'https://*.googleapis.com',
      'https://*.firebase.com',
      'https://*.firebaseio.com',
      'https://identitytoolkit.googleapis.com',
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-mumbai.chainstacklabs.com',
      process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : null,
      process.env.NODE_ENV === 'development' ? 'wss://localhost:*' : null
    ].filter(Boolean),
    'img-src': [
      "'self'",
      'data:',
      'https://images.dodoex.io',
      'https://*.dodoex.io',
      'https://static.okx.com',
      'https://polygonscan.com',
      'https://*.googleapis.com',
      'https://gateway.pinata.cloud',
      'https://ipfs.io',
      'https://cloudflare-ipfs.com',
      'https://*.ipfs.dweb.link',
      'https://*.ipfs.cf-ipfs.com',
      'https://*.ipfs.nftstorage.link',
      'https://*.ipfs.w3s.link',
      'https://nuvos.app',
      'https://*.nuvos.app'
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://*.firebaseapp.com',
      'https://apis.google.com'
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'frame-src': [
      "'self'",
      'https://widget.dodoex.io',
      'https://*.firebaseapp.com'
    ]
  }
};
