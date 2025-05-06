import express from 'express';
import geminiRoutes from './gemini-routes.js';

const router = express.Router();

// Ruta de prueba general para verificar que el servidor está funcionando
router.get('/hello', (_, res) => {
  res.json({ 
    message: 'Hola desde el servidor de Nuvos-App!',
    timestamp: new Date().toISOString()
  });
});

// Usar el router de Gemini
router.use('/gemini', geminiRoutes);

export default router;
