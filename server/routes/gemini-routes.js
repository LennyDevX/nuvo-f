import express from 'express';
import * as geminiController from '../controllers/gemini-controller.js';
import rateLimiter from '../middlewares/rate-limiter.js';
import auth from '../middlewares/auth.js';
import logger from '../middlewares/logger.js';

const router = express.Router();

// Aplicar middleware en todas las rutas de Gemini
router.use(logger);
router.use(rateLimiter);
router.use(auth);

// Endpoints de salud y prueba
router.get('/health', geminiController.getHealthStatus);
router.get('/hello', geminiController.helloCheck);

// Endpoints principales
router.post('/', geminiController.generateContent);
router.get('/', geminiController.generateContentGet);
router.post('/function-calling', geminiController.functionCalling);

export default router;
