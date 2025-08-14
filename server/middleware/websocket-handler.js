/**
 * Middleware para manejo de WebSocket connections
 * Integra WebSocket streaming con el servidor Express
 */

import { WebSocketServer } from 'ws';
import enhancedStreamingController from '../controllers/enhanced-streaming-controller.js';
import auth from '../middlewares/auth.js';
import logger from '../middlewares/logger.js';

class WebSocketHandler {
  constructor() {
    this.wss = null;
    this.connections = new Map();
    this.heartbeatInterval = null;
  }

  /**
   * Inicializa el servidor WebSocket
   */
  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws/streaming',
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 3,
          chunkSize: 1024
        },
        threshold: 1024,
        concurrencyLimit: 10,
        clientMaxWindowBits: 15,
        serverMaxWindowBits: 15,
        serverMaxNoContextTakeover: false,
        clientMaxNoContextTakeover: false
      },
      maxPayload: 16 * 1024 * 1024 // 16MB
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    
    console.log('WebSocket server initialized on path: /ws/streaming');
  }

  /**
   * Configura los event handlers del WebSocket server
   */
  setupEventHandlers() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Autenticar conexión WebSocket
        const authResult = await this.authenticateWebSocket(req);
        if (!authResult.success) {
          ws.close(1008, 'Authentication failed');
          return;
        }

        // Configurar conexión
        const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const connectionInfo = {
          id: connectionId,
          ws,
          req,
          user: authResult.user,
          connectedAt: Date.now(),
          lastPing: Date.now(),
          isAlive: true,
          metadata: {
            userAgent: req.headers['user-agent'],
            ip: req.socket.remoteAddress,
            origin: req.headers.origin
          }
        };

        this.connections.set(connectionId, connectionInfo);

        // Log conexión
        console.log(`WebSocket connected: ${connectionId} from ${connectionInfo.metadata.ip}`);

        // Configurar handlers de la conexión
        this.setupConnectionHandlers(connectionInfo);

        // Enviar mensaje de bienvenida
        ws.send(JSON.stringify({
          type: 'connection_established',
          connectionId,
          timestamp: Date.now(),
          serverInfo: {
            version: '1.0.0',
            features: [
              'semantic_streaming',
              'syntax_highlighting',
              'progress_indicators',
              'typing_indicators',
              'adaptive_compression'
            ]
          }
        }));

        // Delegar al controlador de streaming
        await enhancedStreamingController.handleWebSocketStream(ws, req);

      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
        ws.close(1011, 'Internal server error');
      }
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.wss.on('close', () => {
      console.log('WebSocket server closed');
      this.cleanup();
    });
  }

  /**
   * Configura handlers para una conexión específica
   */
  setupConnectionHandlers(connectionInfo) {
    const { ws, id } = connectionInfo;

    // Handler para mensajes
    ws.on('message', async (message) => {
      try {
        connectionInfo.lastActivity = Date.now();
        
        const data = JSON.parse(message.toString());
        
        // Log mensaje (solo tipo, no contenido completo por privacidad)
        console.log(`WebSocket message from ${id}: ${data.type}`);
        
        // Validar estructura del mensaje
        if (!data.type) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Message type is required'
          }));
          return;
        }

        // Manejar mensajes especiales del middleware
        if (data.type === 'ping') {
          connectionInfo.lastPing = Date.now();
          connectionInfo.isAlive = true;
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
          return;
        }

        // Los demás mensajes se manejan en el controlador
        // (ya configurado en handleWebSocketStream)
        
      } catch (error) {
        console.error(`Error processing WebSocket message from ${id}:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    });

    // Handler para cierre de conexión
    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected: ${id}, code: ${code}, reason: ${reason}`);
      this.connections.delete(id);
    });

    // Handler para errores
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${id}:`, error);
      this.connections.delete(id);
    });

    // Handler para pong (respuesta a ping)
    ws.on('pong', () => {
      connectionInfo.isAlive = true;
      connectionInfo.lastPing = Date.now();
    });
  }

  /**
   * Autentica una conexión WebSocket
   */
  async authenticateWebSocket(req) {
    try {
      // Extraer token de query params o headers
      const token = req.url.includes('token=') 
        ? new URL(req.url, 'http://localhost').searchParams.get('token')
        : req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      // Simular autenticación (adaptar según tu sistema de auth)
      // En un sistema real, aquí validarías el JWT o token de sesión
      const user = await this.validateToken(token);
      
      if (!user) {
        return { success: false, error: 'Invalid token' };
      }

      return { success: true, user };
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Valida un token (implementar según tu sistema de auth)
   */
  async validateToken(token) {
    // Implementación placeholder - adaptar según tu sistema
    // Por ahora, aceptamos cualquier token no vacío
    if (token && token.length > 0) {
      return {
        id: 'user_' + Date.now(),
        name: 'WebSocket User',
        permissions: ['streaming']
      };
    }
    return null;
  }

  /**
   * Inicia el sistema de heartbeat
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 segundos

      for (const [connectionId, connectionInfo] of this.connections.entries()) {
        const { ws, lastPing, isAlive } = connectionInfo;

        // Verificar si la conexión está viva
        if (!isAlive || (now - lastPing) > timeout) {
          console.log(`Terminating inactive WebSocket: ${connectionId}`);
          ws.terminate();
          this.connections.delete(connectionId);
          continue;
        }

        // Enviar ping
        connectionInfo.isAlive = false;
        try {
          ws.ping();
        } catch (error) {
          console.error(`Error sending ping to ${connectionId}:`, error);
          this.connections.delete(connectionId);
        }
      }
    }, 15000); // Cada 15 segundos
  }

  /**
   * Detiene el sistema de heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Envía un mensaje a todas las conexiones
   */
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    
    for (const [connectionId, connectionInfo] of this.connections.entries()) {
      try {
        if (connectionInfo.ws.readyState === connectionInfo.ws.OPEN) {
          connectionInfo.ws.send(messageStr);
        }
      } catch (error) {
        console.error(`Error broadcasting to ${connectionId}:`, error);
        this.connections.delete(connectionId);
      }
    }
  }

  /**
   * Envía un mensaje a una conexión específica
   */
  sendToConnection(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    
    if (!connectionInfo) {
      return false;
    }

    try {
      if (connectionInfo.ws.readyState === connectionInfo.ws.OPEN) {
        connectionInfo.ws.send(JSON.stringify(message));
        return true;
      }
    } catch (error) {
      console.error(`Error sending message to ${connectionId}:`, error);
      this.connections.delete(connectionId);
    }
    
    return false;
  }

  /**
   * Obtiene estadísticas de conexiones
   */
  getStats() {
    const now = Date.now();
    const connections = Array.from(this.connections.values());
    
    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(conn => 
        conn.ws.readyState === conn.ws.OPEN
      ).length,
      averageConnectionTime: connections.length > 0 
        ? connections.reduce((sum, conn) => sum + (now - conn.connectedAt), 0) / connections.length
        : 0,
      connectionsByOrigin: connections.reduce((acc, conn) => {
        const origin = conn.metadata.origin || 'unknown';
        acc[origin] = (acc[origin] || 0) + 1;
        return acc;
      }, {}),
      serverInfo: {
        path: '/ws/streaming',
        maxPayload: '16MB',
        compression: 'enabled'
      }
    };
  }

  /**
   * Cierra una conexión específica
   */
  closeConnection(connectionId, code = 1000, reason = 'Server initiated close') {
    const connectionInfo = this.connections.get(connectionId);
    
    if (connectionInfo) {
      connectionInfo.ws.close(code, reason);
      this.connections.delete(connectionId);
      return true;
    }
    
    return false;
  }

  /**
   * Limpieza general
   */
  cleanup() {
    this.stopHeartbeat();
    
    // Cerrar todas las conexiones
    for (const [connectionId, connectionInfo] of this.connections.entries()) {
      try {
        connectionInfo.ws.close(1001, 'Server shutting down');
      } catch (error) {
        console.error(`Error closing connection ${connectionId}:`, error);
      }
    }
    
    this.connections.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }

  /**
   * Obtiene información de una conexión específica
   */
  getConnectionInfo(connectionId) {
    const connectionInfo = this.connections.get(connectionId);
    
    if (!connectionInfo) {
      return null;
    }
    
    return {
      id: connectionInfo.id,
      connectedAt: connectionInfo.connectedAt,
      lastActivity: connectionInfo.lastActivity,
      lastPing: connectionInfo.lastPing,
      isAlive: connectionInfo.isAlive,
      metadata: connectionInfo.metadata,
      user: {
        id: connectionInfo.user.id,
        name: connectionInfo.user.name
      }
    };
  }
}

export default new WebSocketHandler();