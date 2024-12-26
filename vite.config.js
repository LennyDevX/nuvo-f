// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { cspConfig } from './src/security/contentSecurityPolicy';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      '@': '/src',
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
    },
    include: ['react', 'react-dom', 'framer-motion'],
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': Object.entries(cspConfig.directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ')
    }
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['react-chartjs-2', 'chart.js'],
        }
      }
    }
  }
});