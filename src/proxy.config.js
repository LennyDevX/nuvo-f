export const proxyConfig = {
  '/api/dodoex': {
    target: 'https://api.dodoex.io',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      '^/api/dodoex': ''
    }
  },
  '/server': {
    target: 'http://localhost:3001', // Cambia el puerto si tu backend usa otro
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/server': ''
    }
  }
};
