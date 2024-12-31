// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { cspConfig } from './src/security/contentSecurityPolicy';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
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
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': Object.entries(cspConfig.directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; '),
    },
    open: true,
    cors: true
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          'home': ['./src/components/pages/home/Home.jsx'],
          'staking': ['./src/components/pages/StakingDashboard/DashboardStaking.jsx'],
          'chart-vendor': ['react-chartjs-2', 'chart.js'],
          'framer': ['framer-motion'],
          'ethers': ['ethers']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});