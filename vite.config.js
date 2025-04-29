// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

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
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'recharts'],
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
    cors: true,
    watch: {
      usePolling: true
    }  
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
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  assetsInclude: ['**/*.html'],
  experimental: {
    renderBuiltUrl(filename) {
      return filename;
    }
  }
});