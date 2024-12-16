// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer'
    }
  },
  define: {
    'process.env': {},
    global: {},
    'Buffer': ['buffer', 'Buffer']
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self' wss://*.alchemy.com https://*.alchemy.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net https://*.google.com https://*.googleapis.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://api.ipify.org ws://localhost:* http://localhost:*",
        "frame-src 'self' https://*.google.com",
        "font-src 'self' data:",
        "form-action 'self'",
        "worker-src 'self' blob:",
        "frame-ancestors 'self'"
      ].join('; ')
    }
  }
});