/**
 * Controlador de Streaming Mejorado
 * Integra todos los servicios de streaming avanzados
 */

import semanticStreamingService from '../services/semantic-streaming-service.js';
import websocketStreamingService from '../services/websocket-streaming-service.js';
import uxEnhancementService from '../services/ux-enhancement-service.js';
import { processGeminiStreamRequest, createOptimizedGeminiStream } from '../services/gemini-service.js';
import analyticsService from '../services/analytics-service.js';

class StreamingController {
  constructor() {
    this.activeStreams = new Map();
    this.streamMetrics = new Map();
  }

  /**
   * Endpoint principal para streaming semántico mejorado
   */
  async streamWithEnhancements(req, res) {
    const startTime = Date.now();
    const sessionId = req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Configurar headers optimizados
      this.setStreamingHeaders(res, req);
      
      // Extraer configuración del request
      const {
        prompt,
        options = {},
        streamingConfig = {},
        uxConfig = {},
        websocketEnabled = false
      } = req.body;

      // Validar entrada
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt es requerido' });
      }

      // Inicializar métricas
      analyticsService.startRequest(sessionId, {
        type: 'enhanced_streaming',
        prompt: prompt.substring(0, 100),
        config: { streamingConfig, uxConfig }
      });

      // Crear typing indicator inicial
      if (uxConfig.showTypingIndicator !== false) {
        const typingIndicator = uxEnhancementService.createTypingIndicator(sessionId, {
          type: 'thinking',
          animated: true,
          showProgress: uxConfig.showProgress
        });
        
        res.write(`data: ${JSON.stringify(typingIndicator)}\n\n`);
      }

      // Crear progress indicator si está habilitado
      let progressTracker = null;
      if (uxConfig.showProgress) {
        progressTracker = uxEnhancementService.createProgressIndicator(sessionId, {
          totalSteps: 100,
          showPercentage: true,
          showETA: true,
          customLabels: uxConfig.progressLabels || {}
        });
        
        res.write(`data: ${JSON.stringify(progressTracker)}\n\n`);
      }

      // Configurar streaming semántico
      const semanticConfig = {
        enableSemanticChunking: streamingConfig.semanticChunking !== false,
        enableContextualPauses: streamingConfig.contextualPauses !== false,
        enableVariableSpeed: streamingConfig.variableSpeed !== false,
        chunkSize: streamingConfig.chunkSize || 'auto',
        pauseMultiplier: streamingConfig.pauseMultiplier || 1.0,
        speedMultiplier: streamingConfig.speedMultiplier || 1.0,
        ...streamingConfig
      };

      // Actualizar typing indicator a "processing"
      if (uxConfig.showTypingIndicator !== false) {
        const updatedIndicator = uxEnhancementService.updateTypingIndicator(
          sessionId, 
          'processing',
          { customMessage: 'Procesando solicitud...' }
        );
        res.write(`data: ${JSON.stringify(updatedIndicator)}\n\n`);
      }

      // Obtener stream de Gemini
      const geminiStream = await processGeminiStreamRequest({
        prompt,
        ...options
      });

      if (!geminiStream) {
        throw new Error('No se pudo obtener el stream de Gemini');
      }

      // Crear stream optimizado
      const optimizedStream = createOptimizedGeminiStream(geminiStream, {
        compression: this.detectCompressionSupport(req),
        bufferSize: streamingConfig.bufferSize || 1024,
        flushInterval: streamingConfig.flushInterval || 50
      });

      // Actualizar typing indicator a "streaming"
      if (uxConfig.showTypingIndicator !== false) {
        const streamingIndicator = uxEnhancementService.updateTypingIndicator(
          sessionId,
          'streaming',
          { customMessage: 'Generando respuesta...' }
        );
        res.write(`data: ${JSON.stringify(streamingIndicator)}\n\n`);
      }

      // Registrar stream activo
      this.activeStreams.set(sessionId, {
        startTime,
        config: semanticConfig,
        uxConfig,
        status: 'streaming'
      });

      // Procesar stream con mejoras semánticas
      let accumulatedContent = '';
      let totalChunks = 0;
      let processedChunks = 0;

      const reader = optimizedStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          accumulatedContent += chunk;
          totalChunks++;

          // Procesar con streaming semántico
          const semanticChunks = await semanticStreamingService.processContentStream(
            chunk,
            accumulatedContent,
            semanticConfig
          );

          for (const semanticChunk of semanticChunks) {
            // Aplicar syntax highlighting si es código
            if (semanticChunk.contentType === 'code' && uxConfig.syntaxHighlighting !== false) {
              const highlighted = uxEnhancementService.applySyntaxHighlighting(
                semanticChunk.content,
                semanticChunk.language
              );
              semanticChunk.highlighted = highlighted;
            }

            // Calcular configuración de smooth scrolling
            if (uxConfig.smoothScrolling !== false) {
              semanticChunk.scrollConfig = uxEnhancementService.generateSmoothScrollConfig(
                semanticChunk.content.length,
                semanticConfig.speedMultiplier
              );
            }

            // Enviar chunk procesado
            const streamData = {
              type: 'content_chunk',
              sessionId,
              chunk: semanticChunk,
              metadata: {
                chunkIndex: processedChunks++,
                totalProcessed: processedChunks,
                timestamp: Date.now(),
                processingTime: Date.now() - startTime
              }
            };

            res.write(`data: ${JSON.stringify(streamData)}\n\n`);

            // Actualizar progress si está habilitado
            if (progressTracker && totalChunks > 0) {
              const progress = Math.min(95, Math.round((processedChunks / totalChunks) * 100));
              const updatedProgress = uxEnhancementService.updateProgress(sessionId, progress, {
                customMessage: `Procesando chunk ${processedChunks}/${totalChunks}`
              });
              res.write(`data: ${JSON.stringify(updatedProgress)}\n\n`);
            }

            // Aplicar pausa contextual si está configurada
            if (semanticChunk.pause > 0) {
              await new Promise(resolve => setTimeout(resolve, semanticChunk.pause));
            }
          }
        }

        // Finalizar stream
        await this.finalizeStream(sessionId, res, {
          totalChunks: processedChunks,
          totalTime: Date.now() - startTime,
          contentLength: accumulatedContent.length,
          uxConfig
        });

        // Registrar métricas finales
        analyticsService.endRequest(sessionId, {
          success: true,
          responseTime: Date.now() - startTime,
          chunksProcessed: processedChunks,
          contentLength: accumulatedContent.length
        });

      } finally {
        reader.releaseLock();
        this.activeStreams.delete(sessionId);
      }

    } catch (error) {
      console.error('Error en streaming mejorado:', error);
      
      // Registrar error
      analyticsService.failRequest(sessionId, error.message);
      
      // Enviar error al cliente
      const errorData = {
        type: 'error',
        sessionId,
        error: {
          message: error.message,
          timestamp: Date.now()
        }
      };
      
      res.write(`data: ${JSON.stringify(errorData)}\n\n`);
      res.end();
    }
  }

  /**
   * Endpoint para WebSocket streaming
   */
  async handleWebSocketStream(ws, req) {
    const sessionId = req.headers['x-session-id'] || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Registrar conexión WebSocket
      await websocketStreamingService.handleConnection(ws, {
        sessionId,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });

      // Configurar handlers de mensajes
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleWebSocketMessage(sessionId, data, ws);
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      });

      ws.on('close', () => {
        websocketStreamingService.handleDisconnection(sessionId);
        this.activeStreams.delete(sessionId);
      });

    } catch (error) {
      console.error('Error en WebSocket streaming:', error);
      ws.close(1011, error.message);
    }
  }

  /**
   * Maneja mensajes de WebSocket
   */
  async handleWebSocketMessage(sessionId, data, ws) {
    const { type, payload } = data;

    switch (type) {
      case 'start_stream':
        await this.startWebSocketStream(sessionId, payload, ws);
        break;
        
      case 'pause_stream':
        await websocketStreamingService.pauseStream(sessionId);
        break;
        
      case 'resume_stream':
        await websocketStreamingService.resumeStream(sessionId);
        break;
        
      case 'stop_stream':
        await websocketStreamingService.stopStream(sessionId);
        break;
        
      case 'update_preferences':
        await websocketStreamingService.updateStreamPreferences(sessionId, payload);
        break;
        
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Tipo de mensaje no reconocido: ${type}`
        }));
    }
  }

  /**
   * Inicia streaming a través de WebSocket
   */
  async startWebSocketStream(sessionId, config, ws) {
    const { prompt, options = {}, streamingConfig = {}, uxConfig = {} } = config;
    
    if (!prompt) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Prompt es requerido'
      }));
      return;
    }

    try {
      // Usar el servicio de WebSocket streaming
      await websocketStreamingService.streamContent(sessionId, {
        prompt,
        options,
        streamingConfig: {
          enableSemanticChunking: true,
          enableContextualPauses: true,
          enableVariableSpeed: true,
          ...streamingConfig
        },
        uxConfig: {
          showTypingIndicator: true,
          showProgress: true,
          syntaxHighlighting: true,
          smoothScrolling: true,
          ...uxConfig
        }
      });

    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }

  /**
   * Finaliza un stream
   */
  async finalizeStream(sessionId, res, metadata) {
    const { totalChunks, totalTime, contentLength, uxConfig } = metadata;

    // Completar progress indicator
    if (uxConfig.showProgress) {
      const completedProgress = uxEnhancementService.completeProgress(sessionId);
      if (completedProgress) {
        res.write(`data: ${JSON.stringify(completedProgress)}\n\n`);
      }
    }

    // Detener typing indicator
    if (uxConfig.showTypingIndicator !== false) {
      const stoppedIndicator = uxEnhancementService.stopTypingIndicator(sessionId);
      if (stoppedIndicator) {
        res.write(`data: ${JSON.stringify(stoppedIndicator)}\n\n`);
      }
    }

    // Enviar métricas finales
    const finalMetrics = {
      type: 'stream_complete',
      sessionId,
      metrics: {
        totalChunks,
        totalTime,
        contentLength,
        averageChunkTime: totalTime / totalChunks,
        throughput: (contentLength / totalTime) * 1000, // caracteres por segundo
        timestamp: Date.now()
      }
    };

    res.write(`data: ${JSON.stringify(finalMetrics)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }

  /**
   * Configura headers optimizados para streaming
   */
  setStreamingHeaders(res, req) {
    // Headers básicos de SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Content-Type, X-Session-ID');
    
    // Headers de compresión
    const compression = this.detectCompressionSupport(req);
    if (compression) {
      res.setHeader('Content-Encoding', compression);
    }
    
    // Headers de optimización
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Headers HTTP/2 Server Push hints
    if (req.httpVersion === '2.0') {
      res.setHeader('Link', '</api/gemini/stream>; rel=preload; as=fetch');
    }
  }

  /**
   * Detecta soporte de compresión del cliente
   */
  detectCompressionSupport(req) {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (acceptEncoding.includes('br')) {
      return 'br'; // Brotli
    } else if (acceptEncoding.includes('gzip')) {
      return 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      return 'deflate';
    }
    
    return null;
  }

  /**
   * Obtiene métricas de streaming activo
   */
  getActiveStreamMetrics(req, res) {
    const metrics = {
      activeStreams: this.activeStreams.size,
      streams: Array.from(this.activeStreams.entries()).map(([sessionId, stream]) => ({
        sessionId,
        duration: Date.now() - stream.startTime,
        status: stream.status,
        config: stream.config
      })),
      websocketConnections: websocketStreamingService.getConnectionCount(),
      uxStats: uxEnhancementService.getStats(),
      systemMetrics: {
        timestamp: Date.now(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    res.json(metrics);
  }

  /**
   * Endpoint para pausar un stream
   */
  async pauseStream(req, res) {
    const { sessionId } = req.params;
    
    try {
      const stream = this.activeStreams.get(sessionId);
      if (!stream) {
        return res.status(404).json({ error: 'Stream no encontrado' });
      }

      stream.status = 'paused';
      
      // Si es WebSocket, usar el servicio correspondiente
      if (websocketStreamingService.hasConnection(sessionId)) {
        await websocketStreamingService.pauseStream(sessionId);
      }

      res.json({ success: true, sessionId, status: 'paused' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Endpoint para reanudar un stream
   */
  async resumeStream(req, res) {
    const { sessionId } = req.params;
    
    try {
      const stream = this.activeStreams.get(sessionId);
      if (!stream) {
        return res.status(404).json({ error: 'Stream no encontrado' });
      }

      stream.status = 'streaming';
      
      // Si es WebSocket, usar el servicio correspondiente
      if (websocketStreamingService.hasConnection(sessionId)) {
        await websocketStreamingService.resumeStream(sessionId);
      }

      res.json({ success: true, sessionId, status: 'streaming' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Endpoint para detener un stream
   */
  async stopStream(req, res) {
    const { sessionId } = req.params;
    
    try {
      const stream = this.activeStreams.get(sessionId);
      if (!stream) {
        return res.status(404).json({ error: 'Stream no encontrado' });
      }

      // Si es WebSocket, usar el servicio correspondiente
      if (websocketStreamingService.hasConnection(sessionId)) {
        await websocketStreamingService.stopStream(sessionId);
      }

      this.activeStreams.delete(sessionId);
      
      res.json({ success: true, sessionId, status: 'stopped' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Limpieza periódica
   */
  cleanup() {
    // Limpiar streams inactivos
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos
    
    for (const [sessionId, stream] of this.activeStreams.entries()) {
      if (now - stream.startTime > maxAge) {
        this.activeStreams.delete(sessionId);
      }
    }

    // Limpiar servicios
    uxEnhancementService.cleanupInactiveIndicators();
    websocketStreamingService.cleanup();
  }
}

export default new StreamingController();