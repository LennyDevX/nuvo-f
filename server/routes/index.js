import express from 'express';
import geminiRoutes from './gemini-routes.js';
import errorHandler from '../middlewares/error-handler.js'; // Add import

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

// Remove inline error handler and use shared one
router.use(errorHandler);

export default router;
