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
router.get('/check-api', geminiController.checkApiConnection);

// Endpoints principales
router.post('/', geminiController.generateContent);
router.get('/', geminiController.generateContentGet);
router.post('/function-calling', geminiController.functionCalling);

// Endpoints de análisis expandidos
router.post('/analyze', geminiController.analyzeText);
router.post('/compare', geminiController.compareTexts); // Nueva función

// Embeddings API
router.post('/embeddings/index', geminiController.upsertEmbeddingsIndex);
router.post('/embeddings/search', geminiController.searchEmbeddings);
router.delete('/embeddings/index/:name', geminiController.clearEmbeddingsIndex);

// Context cache stats
router.get('/context-cache/stats', geminiController.getContextCacheStats);

// === NUEVAS RUTAS: BATCH PROCESSING ===
// Procesamiento en lotes
router.post('/batch/generate', geminiController.processBatchGeneration);
router.post('/batch/embeddings', geminiController.processBatchEmbeddings);
router.post('/batch/analyze', geminiController.processBatchAnalysis);

// Gestión de batch jobs
router.get('/batch/status/:batchId', geminiController.getBatchStatus);
router.get('/batch/active', geminiController.getActiveBatches);
router.delete('/batch/:batchId', geminiController.cancelBatch);
router.get('/batch/stats', geminiController.getBatchStats);

// === NUEVAS RUTAS: ANALYTICS AVANZADAS ===
// Métricas y monitoreo
router.get('/analytics/metrics', geminiController.getAdvancedMetrics);
router.get('/analytics/realtime', geminiController.getRealTimeMetrics);
router.get('/analytics/insights', geminiController.getSystemInsights);
router.get('/analytics/stream', geminiController.streamMetrics);

// Gestión de métricas
router.post('/analytics/export', geminiController.exportMetrics);
router.post('/analytics/reset', geminiController.resetMetrics);

// Endpoints existentes
router.delete('/cache', geminiController.clearCache);
router.get('/models', geminiController.getAvailableModels);
router.get('/stats', geminiController.getUsageStats);

export default router;
