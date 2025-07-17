export const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'connect-src': [
      "'self'",
      'data:',
      'https://api.dodoex.io',
      'https://*.nftstorage.link',

      'https://polygon-mainnet.g.alchemy.com',
      'wss://polygon-mainnet.g.alchemy.com',
      'https://*.alchemy.com',
      'wss://*.alchemy.com',
      'https://*.googleapis.com',
      'https://*.firebase.com',
      'https://*.firebaseio.com',
      'https://*.firebaseapp.com',
      'https://firestore.googleapis.com',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://space-nft-6acba.firebaseapp.com',
      'https://space-nft-6acba-default-rtdb.firebaseio.com',
      'wss://*.firebaseio.com',
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://matic-mainnet.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-mumbai.chainstacklabs.com',
      'https://*.vercel.app',
      'https://*.vercel.com',
      'https://vercel.live',
      import.meta.env.MODE === 'development' ? 'ws://localhost:*' : null,
      import.meta.env.MODE === 'development' ? 'wss://localhost:*' : null
    ].filter(Boolean),
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
    ]
  }
};
