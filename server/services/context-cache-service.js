import ai from '../config/ai-config.js';
import env from '../config/environment.js';

/**
 * Servicio de Context Caching Inteligente para Gemini
 * Reduce costos de API hasta 50% y mejora tiempos de respuesta
 */

class ContextCacheService {
  constructor() {
    this.cacheStore = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      created: 0,
      errors: 0
    };
    this.contextCaches = new Map(); // Store de context caches activos
    this.maxCacheAge = 60 * 60 * 1000; // 1 hora
    this.maxCacheSize = 100; // Máximo número de caches
  }

  /**
   * Genera un hash único para el contexto
   */
  generateContextHash(messages, model) {
    const contextString = JSON.stringify({
      messages: messages.slice(0, -1), // Excluir último mensaje
      model
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Crea un context cache en Gemini API
   */
  async createContextCache(messages, model = 'gemini-2.5-flash-lite', ttlSeconds = 3600) {
    try {
      if (!env.geminiApiKey) {
        throw new Error('API key no configurada');
      }

      // Validar que los mensajes son suficientes para cachear
      if (!Array.isArray(messages) || messages.length < 2) {
        return null;
      }

      // Preparar contenido para el cache (excluir último mensaje)
      const cacheContent = messages.slice(0, -1);
      
      // Crear context cache usando la API de Gemini
      const cacheResponse = await ai.caches.create({
        model,
        contents: cacheContent,
        ttlSeconds,
        systemInstruction: {
          parts: [{
            text: "You are a helpful AI assistant. Maintain context from previous messages and provide coherent responses."
          }]
        }
      });

      const contextHash = this.generateContextHash(messages, model);
      
      // Almacenar información del cache
      const cacheInfo = {
        cacheName: cacheResponse.name,
        contextHash,
        model,
        createdAt: Date.now(),
        ttlSeconds,
        messageCount: cacheContent.length,
        expiresAt: Date.now() + (ttlSeconds * 1000)
      };

      this.contextCaches.set(contextHash, cacheInfo);
      this.cacheStats.created++;

      console.log(`✅ Context cache creado: ${cacheResponse.name}`);
      return cacheInfo;

    } catch (error) {
      console.error('Error creando context cache:', error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Obtiene un context cache existente
   */
  async getContextCache(messages, model) {
    const contextHash = this.generateContextHash(messages, model);
    const cacheInfo = this.contextCaches.get(contextHash);

    if (!cacheInfo) {
      this.cacheStats.misses++;
      return null;
    }

    // Verificar si el cache ha expirado
    if (Date.now() > cacheInfo.expiresAt) {
      this.contextCaches.delete(contextHash);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return cacheInfo;
  }

  /**
   * Usa un context cache para generar contenido
   */
  async generateWithCache(messages, model, params = {}) {
    try {
      // Intentar obtener cache existente
      let cacheInfo = await this.getContextCache(messages, model);
      
      // Si no existe cache, crear uno nuevo
      if (!cacheInfo && messages.length >= 3) {
        cacheInfo = await this.createContextCache(messages, model);
      }

      const lastMessage = messages[messages.length - 1];

      if (cacheInfo) {
        // Usar el context cache
        console.log(`🚀 Usando context cache: ${cacheInfo.cacheName}`);
        
        const response = await ai.models.generateContent({
          model,
          contents: [lastMessage], // Solo el último mensaje
          cachedContent: cacheInfo.cacheName,
          generationConfig: {
            temperature: params.temperature || 0.7,
            topK: params.topK || 40,
            topP: params.topP || 0.95,
            maxOutputTokens: params.maxOutputTokens || 2048,
          }
        });

        return {
          response,
          usedCache: true,
          cacheInfo
        };
      } else {
        // Fallback a generación normal
        console.log('📝 Generando sin cache (fallback)');
        
        const response = await ai.models.generateContent({
          model,
          contents: messages,
          generationConfig: {
            temperature: params.temperature || 0.7,
            topK: params.topK || 40,
            topP: params.topP || 0.95,
            maxOutputTokens: params.maxOutputTokens || 2048,
          }
        });

        return {
          response,
          usedCache: false,
          cacheInfo: null
        };
      }

    } catch (error) {
      console.error('Error en generateWithCache:', error);
      throw error;
    }
  }

  /**
   * Limpia caches expirados
   */
  async cleanupExpiredCaches() {
    const now = Date.now();
    const expiredCaches = [];

    for (const [hash, cacheInfo] of this.contextCaches.entries()) {
      if (now > cacheInfo.expiresAt) {
        expiredCaches.push(hash);
      }
    }

    for (const hash of expiredCaches) {
      const cacheInfo = this.contextCaches.get(hash);
      try {
        // Intentar eliminar el cache de la API
        await ai.caches.delete(cacheInfo.cacheName);
        console.log(`🗑️ Cache eliminado: ${cacheInfo.cacheName}`);
      } catch (error) {
        console.warn(`Error eliminando cache ${cacheInfo.cacheName}:`, error.message);
      }
      this.contextCaches.delete(hash);
    }

    return expiredCaches.length;
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      activeCaches: this.contextCaches.size,
      estimatedSavings: `${(this.cacheStats.hits * 0.5 * 100).toFixed(0)}% cost reduction`
    };
  }

  /**
   * Limpia todos los caches
   */
  async clearAllCaches() {
    const deletedCount = this.contextCaches.size;
    
    for (const [hash, cacheInfo] of this.contextCaches.entries()) {
      try {
        await ai.caches.delete(cacheInfo.cacheName);
      } catch (error) {
        console.warn(`Error eliminando cache ${cacheInfo.cacheName}:`, error.message);
      }
    }

    this.contextCaches.clear();
    this.cacheStats = { hits: 0, misses: 0, created: 0, errors: 0 };
    
    return deletedCount;
  }

  /**
   * Optimiza automáticamente el uso de cache
   */
  shouldCreateCache(messages) {
    // Solo crear cache para conversaciones con suficiente contexto
    if (messages.length < 3) return false;
    
    // Calcular el tamaño total del contexto
    const totalLength = messages.reduce((sum, msg) => {
      return sum + (msg.parts?.[0]?.text?.length || 0);
    }, 0);

    // Crear cache solo si el contexto es sustancial (>500 caracteres)
    return totalLength > 500;
  }
}

// Instancia singleton
const contextCacheService = new ContextCacheService();

// Limpieza automática cada 30 minutos
setInterval(() => {
  contextCacheService.cleanupExpiredCaches()
    .then(count => {
      if (count > 0) {
        console.log(`🧹 Limpieza automática: ${count} caches eliminados`);
      }
    })
    .catch(console.error);
}, 30 * 60 * 1000);

export default contextCacheService;