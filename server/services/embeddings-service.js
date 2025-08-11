import ai from '../config/ai-config.js';
import env from '../config/environment.js';

/**
 * Servicio de Embeddings y Búsqueda Semántica
 */
class EmbeddingsService {
  constructor() {
    this.indexes = new Map(); // nombreIndex -> { vectors: Float32Array[], meta: any[] }
    this.defaultModel = 'text-embedding-004';
  }

  async embedTexts(texts = [], model = this.defaultModel) {
    if (!env.geminiApiKey) throw new Error('API key no configurada');
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const res = await ai.models.embedContent({
      model,
      contents: texts.map(t => ({ role: 'user', parts: [{ text: t }]}))
    });

    const vectors = res.embeddings?.[0]?.values
      ? res.embeddings.map(e => new Float32Array(e.values))
      : (res[0]?.values ? res.map(e => new Float32Array(e.values)) : []);

    return vectors;
  }

  // Crea/actualiza un índice en memoria
  async upsertIndex(name, documents = [], options = {}) {
    if (!name) throw new Error('Nombre de índice requerido');
    if (!Array.isArray(documents) || documents.length === 0) return { count: 0 };

    const texts = documents.map(d => (typeof d === 'string' ? d : d.text || ''));
    const metas = documents.map(d => (typeof d === 'string' ? {} : (d.meta || {})));

    const vectors = await this.embedTexts(texts, options.model || this.defaultModel);

    const existing = this.indexes.get(name) || { vectors: [], meta: [] };

    for (let i = 0; i < vectors.length; i++) {
      existing.vectors.push(vectors[i]);
      existing.meta.push({ text: texts[i], ...metas[i] });
    }

    this.indexes.set(name, existing);
    return { count: vectors.length };
  }

  // Búsqueda por similitud usando coseno
  async search(name, query, topK = 5, options = {}) {
    const index = this.indexes.get(name);
    if (!index || index.vectors.length === 0) return [];

    const [queryVec] = await this.embedTexts([query], options.model || this.defaultModel);
    if (!queryVec) return [];

    const scores = index.vectors.map((vec, idx) => ({
      idx,
      score: this.cosineSimilarity(vec, queryVec)
    }));

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(({ idx, score }) => ({
      score,
      meta: index.meta[idx]
    }));
  }

  cosineSimilarity(a, b) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
  }

  clearIndex(name) {
    this.indexes.delete(name);
  }

  getIndexStats(name) {
    const idx = this.indexes.get(name);
    return idx ? { size: idx.vectors.length } : { size: 0 };
  }
}

const embeddingsService = new EmbeddingsService();
export default embeddingsService;