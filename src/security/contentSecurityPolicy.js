export const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'connect-src': [
      "'self'",
      'https://api.dodoex.io',
      'https://polygon-mainnet.g.alchemy.com',
      'wss://polygon-mainnet.g.alchemy.com',
      'https://images.dodoex.io',
      'https://*.googleapis.com',
      'https://*.firebase.com',
      'https://*.firebaseio.com',
      'https://identitytoolkit.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https://images.dodoex.io',
      'https://polygonscan.com',
      'https://*.googleapis.com'
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://*.firebaseapp.com'
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'frame-src': [
      "'self'",
      'https://widget.dodoex.io',
      'https://*.firebaseapp.com'
    ]
  }
};
