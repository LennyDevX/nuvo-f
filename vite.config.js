// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  plugins: [react()],
  base: './', // Add a relative base path for production builds
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
        },
        assetFileNames: (assetInfo) => {
          // Prevent HTML files from being processed as standard assets
          if (assetInfo.name.endsWith('.html')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Handle URLs differently based on host type
      if (hostType === 'js') {
        return { relative: true };
      }
      return { relative: true };
    }
  }
});