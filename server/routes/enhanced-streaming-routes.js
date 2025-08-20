/**
 * Rutas para Streaming Mejorado
 * Expone endpoints para todas las funcionalidades de streaming avanzado
 */

import express from 'express';
import enhancedStreamingController from '../controllers/streaming-controller.js';
import rateLimiter from '../middlewares/rate-limiter.js';
import auth from '../middlewares/auth.js';
import logger from '../middlewares/logger.js';

const router = express.Router();

// Aplicar middleware a todas las rutas
router.use(logger);
router.use(auth);

// Usar el middleware de rate limiting directamente
const streamingRateLimit = rateLimiter;
const metricsRateLimit = rateLimiter;

/**
 * @route POST /api/streaming/enhanced
 * @desc Streaming semántico mejorado con todas las funcionalidades
 * @access Private
 * @body {
 *   prompt: string,
 *   options?: object,
 *   streamingConfig?: {
 *     semanticChunking?: boolean,
 *     contextualPauses?: boolean,
 *     variableSpeed?: boolean,
 *     chunkSize?: string|number,
 *     pauseMultiplier?: number,
 *     speedMultiplier?: number,
 *     bufferSize?: number,
 *     flushInterval?: number
 *   },
 *   uxConfig?: {
 *     showTypingIndicator?: boolean,
 *     showProgress?: boolean,
 *     syntaxHighlighting?: boolean,
 *     smoothScrolling?: boolean,
 *     progressLabels?: object
 *   },
 *   websocketEnabled?: boolean
 * }
 */
router.post('/enhanced', streamingRateLimit, async (req, res) => {
  await enhancedStreamingController.streamWithEnhancements(req, res);
});

/**
 * @route GET /api/streaming/metrics
 * @desc Obtiene métricas de streaming activo
 * @access Private
 */
router.get('/metrics', metricsRateLimit, (req, res) => {
  enhancedStreamingController.getActiveStreamMetrics(req, res);
});

/**
 * @route POST /api/streaming/:sessionId/pause
 * @desc Pausa un stream activo
 * @access Private
 */
router.post('/:sessionId/pause', streamingRateLimit, async (req, res) => {
  await enhancedStreamingController.pauseStream(req, res);
});

/**
 * @route POST /api/streaming/:sessionId/resume
 * @desc Reanuda un stream pausado
 * @access Private
 */
router.post('/:sessionId/resume', streamingRateLimit, async (req, res) => {
  await enhancedStreamingController.resumeStream(req, res);
});

/**
 * @route POST /api/streaming/:sessionId/stop
 * @desc Detiene un stream activo
 * @access Private
 */
router.post('/:sessionId/stop', streamingRateLimit, async (req, res) => {
  await enhancedStreamingController.stopStream(req, res);
});

/**
 * @route GET /api/streaming/health
 * @desc Health check para el servicio de streaming
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      semanticStreaming: 'active',
      websocketStreaming: 'active',
      uxEnhancements: 'active'
    },
    version: '1.0.0'
  });
});

/**
 * @route GET /api/streaming/config
 * @desc Obtiene configuración por defecto para streaming
 * @access Private
 */
router.get('/config', (req, res) => {
  res.json({
    defaultStreamingConfig: {
      semanticChunking: true,
      contextualPauses: true,
      variableSpeed: true,
      chunkSize: 'auto',
      pauseMultiplier: 1.0,
      speedMultiplier: 1.0,
      bufferSize: 1024,
      flushInterval: 50
    },
    defaultUxConfig: {
      showTypingIndicator: true,
      showProgress: true,
      syntaxHighlighting: true,
      smoothScrolling: true,
      progressLabels: {
        thinking: 'Analizando solicitud...',
        processing: 'Procesando información...',
        streaming: 'Generando respuesta...',
        complete: 'Completado'
      }
    },
    supportedLanguages: [
      'javascript',
      'python',
      'css',
      'html',
      'json',
      'text'
    ],
    compressionSupport: [
      'br',
      'gzip',
      'deflate'
    ]
  });
});

/**
 * @route POST /api/streaming/test
 * @desc Endpoint de prueba para streaming
 * @access Private
 */
router.post('/test', streamingRateLimit, async (req, res) => {
  const { testType = 'basic', duration = 5000 } = req.body;
  
  try {
    // Configurar headers de streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const sessionId = `test_${Date.now()}`;
    const startTime = Date.now();
    
    // Diferentes tipos de prueba
    switch (testType) {
      case 'semantic':
        await testSemanticStreaming(res, sessionId, duration);
        break;
        
      case 'syntax':
        await testSyntaxHighlighting(res, sessionId, duration);
        break;
        
      case 'progress':
        await testProgressIndicators(res, sessionId, duration);
        break;
        
      default:
        await testBasicStreaming(res, sessionId, duration);
    }
    
    // Finalizar test
    res.write(`data: ${JSON.stringify({
      type: 'test_complete',
      sessionId,
      testType,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    res.end();
  }
});

// Funciones de prueba
async function testBasicStreaming(res, sessionId, duration) {
  const message = 'Este es un test de streaming básico. ';
  const chunks = message.split(' ');
  const interval = duration / chunks.length;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '');
    
    res.write(`data: ${JSON.stringify({
      type: 'content_chunk',
      sessionId,
      chunk: {
        content: chunk,
        index: i,
        total: chunks.length,
        contentType: 'text'
      },
      timestamp: Date.now()
    })}\n\n`);
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function testSemanticStreaming(res, sessionId, duration) {
  const sentences = [
    'Esta es una oración simple.',
    'Aquí tenemos un concepto más complejo que requiere mayor procesamiento.',
    'Código: `function test() { return "hello"; }`',
    'Lista: 1. Primer elemento 2. Segundo elemento 3. Tercer elemento',
    'Conclusión final del test.'
  ];
  
  const baseInterval = duration / sentences.length;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    let contentType = 'text';
    let pause = baseInterval;
    
    // Detectar tipo de contenido
    if (sentence.includes('`')) {
      contentType = 'code';
      pause *= 1.5; // Pausa más larga para código
    } else if (sentence.includes('complejo')) {
      contentType = 'complex';
      pause *= 1.3; // Pausa más larga para conceptos complejos
    } else if (sentence.includes('Lista:')) {
      contentType = 'list';
      pause *= 1.2;
    }
    
    res.write(`data: ${JSON.stringify({
      type: 'content_chunk',
      sessionId,
      chunk: {
        content: sentence,
        index: i,
        total: sentences.length,
        contentType,
        pause: Math.round(pause),
        semantic: true
      },
      timestamp: Date.now()
    })}\n\n`);
    
    await new Promise(resolve => setTimeout(resolve, pause));
  }
}

async function testSyntaxHighlighting(res, sessionId, duration) {
  const codeBlocks = [
    {
      language: 'javascript',
      code: 'const message = "Hello, World!";'
    },
    {
      language: 'python',
      code: 'def greet(name):\n    return f"Hello, {name}!"'
    },
    {
      language: 'css',
      code: '.container { display: flex; justify-content: center; }'
    },
    {
      language: 'html',
      code: '<div class="container"><h1>Title</h1></div>'
    }
  ];
  
  const interval = duration / codeBlocks.length;
  
  for (let i = 0; i < codeBlocks.length; i++) {
    const block = codeBlocks[i];
    
    res.write(`data: ${JSON.stringify({
      type: 'content_chunk',
      sessionId,
      chunk: {
        content: block.code,
        language: block.language,
        index: i,
        total: codeBlocks.length,
        contentType: 'code',
        highlighted: true
      },
      timestamp: Date.now()
    })}\n\n`);
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function testProgressIndicators(res, sessionId, duration) {
  const steps = 20;
  const interval = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const progress = Math.round((i / steps) * 100);
    
    res.write(`data: ${JSON.stringify({
      type: 'progress_indicator',
      sessionId,
      percentage: progress,
      currentStep: i,
      totalSteps: steps,
      message: `Procesando paso ${i} de ${steps}`,
      timestamp: Date.now()
    })}\n\n`);
    
    if (i < steps) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

// Middleware de manejo de errores específico para streaming
router.use((error, req, res, next) => {
  console.error('Error en streaming routes:', error);
  
  if (res.headersSent) {
    // Si ya se enviaron headers (streaming en progreso), enviar error como evento
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: {
        message: error.message,
        timestamp: Date.now()
      }
    })}\n\n`);
    res.end();
  } else {
    // Error antes de iniciar streaming
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;