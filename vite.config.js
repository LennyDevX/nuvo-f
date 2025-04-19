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
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'recharts'],
  },
  server: {
    port: 3000, // Cambiado para coincidir con el puerto que estás usando
    strictPort: false, // Cambiado a false para permitir fallback a otros puertos si el 3000 está ocupado
    headers: {
      'Content-Security-Policy': Object.entries(cspConfig.directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; '),
    },
    open: true,
    cors: true,
    hmr: {
      // Use manual to ensure WebSocket works properly
      protocol: 'ws',
      host: 'localhost',
      port: 3000 // Actualizado para coincidir con el puerto del servidor
    },
    watch: {
      // Required for some Windows setups
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
  // Añadir esta configuración para manejar correctamente los archivos HTML
  assetsInclude: ['**/*.html'],
  // No generar CSP en línea, ya que ya lo tenemos en el HTML
  experimental: {
    renderBuiltUrl(filename) {
      return filename;
    }
  }
});