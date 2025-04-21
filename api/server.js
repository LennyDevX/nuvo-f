// ESM compatible with Vercel
import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware
// Configuración CORS más específica (ajusta según tus necesidades en producción)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-production-frontend-url.vercel.app'] // Reemplaza con tu URL de Vercel
  : ['http://localhost:3000', 'http://localhost:3001']; // Permite Vite dev y Vercel dev

app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin 'origin' (como Postman o curl) o desde orígenes permitidos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Si necesitas enviar cookies o encabezados de autorización
}));

// Habilitar pre-flight para todas las rutas
app.options('*', cors());

app.use(express.json());

// Ruta básica para pruebas
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hola desde el backend Serverless!' });
});

// Ruta para verificar status
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development'
  });
});

// Ruta para obtener datos del contrato de staking (Simulación)
app.get('/api/staking/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validación más robusta de la dirección
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Dirección inválida. Debe ser una dirección de Ethereum válida.'
      });
    }

    // Simulación de datos (igual que antes)
    const stakingData = {
      address,
      depositAmount: '1000000000000000000', // 1 ETH
      pendingRewards: '50000000000000000', // 0.05 ETH
      apy: 12.5,
      timeStaked: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 días atrás
      lastUpdated: Date.now()
    };

    res.status(200).json(stakingData);
  } catch (error) {
    console.error('Error fetching staking data:', error);
    res.status(500).json({
      error: 'Error al obtener datos de staking',
      message: error.message
    });
  }
});

// Ruta para el historial de transacciones (Simulación)
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Dirección inválida' });
    }

    // Datos simulados (igual que antes)
    const transactions = [
      {
        id: 'tx1',
        type: 'deposit',
        amount: '500000000000000000', // 0.5 ETH
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 días atrás
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
      },
      {
        id: 'tx2',
        type: 'claim',
        amount: '25000000000000000', // 0.025 ETH
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 días atrás
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678'
      }
    ];

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// Middleware para manejar rutas no encontradas dentro de /api
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// Manejador para Vercel serverless functions
// No es necesario cambiar esto, Vercel lo maneja.
export default app; // Exportar directamente la app de Express es común en Vercel