// ESM compatible with Vercel
import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware
app.use(cors({ 
  origin: '*', // En producción, deberías limitar esto
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Ruta para obtener datos del contrato de staking
app.get('/api/staking/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || address.length !== 42) {
      return res.status(400).json({ 
        error: 'Dirección inválida. Debe ser una dirección de Ethereum válida.'
      });
    }
    
    // Simulación de datos
    const stakingData = {
      address,
      depositAmount: '1000000000000000000', // 1 ETH
      pendingRewards: '50000000000000000', // 0.05 ETH
      apy: 12.5,
      timeStaked: Date.now() - 1000 * 60 * 60 * 24 * 7,
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

// Ruta para el historial de transacciones
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || address.length !== 42) {
      return res.status(400).json({ error: 'Dirección inválida' });
    }
    
    // Datos simulados
    const transactions = [
      {
        id: 'tx1',
        type: 'deposit',
        amount: '500000000000000000', // 0.5 ETH
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
        hash: '0x123...abc'
      },
      {
        id: 'tx2',
        type: 'claim',
        amount: '25000000000000000', // 0.025 ETH
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        hash: '0x456...def'
      }
    ];
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// Manejador para Vercel serverless functions
const handler = async (req, res) => {
  // No es necesario usar el app.listen() porque Vercel maneja esto
  return new Promise((resolve, reject) => {
    app(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default handler;