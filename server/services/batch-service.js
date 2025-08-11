import { processGeminiRequest } from './gemini-service.js';
import embeddingsService from './embeddings-service.js';
import analyticsService from './analytics-service.js';

/**
 * Servicio de Batch Processing para Múltiples Requests
 * Procesa eficientemente múltiples consultas con optimizaciones de rendimiento
 */
class BatchService {
  constructor() {
    this.activeJobs = new Map();
    this.jobQueue = [];
    this.maxConcurrentJobs = 5;
    this.maxBatchSize = 50;
    this.processingQueue = false;
  }

  /**
   * Procesa múltiples requests de generación de contenido
   * @param {Array} requests - Array de objetos con {prompt, model?, temperature?, maxTokens?}
   * @param {Object} options - Opciones de procesamiento
   * @returns {Promise} Resultado del batch processing
   */
  async processBatchGeneration(requests, options = {}) {
    const batchId = this.generateBatchId();
    const startTime = Date.now();
    
    // Validaciones
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new Error('Se requiere un array de requests no vacío');
    }
    
    if (requests.length > this.maxBatchSize) {
      throw new Error(`Máximo ${this.maxBatchSize} requests por batch`);
    }
    
    const {
      concurrency = Math.min(this.maxConcurrentJobs, requests.length),
      failFast = false,
      includeMetrics = true,
      timeout = 30000,
      retryFailures = true,
      maxRetries = 2
    } = options;
    
    // Registrar inicio del batch
    const batchMetrics = analyticsService.startRequest('batch_generation', 'batch');
    
    try {
      // Crear job de batch
      const batchJob = {
        id: batchId,
        type: 'generation',
        requests,
        options,
        startTime,
        status: 'processing',
        results: [],
        errors: [],
        progress: 0
      };
      
      this.activeJobs.set(batchId, batchJob);
      
      // Procesar requests en chunks con concurrencia controlada
      const results = await this.processWithConcurrency(
        requests,
        async (request, index) => {
          const requestStartTime = Date.now();
          let attempt = 0;
          
          while (attempt <= maxRetries) {
            try {
              // Timeout por request individual
              const requestPromise = this.processIndividualRequest(request, index);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
              );
              
              const result = await Promise.race([requestPromise, timeoutPromise]);
              
              // Actualizar progreso
              batchJob.progress = ((index + 1) / requests.length * 100);
              
              return {
                index,
                success: true,
                result,
                responseTime: Date.now() - requestStartTime,
                attempts: attempt + 1
              };
              
            } catch (error) {
              attempt++;
              
              if (attempt > maxRetries || !retryFailures) {
                const errorResult = {
                  index,
                  success: false,
                  error: error.message,
                  responseTime: Date.now() - requestStartTime,
                  attempts: attempt
                };
                
                batchJob.errors.push(errorResult);
                
                if (failFast) {
                  throw new Error(`Batch failed at request ${index}: ${error.message}`);
                }
                
                return errorResult;
              }
              
              // Esperar antes del retry (exponential backoff)
              await this.delay(Math.pow(2, attempt) * 1000);
            }
          }
        },
        concurrency
      );
      
      // Procesar resultados
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      batchJob.status = 'completed';
      batchJob.results = results;
      
      const totalTime = Date.now() - startTime;
      
      // Métricas finales
      const batchResult = {
        batchId,
        status: 'completed',
        summary: {
          total: requests.length,
          successful: successful.length,
          failed: failed.length,
          successRate: (successful.length / requests.length * 100).toFixed(2),
          totalTime,
          averageTimePerRequest: (totalTime / requests.length).toFixed(2)
        },
        results: includeMetrics ? results : results.map(r => ({ 
          index: r.index, 
          success: r.success, 
          result: r.result, 
          error: r.error 
        })),
        errors: failed.length > 0 ? failed : undefined
      };
      
      // Registrar éxito del batch
      analyticsService.endRequest(batchMetrics, {
        tokensUsed: successful.reduce((sum, r) => sum + (r.result?.tokensUsed || 0), 0),
        batchSize: requests.length,
        successRate: successful.length / requests.length
      });
      
      // Limpiar job después de 1 hora
      setTimeout(() => this.activeJobs.delete(batchId), 60 * 60 * 1000);
      
      return batchResult;
      
    } catch (error) {
      // Registrar fallo del batch
      analyticsService.failRequest(batchMetrics, error);
      
      this.activeJobs.get(batchId).status = 'failed';
      this.activeJobs.get(batchId).error = error.message;
      
      throw error;
    }
  }

  /**
   * Procesa múltiples operaciones de embeddings
   */
  async processBatchEmbeddings(operations, options = {}) {
    const batchId = this.generateBatchId();
    const startTime = Date.now();
    
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Se requiere un array de operaciones no vacío');
    }
    
    const {
      concurrency = 3,
      includeMetrics = true
    } = options;
    
    const batchMetrics = analyticsService.startRequest('batch_embeddings', 'batch');
    
    try {
      const results = await this.processWithConcurrency(
        operations,
        async (operation, index) => {
          const { type, ...params } = operation;
          const operationStartTime = Date.now();
          
          try {
            let result;
            
            switch (type) {
              case 'index':
                result = await embeddingsService.upsertIndex(
                  params.name,
                  params.documents,
                  params.options
                );
                analyticsService.recordEmbeddingOperation('index_created', {
                  count: params.documents?.length || 0
                });
                break;
                
              case 'search':
                result = await embeddingsService.search(
                  params.name,
                  params.query,
                  params.topK,
                  params.options
                );
                analyticsService.recordEmbeddingOperation('search_performed', {
                  responseTime: Date.now() - operationStartTime
                });
                break;
                
              case 'embed':
                result = await embeddingsService.embedTexts(
                  params.texts,
                  params.model
                );
                break;
                
              default:
                throw new Error(`Tipo de operación no soportado: ${type}`);
            }
            
            return {
              index,
              success: true,
              type,
              result,
              responseTime: Date.now() - operationStartTime
            };
            
          } catch (error) {
            return {
              index,
              success: false,
              type,
              error: error.message,
              responseTime: Date.now() - operationStartTime
            };
          }
        },
        concurrency
      );
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      const batchResult = {
        batchId,
        status: 'completed',
        summary: {
          total: operations.length,
          successful: successful.length,
          failed: failed.length,
          successRate: (successful.length / operations.length * 100).toFixed(2),
          totalTime: Date.now() - startTime
        },
        results: includeMetrics ? results : results.map(r => ({
          index: r.index,
          success: r.success,
          type: r.type,
          result: r.result,
          error: r.error
        }))
      };
      
      analyticsService.endRequest(batchMetrics, {
        batchSize: operations.length,
        successRate: successful.length / operations.length
      });
      
      return batchResult;
      
    } catch (error) {
      analyticsService.failRequest(batchMetrics, error);
      throw error;
    }
  }

  /**
   * Procesa análisis de texto en batch
   */
  async processBatchAnalysis(texts, analysisType = 'general', options = {}) {
    const requests = texts.map(text => ({
      prompt: this.generateAnalysisPrompt(text, analysisType),
      model: options.model,
      temperature: 0.3 // Más determinístico para análisis
    }));
    
    const batchResult = await this.processBatchGeneration(requests, {
      ...options,
      concurrency: Math.min(3, requests.length) // Menor concurrencia para análisis
    });
    
    // Agregar contexto de análisis
    batchResult.analysisType = analysisType;
    batchResult.textsAnalyzed = texts.length;
    
    return batchResult;
  }

  /**
   * Obtiene el estado de un batch job
   */
  getBatchStatus(batchId) {
    const job = this.activeJobs.get(batchId);
    if (!job) {
      return { error: 'Batch job no encontrado' };
    }
    
    return {
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      startTime: job.startTime,
      requestCount: job.requests?.length || 0,
      completedCount: job.results?.length || 0,
      errorCount: job.errors?.length || 0,
      estimatedTimeRemaining: this.estimateTimeRemaining(job)
    };
  }

  /**
   * Lista todos los batch jobs activos
   */
  getActiveBatches() {
    return Array.from(this.activeJobs.values()).map(job => ({
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      startTime: job.startTime,
      requestCount: job.requests?.length || 0
    }));
  }

  /**
   * Cancela un batch job
   */
  cancelBatch(batchId) {
    const job = this.activeJobs.get(batchId);
    if (!job) {
      return { error: 'Batch job no encontrado' };
    }
    
    if (job.status === 'completed' || job.status === 'failed') {
      return { error: 'No se puede cancelar un batch completado o fallido' };
    }
    
    job.status = 'cancelled';
    
    return { message: 'Batch cancelado exitosamente' };
  }

  /**
   * Obtiene estadísticas de batch processing
   */
  getBatchStats() {
    const jobs = Array.from(this.activeJobs.values());
    const completed = jobs.filter(j => j.status === 'completed');
    const failed = jobs.filter(j => j.status === 'failed');
    const processing = jobs.filter(j => j.status === 'processing');
    
    return {
      total: jobs.length,
      completed: completed.length,
      failed: failed.length,
      processing: processing.length,
      successRate: jobs.length > 0 
        ? (completed.length / jobs.length * 100).toFixed(2)
        : 0,
      averageProcessingTime: completed.length > 0
        ? completed.reduce((sum, job) => {
            const endTime = job.results?.[job.results.length - 1]?.responseTime || 0;
            return sum + (endTime - job.startTime);
          }, 0) / completed.length
        : 0
    };
  }

  // === Métodos privados ===

  async processIndividualRequest(request, index) {
    const { prompt, model, temperature, maxTokens, ...otherParams } = request;
    
    if (!prompt) {
      throw new Error(`Request ${index}: prompt es requerido`);
    }
    
    const result = await processGeminiRequest(prompt, model, {
      temperature,
      maxOutputTokens: maxTokens,
      ...otherParams
    });
    
    return {
      text: result.text,
      tokensUsed: result.usage?.totalTokens || 0,
      model: model || 'default'
    };
  }

  async processWithConcurrency(items, processor, concurrency) {
    const results = [];
    const executing = [];
    
    for (let i = 0; i < items.length; i++) {
      const promise = processor(items[i], i).then(result => {
        results[i] = result;
        return result;
      });
      
      executing.push(promise);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
        // Remover promesas completadas
        for (let j = executing.length - 1; j >= 0; j--) {
          if (results[i - executing.length + j + 1] !== undefined) {
            executing.splice(j, 1);
          }
        }
      }
    }
    
    // Esperar a que terminen todas las promesas restantes
    await Promise.all(executing);
    
    return results;
  }

  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAnalysisPrompt(text, analysisType) {
    const prompts = {
      sentiment: `Analiza el sentimiento del siguiente texto y proporciona:
1. Sentimiento general (positivo/negativo/neutral)
2. Intensidad emocional (1-10)
3. Emociones específicas detectadas
4. Justificación del análisis

Texto: "${text}"`,
      
      summary: `Proporciona un resumen conciso del siguiente texto:
1. Ideas principales (máximo 3)
2. Puntos clave
3. Conclusión principal

Texto: "${text}"`,
      
      keywords: `Extrae las palabras clave y temas principales del siguiente texto:
1. 5-10 palabras clave más importantes
2. Temas principales
3. Conceptos relevantes

Texto: "${text}"`,
      
      general: `Analiza el siguiente texto y proporciona:
1. Tema principal
2. Tono y estilo
3. Puntos clave
4. Observaciones relevantes

Texto: "${text}"`
    };
    
    return prompts[analysisType] || prompts.general;
  }

  estimateTimeRemaining(job) {
    if (job.status !== 'processing' || job.progress === 0) {
      return null;
    }
    
    const elapsed = Date.now() - job.startTime;
    const estimatedTotal = elapsed / (job.progress / 100);
    const remaining = estimatedTotal - elapsed;
    
    return Math.max(0, Math.round(remaining));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const batchService = new BatchService();
export default batchService;