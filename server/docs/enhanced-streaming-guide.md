# Guía de Streaming Mejorado - Nuvos Cloud

## Descripción General

El sistema de streaming mejorado de Nuvos Cloud implementa funcionalidades avanzadas para proporcionar una experiencia de chat en tiempo real fluida y optimizada. Incluye streaming semántico, WebSocket support, indicadores de progreso, syntax highlighting y más.

## Características Implementadas

### 🧠 Streaming Progresivo Mejorado

#### Chunking Semántico
- **Descripción**: Divide el contenido por oraciones completas en lugar de caracteres arbitrarios
- **Beneficios**: Mejor legibilidad y comprensión del contenido
- **Configuración**: `semanticChunking: true`

#### Pausas Contextuales
- **Descripción**: Aplica delays más largos después de conceptos complejos
- **Tipos de contenido detectados**:
  - Código: Pausa 1.5x más larga
  - Conceptos complejos: Pausa 1.3x más larga
  - Listas: Pausa 1.2x más larga
  - Fórmulas matemáticas: Pausa 1.4x más larga
- **Configuración**: `contextualPauses: true`

#### Velocidad Variable
- **Descripción**: Acelera en texto simple, ralentiza en código/fórmulas
- **Adaptación automática**: Basada en el tipo de contenido detectado
- **Configuración**: `variableSpeed: true`

### 🔌 WebSocket Integration

#### Conexión en Tiempo Real
- **Endpoint**: `ws://localhost:3000/ws/streaming`
- **Autenticación**: Token-based authentication
- **Compresión**: Soporte para Brotli, Gzip y Deflate
- **Heartbeat**: Sistema de ping/pong cada 15 segundos

#### HTTP/2 Server Push
- **Descripción**: Pre-envía chunks predictivos para reducir latencia
- **Configuración automática**: Detecta soporte HTTP/2 del cliente

#### Connection Pooling
- **Descripción**: Reutiliza conexiones para múltiples streams
- **Límites**: Máximo 100 conexiones concurrentes por defecto
- **Cleanup automático**: Limpieza de conexiones inactivas cada 5 minutos

### 🎨 UX Enhancements

#### Typing Indicators
- **Estados disponibles**:
  - `thinking`: Analizando solicitud
  - `typing`: Escribiendo respuesta
  - `processing`: Procesando información
  - `streaming`: Transmitiendo contenido
  - `paused`: En pausa
  - `complete`: Completado
- **Animaciones**: Indicadores animados con emojis y dots giratorios

#### Progress Indicators
- **Características**:
  - Barra de progreso visual
  - Porcentaje de completado
  - ETA (tiempo estimado)
  - Throughput (velocidad de procesamiento)
- **Configuración**: `showProgress: true`

#### Smooth Scrolling
- **Descripción**: Sincroniza el scroll con la velocidad de streaming
- **Configuración automática**: Basada en la longitud del contenido
- **Easing**: Cubic-bezier para transiciones suaves

#### Syntax Highlighting
- **Lenguajes soportados**:
  - JavaScript
  - Python
  - CSS
  - HTML
  - JSON
- **Renderizado progresivo**: Highlighting aplicado en tiempo real
- **Detección automática**: Identifica el lenguaje del código

## API Endpoints

### POST `/api/streaming/enhanced`

Endpoint principal para streaming semántico mejorado.

**Request Body:**
```json
{
  "prompt": "Tu pregunta aquí",
  "options": {
    "model": "gemini-pro",
    "temperature": 0.7
  },
  "streamingConfig": {
    "semanticChunking": true,
    "contextualPauses": true,
    "variableSpeed": true,
    "chunkSize": "auto",
    "pauseMultiplier": 1.0,
    "speedMultiplier": 1.0,
    "bufferSize": 1024,
    "flushInterval": 50
  },
  "uxConfig": {
    "showTypingIndicator": true,
    "showProgress": true,
    "syntaxHighlighting": true,
    "smoothScrolling": true,
    "progressLabels": {
      "thinking": "Analizando solicitud...",
      "processing": "Procesando información...",
      "streaming": "Generando respuesta...",
      "complete": "Completado"
    }
  }
}
```

**Response (Server-Sent Events):**
```javascript
// Typing Indicator
data: {
  "type": "typing_indicator",
  "sessionId": "session_123",
  "state": "thinking",
  "message": "Pensando...",
  "animation": "🤔",
  "timestamp": 1703123456789
}

// Progress Update
data: {
  "type": "progress_indicator",
  "sessionId": "session_123",
  "percentage": 45,
  "currentStep": 45,
  "totalSteps": 100,
  "eta": 12,
  "progressBar": "[████████████░░░░░░░░] 45%"
}

// Content Chunk
data: {
  "type": "content_chunk",
  "sessionId": "session_123",
  "chunk": {
    "content": "Esta es una respuesta semántica.",
    "contentType": "text",
    "pause": 150,
    "highlighted": null,
    "scrollConfig": {
      "behavior": "smooth",
      "updateInterval": 100
    }
  },
  "metadata": {
    "chunkIndex": 5,
    "totalProcessed": 5,
    "timestamp": 1703123456789
  }
}

// Stream Complete
data: {
  "type": "stream_complete",
  "sessionId": "session_123",
  "metrics": {
    "totalChunks": 25,
    "totalTime": 3500,
    "contentLength": 1250,
    "throughput": 357.14
  }
}

data: [DONE]
```

### GET `/api/streaming/metrics`

Obtiene métricas de streaming en tiempo real.

**Response:**
```json
{
  "activeStreams": 3,
  "streams": [
    {
      "sessionId": "session_123",
      "duration": 5000,
      "status": "streaming",
      "config": {
        "semanticChunking": true,
        "contextualPauses": true
      }
    }
  ],
  "websocketConnections": 5,
  "uxStats": {
    "activeIndicators": 3,
    "activeProgressTrackers": 2,
    "supportedLanguages": ["javascript", "python", "css", "html", "json"]
  }
}
```

### POST `/api/streaming/:sessionId/pause`

Pausa un stream activo.

### POST `/api/streaming/:sessionId/resume`

Reanuda un stream pausado.

### POST `/api/streaming/:sessionId/stop`

Detiene un stream activo.

### GET `/api/streaming/config`

Obtiene la configuración por defecto.

### POST `/api/streaming/test`

Endpoint de prueba para diferentes tipos de streaming.

**Request Body:**
```json
{
  "testType": "semantic", // "basic", "semantic", "syntax", "progress"
  "duration": 5000
}
```

## WebSocket API

### Conexión

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/streaming?token=your_auth_token');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Mensajes Soportados

#### Iniciar Stream
```javascript
ws.send(JSON.stringify({
  type: 'start_stream',
  payload: {
    prompt: 'Tu pregunta aquí',
    options: {},
    streamingConfig: {
      semanticChunking: true,
      contextualPauses: true,
      variableSpeed: true
    },
    uxConfig: {
      showTypingIndicator: true,
      showProgress: true,
      syntaxHighlighting: true
    }
  }
}));
```

#### Pausar Stream
```javascript
ws.send(JSON.stringify({
  type: 'pause_stream'
}));
```

#### Reanudar Stream
```javascript
ws.send(JSON.stringify({
  type: 'resume_stream'
}));
```

#### Detener Stream
```javascript
ws.send(JSON.stringify({
  type: 'stop_stream'
}));
```

#### Actualizar Preferencias
```javascript
ws.send(JSON.stringify({
  type: 'update_preferences',
  payload: {
    speedMultiplier: 1.5,
    showProgress: false
  }
}));
```

#### Ping/Pong (Heartbeat)
```javascript
ws.send(JSON.stringify({
  type: 'ping'
}));

// Respuesta automática del servidor:
// { type: 'pong', timestamp: 1703123456789 }
```

## Configuración Avanzada

### Semantic Streaming Service

```javascript
import semanticStreamingService from './services/semantic-streaming-service.js';

// Configuración personalizada
const config = {
  enableSemanticChunking: true,
  enableContextualPauses: true,
  enableVariableSpeed: true,
  chunkSize: 'auto', // 'small', 'medium', 'large', 'auto', o número
  pauseMultiplier: 1.2,
  speedMultiplier: 0.8,
  complexityThreshold: 0.7,
  sentenceMinLength: 10,
  maxChunkSize: 200
};

// Procesar contenido
const chunks = await semanticStreamingService.processContentStream(
  chunk,
  accumulatedContent,
  config
);
```

### UX Enhancement Service

```javascript
import uxEnhancementService from './services/ux-enhancement-service.js';

// Crear typing indicator
const indicator = uxEnhancementService.createTypingIndicator('session_123', {
  type: 'thinking',
  animated: true,
  showProgress: false,
  customMessage: 'Analizando tu solicitud...'
});

// Aplicar syntax highlighting
const highlighted = uxEnhancementService.applySyntaxHighlighting(
  'const message = "Hello, World!";',
  'javascript'
);

// Generar configuración de scroll
const scrollConfig = uxEnhancementService.generateSmoothScrollConfig(
  contentLength,
  streamingSpeed
);
```

### WebSocket Streaming Service

```javascript
import websocketStreamingService from './services/websocket-streaming-service.js';

// Configurar límites de conexión
websocketStreamingService.setConnectionLimits({
  maxConnections: 100,
  maxConnectionsPerIP: 5,
  connectionTimeout: 30000
});

// Obtener estadísticas
const stats = websocketStreamingService.getStats();
console.log('Conexiones activas:', stats.activeConnections);
```

## Optimizaciones de Rendimiento

### Compresión Adaptativa
- **Brotli**: Mejor compresión, mayor CPU
- **Gzip**: Balance entre compresión y velocidad
- **Deflate**: Menor compresión, menor CPU
- **Detección automática**: Basada en `Accept-Encoding` del cliente

### Buffer Management
- **Buffer dinámico**: Se ajusta según la velocidad de conexión
- **Backpressure handling**: Previene sobrecarga de memoria
- **Flush inteligente**: Optimiza el timing de envío

### Connection Pooling
- **Reutilización**: Conexiones HTTP/2 reutilizadas
- **Límites**: Configurables por IP y globales
- **Cleanup**: Limpieza automática de conexiones inactivas

## Métricas y Monitoreo

### Métricas Disponibles
- **Latencia**: First byte time, response time total
- **Throughput**: Caracteres por segundo, chunks por segundo
- **Conexiones**: Activas, por origen, duración promedio
- **Errores**: Rate de errores, tipos de errores
- **UX**: Indicadores activos, progreso promedio

### Health Checks
```bash
# Verificar estado del servicio
curl http://localhost:3000/api/streaming/health

# Obtener métricas en tiempo real
curl http://localhost:3000/api/streaming/metrics

# Obtener configuración
curl http://localhost:3000/api/streaming/config
```

## Ejemplos de Uso

### Cliente JavaScript (SSE)

```javascript
class EnhancedStreamingClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.eventSource = null;
    this.sessionId = null;
  }

  async startStream(prompt, config = {}) {
    const response = await fetch(`${this.baseUrl}/api/streaming/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({
        prompt,
        streamingConfig: {
          semanticChunking: true,
          contextualPauses: true,
          variableSpeed: true,
          ...config.streaming
        },
        uxConfig: {
          showTypingIndicator: true,
          showProgress: true,
          syntaxHighlighting: true,
          smoothScrolling: true,
          ...config.ux
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            this.onStreamComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            this.handleStreamData(parsed);
          } catch (error) {
            console.error('Error parsing stream data:', error);
          }
        }
      }
    }
  }

  handleStreamData(data) {
    switch (data.type) {
      case 'typing_indicator':
        this.onTypingIndicator(data);
        break;
      case 'progress_indicator':
        this.onProgressUpdate(data);
        break;
      case 'content_chunk':
        this.onContentChunk(data);
        break;
      case 'stream_complete':
        this.onStreamComplete(data);
        break;
      case 'error':
        this.onError(data);
        break;
    }
  }

  onTypingIndicator(data) {
    console.log(`${data.animation} ${data.message}`);
  }

  onProgressUpdate(data) {
    console.log(`Progress: ${data.progressBar}`);
  }

  onContentChunk(data) {
    const { chunk } = data;
    console.log('Content:', chunk.content);
    
    if (chunk.highlighted) {
      console.log('Highlighted:', chunk.highlighted.highlighted);
    }
  }

  onStreamComplete(data) {
    console.log('Stream completed:', data?.metrics);
  }

  onError(data) {
    console.error('Stream error:', data.error);
  }

  getToken() {
    // Implementar según tu sistema de autenticación
    return localStorage.getItem('auth_token');
  }
}

// Uso
const client = new EnhancedStreamingClient('http://localhost:3000');
client.startStream('Explica el concepto de machine learning');
```

### Cliente WebSocket

```javascript
class WebSocketStreamingClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.wsUrl}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  startStream(prompt, config = {}) {
    this.send({
      type: 'start_stream',
      payload: {
        prompt,
        options: config.options || {},
        streamingConfig: {
          semanticChunking: true,
          contextualPauses: true,
          variableSpeed: true,
          ...config.streaming
        },
        uxConfig: {
          showTypingIndicator: true,
          showProgress: true,
          syntaxHighlighting: true,
          smoothScrolling: true,
          ...config.ux
        }
      }
    });
  }

  pauseStream() {
    this.send({ type: 'pause_stream' });
  }

  resumeStream() {
    this.send({ type: 'resume_stream' });
  }

  stopStream() {
    this.send({ type: 'stop_stream' });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'connection_established':
        console.log('Connection established:', data.connectionId);
        break;
      case 'content_chunk':
        this.onContentChunk(data);
        break;
      case 'typing_indicator':
        this.onTypingIndicator(data);
        break;
      case 'progress_indicator':
        this.onProgressUpdate(data);
        break;
      case 'stream_complete':
        this.onStreamComplete(data);
        break;
      case 'error':
        this.onError(data);
        break;
      case 'pong':
        console.log('Pong received');
        break;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.getToken());
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Implementar handlers según necesidades
  onContentChunk(data) { /* ... */ }
  onTypingIndicator(data) { /* ... */ }
  onProgressUpdate(data) { /* ... */ }
  onStreamComplete(data) { /* ... */ }
  onError(data) { /* ... */ }
  getToken() { /* ... */ }
}

// Uso
const wsClient = new WebSocketStreamingClient('ws://localhost:3000/ws/streaming');
await wsClient.connect('your_auth_token');
wsClient.startStream('¿Cómo funciona el streaming semántico?');
```

## Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**
   - Verificar que el servidor esté ejecutándose
   - Comprobar el token de autenticación
   - Revisar firewall/proxy settings

2. **Streaming lento**
   - Ajustar `speedMultiplier` en la configuración
   - Verificar compresión del cliente
   - Revisar métricas de red

3. **Syntax highlighting no funciona**
   - Verificar que el lenguaje esté soportado
   - Comprobar configuración `syntaxHighlighting: true`
   - Revisar logs del servidor

4. **Progress indicators no aparecen**
   - Verificar configuración `showProgress: true`
   - Comprobar que el contenido sea suficientemente largo
   - Revisar implementación del cliente

### Logs y Debugging

```bash
# Habilitar logs detallados
DEBUG=streaming:* npm run dev:server

# Monitorear conexiones WebSocket
curl http://localhost:3000/api/streaming/metrics

# Test de conectividad
wscat -c ws://localhost:3000/ws/streaming?token=test
```

## Roadmap

### Próximas Funcionalidades
- [ ] Machine Learning para personalización de velocidad
- [ ] Soporte para múltiples idiomas en syntax highlighting
- [ ] Integración con analytics avanzados
- [ ] Caching inteligente de respuestas
- [ ] Soporte para streaming de imágenes
- [ ] API GraphQL para configuración avanzada

### Optimizaciones Planificadas
- [ ] HTTP/3 support
- [ ] Edge computing integration
- [ ] Advanced compression algorithms
- [ ] Predictive prefetching
- [ ] Real-time collaboration features

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Soporte**: Para preguntas o issues, contacta al equipo de desarrollo.