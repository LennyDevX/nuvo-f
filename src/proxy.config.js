export const proxyConfig = {
  '/api/dodoex': {
    target: 'https://api.dodoex.io',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      '^/api/dodoex': ''
    }
  }
};
