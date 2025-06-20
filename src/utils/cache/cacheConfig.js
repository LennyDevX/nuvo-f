/**
 * Configuración centralizada para el sistema de cache
 */

// TTL (Time To Live) configurations in milliseconds
export const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000,              // 5 minutos
  NFT_METADATA: 30 * 60 * 1000,        // 30 minutos
  USER_NFTS: 10 * 60 * 1000,           // 10 minutos
  NFT_DATA: 15 * 60 * 1000,            // 15 minutos
  USER_STATS: 5 * 60 * 1000,           // 5 minutos
  MARKETPLACE_LISTINGS: 2 * 60 * 1000, // 2 minutos (más dinámico)
  MARKETPLACE_STATS: 5 * 60 * 1000,    // 5 minutos
  TOKEN_LISTING: 2 * 60 * 1000,        // 2 minutos
  IMAGES: 7 * 24 * 60 * 60 * 1000,     // 7 días
  BLOCKCHAIN_LOGS: 30 * 60 * 1000      // 30 minutos
};

// Cleanup configuration
export const CLEANUP_CONFIG = {
  INTERVAL: 60 * 1000,          // Cada minuto
  BATCH_SIZE: 10,               // Limpiar 10 elementos por lote
  MAX_CLEANUP_TIME: 100         // Máximo 100ms por ciclo de limpieza
};

// Metrics configuration
export const METRICS_CONFIG = {
  TRACK_PERFORMANCE: true,      // Habilitar tracking de rendimiento
  LOG_INTERVAL: 5 * 60 * 1000,  // Log cada 5 minutos
  LOG_LOW_EFFICIENCY: true,     // Log caches con baja eficiencia
  EFFICIENCY_THRESHOLD: 0.5,    // Umbral de eficiencia (50%)
  ENABLE_DETAILED_LOGGING: import.meta.env.DEV, // Solo en desarrollo
  MAX_LOG_ENTRIES: 1000         // Máximo de entradas de log
};

// Memory limits
export const MEMORY_LIMITS = {
  MAX_CACHE_SIZE_MB: 50,        // 50MB máximo por cache
  WARNING_THRESHOLD_MB: 30,     // Advertencia a los 30MB
  CLEANUP_THRESHOLD_MB: 40      // Forzar limpieza a los 40MB
};

// BigInt JSON serializer/deserializer
export const JSON_UTILS = {
  /**
   * Replacer function para JSON.stringify que maneja BigInt
   */
  replacer: (key, value) => {
    if (typeof value === 'bigint') {
      return {
        __type: 'bigint',
        __value: value.toString()
      };
    }
    return value;
  },

  /**
   * Reviver function para JSON.parse que maneja BigInt
   */
  reviver: (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'bigint') {
      return BigInt(value.__value);
    }
    return value;
  },

  /**
   * Wrapper seguro para JSON.stringify
   */
  safeStringify: (obj, space) => {
    try {
      return JSON.stringify(obj, JSON_UTILS.replacer, space);
    } catch (error) {
      console.warn('Failed to stringify object:', error);
      return '{}';
    }
  },

  /**
   * Wrapper seguro para JSON.parse
   */
  safeParse: (str) => {
    try {
      return JSON.parse(str, JSON_UTILS.reviver);
    } catch (error) {
      console.warn('Failed to parse JSON:', error);
      return null;
    }
  }
};

// Cache size estimation utilities
export const SIZE_UTILS = {
  /**
   * Estimar tamaño de un objeto en bytes de forma segura
   */
  estimateSize: (obj) => {
    try {
      const str = JSON_UTILS.safeStringify(obj);
      return str.length * 2; // UTF-16 = 2 bytes por carácter
    } catch (error) {
      // Fallback estimation based on object type
      if (typeof obj === 'string') return obj.length * 2;
      if (typeof obj === 'number') return 8;
      if (typeof obj === 'bigint') return obj.toString().length * 2;
      if (typeof obj === 'boolean') return 4;
      if (Array.isArray(obj)) return obj.length * 100; // Estimación
      if (typeof obj === 'object' && obj !== null) return Object.keys(obj).length * 50;
      return 20; // Estimación por defecto
    }
  },

  /**
   * Formatear bytes en formato legible
   */
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Cache domain configurations
export const CACHE_DOMAINS = {
  nft: {
    maxSize: 100,
    defaultTTL: CACHE_TTL.USER_NFTS,
    priority: 'high'
  },
  marketplace: {
    maxSize: 200,
    defaultTTL: CACHE_TTL.MARKETPLACE_LISTINGS,
    priority: 'high'
  },
  images: {
    maxSize: 500,
    defaultTTL: CACHE_TTL.IMAGES,
    priority: 'medium'
  },
  metadata: {
    maxSize: 300,
    defaultTTL: CACHE_TTL.NFT_METADATA,
    priority: 'medium'
  },
  general: {
    maxSize: 100,
    defaultTTL: CACHE_TTL.DEFAULT,
    priority: 'low'
  }
};

// Cache warming strategies
export const WARMING_STRATEGIES = {
  marketplace: {
    enabled: true,
    priority: ['recent-listings', 'floor-prices', 'trending-collections'],
    maxPreloadItems: 20
  },
  nft: {
    enabled: true,
    priority: ['user-collections', 'featured-nfts'],
    maxPreloadItems: 15
  },
  metadata: {
    enabled: true,
    priority: ['popular-tokens', 'recent-mints'],
    maxPreloadItems: 30
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_WARNING: 1000,  // 1 segundo
  RESPONSE_TIME_ERROR: 3000,    // 3 segundos
  MEMORY_WARNING: 25 * 1024 * 1024,  // 25MB
  MEMORY_ERROR: 45 * 1024 * 1024,    // 45MB
  HIT_RATE_WARNING: 0.3,       // 30%
  HIT_RATE_ERROR: 0.1          // 10%
};
