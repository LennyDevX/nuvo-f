// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true
    })
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      util: 'util',
      process: 'process/browser'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env': {},
    global: 'globalThis'
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.gstatic.com https://*.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://*.googleapis.com",
        "img-src 'self' data: https://*.gstatic.com https://*.googleapis.com",
        "connect-src 'self' https://*.google.com https://*.googleapis.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://api.ipify.org https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com",
        "frame-src 'self' https://*.google.com https://www.google.com/recaptcha/",
        "font-src 'self' data: https://*.gstatic.com",
        "form-action 'self'",
        "worker-src 'self' blob:",
        "frame-ancestors 'self'"
      ].join('; ')
    }
  }
});