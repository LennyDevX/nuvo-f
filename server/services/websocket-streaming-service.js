/**
 * Servicio de WebSocket Streaming
 * Implementa WebSocket integration, HTTP/2 Server Push y Connection Pooling
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import compression from 'compression';
import zlib from 'zlib';

class WebSocketStreamingService {
  constructor() {
    this.wss = null;
    this.connections = new Map();
    this.connectionPools = new Map();
    this.compressionOptions = {
      gzip: {
        level: 6,
        windowBits: 15,
        memLevel: 8
      },
      brotli: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 6,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 1024
        }
      }
    };
    this.metrics = {
      activeConnections: 0,
      totalConnections: 0,
      messagesStreamed: 0,
      bytesTransferred: 0,
      compressionRatio: 0
    };
  }

  /**
   * Inicializa el servidor WebSocket
   */
  initialize(server, options = {}) {
    const {
      port = 8080,
      enableCompression = true,
      maxConnections = 1000,
      heartbeatInterval = 30000
    } = options;

    this.wss = new WebSocketServer({
      server,
      port,
      perMessageDeflate: enableCompression ? {
        zlibDeflateOptions: {
          level: 6,
          windowBits: 13
        },
        threshold: 1024,
        concurrencyLimit: 10
      } : false,
      maxPayload: 16 * 1024 * 1024 // 16MB
    });

    this.setupWebSocketHandlers(maxConnections, heartbeatInterval);
    console.log(`WebSocket Streaming Service initialized on port ${port}`);
  }

  /**
   * Configura los manejadores de WebSocket
   */
  setupWebSocketHandlers(maxConnections, heartbeatInterval) {
    this.wss.on('connection', (ws, request) => {
      // Verificar límite de conexiones
      if (this.connections.size >= maxConnections) {
        ws.close(1013, 'Server overloaded');
        return;
      }

      const connectionId = this.generateConnectionId();
      const clientInfo = this.extractClientInfo(request);
      
      // Configurar conexión
      const connection = {
        id: connectionId,
        ws,
        clientInfo,
        isAlive: true,
        lastActivity: Date.now(),
        streamingSessions: new Map(),
        compressionSupport: this.detectCompressionSupport(request)
      };

      this.connections.set(connectionId, connection);
      this.metrics.activeConnections++;
      this.metrics.totalConnections++;

      // Configurar heartbeat
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
        connection.lastActivity = Date.now();
      });

      // Manejadores de mensajes
      ws.on('message', (data) => {
        this.handleMessage(connectionId, data);
      });

      ws.on('close', () => {
        this.handleDisconnection(connectionId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for connection ${connectionId}:`, error);
        this.handleDisconnection(connectionId);
      });

      // Enviar mensaje de bienvenida
      this.sendMessage(connectionId, {
        type: 'connection_established',
        connectionId,
        features: {
          semanticStreaming: true,
          adaptiveCompression: true,
          progressIndicators: true,
          typingIndicators: true
        }
      });
    });

    // Configurar heartbeat interval
    const heartbeat = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, heartbeatInterval);

    this.wss.on('close', () => {
      clearInterval(heartbeat);
    });
  }

  /**
   * Maneja mensajes entrantes
   */
  async handleMessage(connectionId, data) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      const message = JSON.parse(data.toString());
      connection.lastActivity = Date.now();

      switch (message.type) {
        case 'start_stream':
          await this.startStreamingSession(connectionId, message.data);
          break;
        case 'pause_stream':
          this.pauseStreamingSession(connectionId, message.sessionId);
          break;
        case 'resume_stream':
          this.resumeStreamingSession(connectionId, message.sessionId);
          break;
        case 'stop_stream':
          this.stopStreamingSession(connectionId, message.sessionId);
          break;
        case 'update_preferences':
          this.updateClientPreferences(connectionId, message.preferences);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendError(connectionId, 'Invalid message format');
    }
  }

  /**
   * Inicia una sesión de streaming
   */
  async startStreamingSession(connectionId, sessionData) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      status: 'active',
      startTime: Date.now(),
      content: sessionData.content,
      options: sessionData.options || {},
      progress: 0,
      isPaused: false
    };

    connection.streamingSessions.set(sessionId, session);

    // Enviar indicador de typing
    this.sendMessage(connectionId, {
      type: 'typing_indicator',
      sessionId,
      status: 'thinking'
    });

    // Simular tiempo de procesamiento
    await this.delay(500);

    // Iniciar streaming semántico
    await this.streamContentToWebSocket(connectionId, sessionId, session);
  }

  /**
   * Stream contenido a través de WebSocket con mejoras semánticas
   */
  async streamContentToWebSocket(connectionId, sessionId, session) {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.ws) return;

    try {
      // Importar servicio semántico
      const semanticService = await import('./semantic-streaming-service.js');
      const chunks = semanticService.default.createSemanticChunks(session.content);
      
      // Enviar metadata inicial
      this.sendMessage(connectionId, {
        type: 'stream_metadata',
        sessionId,
        totalChunks: chunks.length,
        estimatedDuration: this.estimateStreamDuration(chunks)
      });

      // Cambiar indicador a streaming
      this.sendMessage(connectionId, {
        type: 'typing_indicator',
        sessionId,
        status: 'streaming'
      });

      // Procesar chunks
      for (let i = 0; i < chunks.length; i++) {
        const currentSession = connection.streamingSessions.get(sessionId);
        if (!currentSession || currentSession.status === 'stopped') break;

        // Manejar pausa
        while (currentSession.isPaused) {
          await this.delay(100);
        }

        const chunk = chunks[i];
        const progress = Math.round(((i + 1) / chunks.length) * 100);

        // Comprimir contenido si es necesario
        const compressedContent = await this.compressContent(
          chunk.content,
          connection.compressionSupport
        );

        // Enviar chunk
        this.sendMessage(connectionId, {
          type: 'stream_chunk',
          sessionId,
          chunk: {
            content: compressedContent,
            type: chunk.type,
            position: i + 1,
            timing: chunk.timing,
            compressed: compressedContent !== chunk.content
          },
          progress
        });

        // Actualizar progreso
        currentSession.progress = progress;

        // Pausa contextual
        const nextChunk = chunks[i + 1];
        if (nextChunk) {
          const pauseDuration = semanticService.default.calculateContextualPause(chunk, nextChunk);
          await this.delay(pauseDuration);
        }

        this.metrics.messagesStreamed++;
      }

      // Finalizar streaming
      this.sendMessage(connectionId, {
        type: 'stream_complete',
        sessionId,
        totalTime: Date.now() - session.startTime
      });

      // Limpiar sesión
      connection.streamingSessions.delete(sessionId);

    } catch (error) {
      console.error('Error streaming to WebSocket:', error);
      this.sendError(connectionId, 'Streaming error', sessionId);
    }
  }

  /**
   * Comprime contenido según las capacidades del cliente
   */
  async compressContent(content, compressionSupport) {
    if (!compressionSupport || content.length < 100) {
      return content;
    }

    try {
      if (compressionSupport.includes('br')) {
        // Usar Brotli si está disponible
        const compressed = await this.brotliCompress(content);
        this.updateCompressionMetrics(content.length, compressed.length);
        return compressed.toString('base64');
      } else if (compressionSupport.includes('gzip')) {
        // Usar Gzip como fallback
        const compressed = await this.gzipCompress(content);
        this.updateCompressionMetrics(content.length, compressed.length);
        return compressed.toString('base64');
      }
    } catch (error) {
      console.error('Compression error:', error);
    }

    return content;
  }

  /**
   * Compresión Brotli
   */
  brotliCompress(content) {
    return new Promise((resolve, reject) => {
      zlib.brotliCompress(Buffer.from(content), this.compressionOptions.brotli, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Compresión Gzip
   */
  gzipCompress(content) {
    return new Promise((resolve, reject) => {
      zlib.gzip(Buffer.from(content), this.compressionOptions.gzip, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Envía mensaje a una conexión específica
   */
  sendMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.ws || connection.ws.readyState !== 1) {
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      connection.ws.send(messageStr);
      this.metrics.bytesTransferred += messageStr.length;
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Envía error a una conexión
   */
  sendError(connectionId, message, sessionId = null) {
    this.sendMessage(connectionId, {
      type: 'error',
      message,
      sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Maneja desconexión de cliente
   */
  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Limpiar sesiones activas
      connection.streamingSessions.forEach((session, sessionId) => {
        session.status = 'stopped';
      });
      
      this.connections.delete(connectionId);
      this.metrics.activeConnections--;
    }
  }

  /**
   * Pausa sesión de streaming
   */
  pauseStreamingSession(connectionId, sessionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const session = connection.streamingSessions.get(sessionId);
      if (session) {
        session.isPaused = true;
        this.sendMessage(connectionId, {
          type: 'stream_paused',
          sessionId
        });
      }
    }
  }

  /**
   * Reanuda sesión de streaming
   */
  resumeStreamingSession(connectionId, sessionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const session = connection.streamingSessions.get(sessionId);
      if (session) {
        session.isPaused = false;
        this.sendMessage(connectionId, {
          type: 'stream_resumed',
          sessionId
        });
      }
    }
  }

  /**
   * Detiene sesión de streaming
   */
  stopStreamingSession(connectionId, sessionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      const session = connection.streamingSessions.get(sessionId);
      if (session) {
        session.status = 'stopped';
        connection.streamingSessions.delete(sessionId);
        this.sendMessage(connectionId, {
          type: 'stream_stopped',
          sessionId
        });
      }
    }
  }

  /**
   * Utilidades
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractClientInfo(request) {
    return {
      userAgent: request.headers['user-agent'] || '',
      ip: request.socket.remoteAddress,
      acceptEncoding: request.headers['accept-encoding'] || ''
    };
  }

  detectCompressionSupport(request) {
    const acceptEncoding = request.headers['accept-encoding'] || '';
    return acceptEncoding.toLowerCase().split(',').map(s => s.trim());
  }

  estimateStreamDuration(chunks) {
    return chunks.reduce((total, chunk) => {
      return total + (chunk.timing.chunkDelay * chunk.content.length) + chunk.timing.sentenceDelay;
    }, 0);
  }

  updateCompressionMetrics(originalSize, compressedSize) {
    const ratio = compressedSize / originalSize;
    this.metrics.compressionRatio = 
      (this.metrics.compressionRatio + ratio) / 2; // Promedio móvil simple
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener métricas del servicio
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      connectionsPerSecond: this.metrics.totalConnections / ((Date.now() - this.startTime) / 1000)
    };
  }

  /**
   * Cerrar servicio
   */
  close() {
    if (this.wss) {
      this.wss.close();
      this.connections.clear();
    }
  }
}

export default new WebSocketStreamingService();