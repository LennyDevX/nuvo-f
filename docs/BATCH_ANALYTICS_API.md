# API de Batch Processing y Analytics Avanzadas

## Descripción General

Este documento describe las nuevas funcionalidades implementadas para el procesamiento en lotes (batch processing) y analytics avanzadas en la API de Gemini.

## 🚀 Batch Processing

### Características
- Procesamiento eficiente de múltiples consultas
- Control de concurrencia configurable
- Manejo de errores con reintentos automáticos
- Seguimiento de estado en tiempo real
- Cancelación de trabajos en progreso

### Endpoints Disponibles

#### 1. Generación en Lotes
```http
POST /server/gemini/batch/generate
```

**Body:**
```json
{
  "requests": [
    {
      "prompt": "¿Qué es la inteligencia artificial?",
      "model": "gemini-2.5-flash",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    {
      "prompt": "Explica blockchain en términos simples",
      "temperature": 0.5
    }
  ],
  "options": {
    "concurrency": 3,
    "failFast": false,
    "timeout": 30000
  }
}
```

**Respuesta:**
```json
{
  "message": "Batch processing completado",
  "batchId": "batch_12345",
  "status": "completed",
  "results": [
    {
      "index": 0,
      "success": true,
      "response": "La inteligencia artificial es...",
      "tokensUsed": 150,
      "processingTime": 1200
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "totalTime": 2400,
    "totalTokens": 300
  }
}
```

#### 2. Embeddings en Lotes
```http
POST /server/gemini/batch/embeddings
```

**Body:**
```json
{
  "operations": [
    {
      "type": "index",
      "name": "knowledge_base",
      "documents": [
        {"text": "Contenido del documento 1", "metadata": {"id": "doc1"}},
        {"text": "Contenido del documento 2", "metadata": {"id": "doc2"}}
      ]
    },
    {
      "type": "search",
      "name": "knowledge_base",
      "query": "buscar información relevante",
      "topK": 5
    }
  ],
  "options": {
    "concurrency": 2
  }
}
```

#### 3. Análisis en Lotes
```http
POST /server/gemini/batch/analyze
```

**Body:**
```json
{
  "texts": [
    "Este es un texto muy positivo y alegre",
    "Este texto parece neutral",
    "Este es un comentario negativo"
  ],
  "analysisType": "sentiment",
  "options": {
    "includeConfidence": true,
    "detailedAnalysis": true
  }
}
```

#### 4. Gestión de Trabajos

**Estado de un trabajo:**
```http
GET /server/gemini/batch/status/{batchId}
```

**Trabajos activos:**
```http
GET /server/gemini/batch/active
```

**Cancelar trabajo:**
```http
DELETE /server/gemini/batch/{batchId}
```

**Estadísticas de batch:**
```http
GET /server/gemini/batch/stats
```

## 📊 Analytics Avanzadas

### Características
- Monitoreo en tiempo real
- Métricas detalladas de rendimiento
- Insights automáticos y recomendaciones
- Exportación de datos
- Streaming de métricas en vivo

### Endpoints Disponibles

#### 1. Métricas Completas
```http
GET /server/gemini/analytics/metrics
```

**Respuesta:**
```json
{
  "metrics": {
    "requests": {
      "total": 1250,
      "successful": 1200,
      "failed": 50,
      "successRate": 96.0,
      "byModel": {
        "gemini-2.5-flash": 800,
        "gemini-pro": 450
      },
      "byEndpoint": {
        "generate": 900,
        "analyze": 200,
        "embeddings": 150
      }
    },
    "performance": {
      "averageResponseTime": 1200,
      "p95ResponseTime": 2500,
      "p99ResponseTime": 4000
    },
    "usage": {
      "totalTokens": 125000,
      "inputTokens": 75000,
      "outputTokens": 50000,
      "estimatedCost": 12.50
    },
    "cache": {
      "hits": 300,
      "misses": 950,
      "hitRate": 24.0
    }
  }
}
```

#### 2. Métricas en Tiempo Real
```http
GET /server/gemini/analytics/realtime
```

#### 3. Insights del Sistema
```http
GET /server/gemini/analytics/insights
```

**Respuesta:**
```json
{
  "insights": {
    "performance": {
      "status": "good",
      "message": "Rendimiento dentro de parámetros normales",
      "recommendations": [
        "Considerar aumentar el cache para mejorar la tasa de aciertos"
      ]
    },
    "usage": {
      "trend": "increasing",
      "peakHours": ["14:00-16:00", "20:00-22:00"],
      "costOptimization": [
        "Usar modelos más eficientes para consultas simples"
      ]
    },
    "errors": {
      "mostCommon": "Rate limit exceeded",
      "frequency": "4%",
      "suggestions": [
        "Implementar backoff exponencial"
      ]
    }
  }
}
```

#### 4. Streaming de Métricas
```http
GET /server/gemini/analytics/stream
```

Este endpoint utiliza Server-Sent Events (SSE) para enviar métricas en tiempo real:

```javascript
const eventSource = new EventSource('/server/gemini/analytics/stream');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Métricas en tiempo real:', data);
};
```

#### 5. Exportación de Métricas
```http
POST /server/gemini/analytics/export
```

**Body:**
```json
{
  "format": "json" // o "csv"
}
```

#### 6. Reset de Métricas
```http
POST /server/gemini/analytics/reset
```

## 🔧 Configuración

### Variables de Entorno

```env
# Batch Processing
BATCH_MAX_CONCURRENCY=5
BATCH_DEFAULT_TIMEOUT=30000
BATCH_MAX_RETRIES=3

# Analytics
ANALYTICS_RETENTION_DAYS=30
ANALYTICS_EXPORT_PATH=./exports
ANALYTICS_REALTIME_INTERVAL=5000
```

### Límites y Restricciones

- **Batch Processing:**
  - Máximo 100 requests por batch
  - Concurrencia máxima: 10
  - Timeout máximo: 300 segundos

- **Analytics:**
  - Retención de datos: 30 días por defecto
  - Máximo 1000 conexiones SSE simultáneas
  - Exportación limitada a 10MB por archivo

## 📈 Casos de Uso

### 1. Procesamiento Masivo de Documentos
```javascript
// Analizar múltiples documentos
const response = await fetch('/server/gemini/batch/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    texts: documents.map(doc => doc.content),
    analysisType: 'summary',
    options: { concurrency: 5 }
  })
});
```

### 2. Monitoreo en Tiempo Real
```javascript
// Dashboard de métricas en vivo
const eventSource = new EventSource('/server/gemini/analytics/stream');
eventSource.onmessage = (event) => {
  const metrics = JSON.parse(event.data);
  updateDashboard(metrics);
};
```

### 3. Optimización de Costos
```javascript
// Obtener insights para optimización
const insights = await fetch('/server/gemini/analytics/insights')
  .then(res => res.json());

console.log('Recomendaciones:', insights.insights.usage.costOptimization);
```

## 🚨 Manejo de Errores

### Códigos de Error Comunes

- `400`: Parámetros inválidos
- `429`: Rate limit excedido
- `500`: Error interno del servidor
- `503`: Servicio temporalmente no disponible

### Reintentos Automáticos

El sistema implementa reintentos automáticos con backoff exponencial:

```javascript
{
  "retryPolicy": {
    "maxRetries": 3,
    "baseDelay": 1000,
    "maxDelay": 10000,
    "backoffMultiplier": 2
  }
}
```

## 🔒 Seguridad

- Autenticación requerida para todos los endpoints
- Rate limiting aplicado por usuario
- Validación estricta de parámetros
- Logs de auditoría para todas las operaciones

## 📚 Ejemplos Completos

Ver la carpeta `/examples` para implementaciones completas de:
- Dashboard de analytics
- Procesador de documentos en lotes
- Monitor de rendimiento en tiempo real