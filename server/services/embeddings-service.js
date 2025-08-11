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
      content: index.meta[idx].text || '',
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

/**
 * Función para inicializar automáticamente la base de conocimientos al arrancar el servidor
 */
export async function initializeKnowledgeBaseOnStartup() {
  try {
    console.log('🚀 Inicializando base de conocimientos automáticamente...');
    
    // Datos de la base de conocimientos de NUVOS (completa con 47 documentos)
    const knowledgeBase = [
      // === INFORMACIÓN GENERAL DE NUVOS CLOUD ===
      {
        content: "NUVOS Cloud es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización. Es un ecosistema completo para la gestión de activos digitales y generación de ingresos pasivos.",
        metadata: { type: "general", category: "platform", topic: "overview" }
      },
      {
        content: "NUVOS Cloud utiliza tecnología blockchain avanzada con contratos inteligentes auditados para garantizar máxima seguridad, transparencia y descentralización en todas las operaciones.",
        metadata: { type: "general", category: "technology", topic: "blockchain" }
      },
      {
        content: "La plataforma NUVOS Cloud está diseñada para ser user-friendly, permitiendo tanto a principiantes como expertos en crypto acceder fácilmente a DeFi, NFTs y staking.",
        metadata: { type: "general", category: "platform", topic: "usability" }
      },

      // === CONTRATO SMARTSTAKING - INFORMACIÓN DETALLADA ===
      {
        content: "El contrato SmartStaking de NUVOS permite a los usuarios depositar ETH y ganar recompensas automáticas. Incluye funciones como deposit(), withdraw(), calculateRewards() y emergencyWithdraw().",
        metadata: { type: "smart-contract", category: "staking", topic: "smartstaking-overview" }
      },
      {
        content: "SmartStaking tiene límites de depósito: mínimo 0.02 ETH (674563918244f40000 wei) y máximo 10 ETH (69021e19e0c9bab2400000 wei). Máximo 300 depósitos por usuario.",
        metadata: { type: "smart-contract", category: "staking", topic: "deposit-limits" }
      },
      {
        content: "Las recompensas en SmartStaking se calculan con diferentes APY según el tiempo: 0-30 días: 5%, 30-90 días: 12%, 90-180 días: 10%, 180+ días: 3.2%. Comisión del 2.5% por depósito.",
        metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" }
      },
      {
        content: "SmartStaking incluye funciones de administración: pause(), unpause(), changeTreasuryAddress(), migrateToNewContract() y withdrawPendingCommission() solo para el owner.",
        metadata: { type: "smart-contract", category: "staking", topic: "admin-functions" }
      },
      {
        content: "El contrato SmartStaking emite eventos importantes: DepositMade, WithdrawalMade, BalanceAdded, CommissionPaid, ContractPaused, ContractUnpaused para tracking de actividades.",
        metadata: { type: "smart-contract", category: "staking", topic: "events" }
      },
      {
        content: "SmartStaking incluye funciones de vista: getUserDeposits(), getUserInfo(), getTotalDeposit(), calculateRewards(), getContractBalance() para consultar información sin gas.",
        metadata: { type: "smart-contract", category: "staking", topic: "view-functions" }
      },
      {
        content: "El contrato SmartStaking tiene protecciones de seguridad: ReentrancyGuard, Pausable, Ownable, y validaciones de límites para prevenir ataques y errores.",
        metadata: { type: "smart-contract", category: "staking", topic: "security" }
      },

      // === CONTRATO MARKETPLACE - INFORMACIÓN DETALLADA ===
      {
        content: "El contrato Marketplace de NUVOS es un marketplace completo de NFTs que permite crear, listar, comprar, vender NFTs y hacer ofertas. Incluye sistema de royalties y categorías.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "overview" }
      },
      {
        content: "Marketplace permite crear NFTs individuales con createNFT() o en lotes con createNFTBatch(). Máximo 50 NFTs por lote. Incluye URI de metadata, categoría y porcentaje de royalty.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "nft-creation" }
      },
      {
        content: "El sistema de ofertas en Marketplace incluye: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Las ofertas tienen fecha de expiración y requieren depósito de ETH.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "offers-system" }
      },
      {
        content: "Marketplace incluye sistema social: addComment(), likeToken(), unlikeToken(), getComments(), getLikesCount() para interacción de la comunidad con los NFTs.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "social-features" }
      },
      {
        content: "El contrato Marketplace tiene roles de acceso: DEFAULT_ADMIN_ROLE, ADMIN_ROLE, MODERATOR_ROLE para gestión de permisos y moderación de contenido.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "access-control" }
      },
      {
        content: "Marketplace incluye funciones de administración: blacklistAddress(), emergencyWithdraw(), pause(), unpause() y gestión de categorías para moderación.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "admin-functions" }
      },
      {
        content: "Los royalties en Marketplace se pagan automáticamente al creador original en cada venta secundaria. Máximo 10% de royalty por NFT, configurable por el creador.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "royalties" }
      },
      {
        content: "Marketplace emite eventos: TokenMinted, TokenListed, TokenSold, OfferCreated, OfferAccepted, CommentAdded, TokenLiked para tracking completo de actividades.",
        metadata: { type: "smart-contract", category: "marketplace", topic: "events" }
      },

      // === INFORMACIÓN DE STAKING ===
      {
        content: "El staking en NUVOS Cloud permite depositar ETH en el contrato SmartStaking para ganar recompensas automáticas. Las recompensas se calculan según el tiempo de permanencia.",
        metadata: { type: "staking", category: "guide", topic: "basics" }
      },
      {
        content: "Para hacer staking en NUVOS: 1) Conecta tu wallet, 2) Ve a la sección Staking, 3) Ingresa cantidad (min 0.02 ETH), 4) Confirma transacción. Recompensas se calculan automáticamente.",
        metadata: { type: "staking", category: "tutorial", topic: "how-to" }
      },
      {
        content: "Las recompensas de staking en NUVOS se pueden reclamar en cualquier momento usando withdraw() o withdrawAll(). Se cobra comisión del 2.5% que va al treasury.",
        metadata: { type: "staking", category: "rewards", topic: "claiming" }
      },
      {
        content: "El staking en NUVOS tiene diferentes niveles de APY: primeros 30 días 5%, días 30-90 12%, días 90-180 10%, después de 180 días 3.2% para optimizar retornos.",
        metadata: { type: "staking", category: "rewards", topic: "apy-tiers" }
      },
      {
        content: "Los riesgos del staking incluyen volatilidad de ETH, riesgo de smart contract y posibles cambios en APY. El contrato está auditado pero siempre existe riesgo.",
        metadata: { type: "staking", category: "risks", topic: "warnings" }
      },

      // === INFORMACIÓN DE MARKETPLACE Y NFTS ===
      {
        content: "El marketplace de NUVOS Cloud permite crear, comprar, vender y hacer ofertas en NFTs. Incluye sistema de categorías, comentarios, likes y royalties automáticos.",
        metadata: { type: "marketplace", category: "guide", topic: "basics" }
      },
      {
        content: "Para crear NFTs en NUVOS: 1) Ve a Marketplace, 2) Click 'Create NFT', 3) Sube metadata/imagen, 4) Selecciona categoría, 5) Define royalty (max 10%), 6) Confirma transacción.",
        metadata: { type: "marketplace", category: "tutorial", topic: "create-nft" }
      },
      {
        content: "Para vender NFTs: 1) Ve a tu colección, 2) Selecciona NFT, 3) Click 'List for Sale', 4) Define precio (min configurado), 5) Confirma. El NFT aparecerá en marketplace.",
        metadata: { type: "marketplace", category: "tutorial", topic: "sell-nft" }
      },
      {
        content: "El sistema de ofertas permite hacer ofertas por debajo del precio listado. Las ofertas requieren depósito de ETH y tienen fecha de expiración configurable.",
        metadata: { type: "marketplace", category: "features", topic: "offers" }
      },
      {
        content: "Los NFTs en NUVOS Cloud pueden tener utilidad especial: acceso a eventos, descuentos, airdrops exclusivos, o funciones premium en la plataforma.",
        metadata: { type: "nft", category: "utility", topic: "benefits" }
      },

      // === INFORMACIÓN DE AIRDROPS ===
      {
        content: "Los airdrops en NUVOS Cloud son distribuciones gratuitas de tokens a usuarios elegibles. Criterios incluyen: tener ETH en staking, poseer NFTs, o participación activa.",
        metadata: { type: "airdrop", category: "guide", topic: "basics" }
      },
      {
        content: "Para participar en airdrops: 1) Mantén ETH en staking, 2) Participa en la comunidad, 3) Posee NFTs de NUVOS, 4) Mantén wallet conectada durante snapshots.",
        metadata: { type: "airdrop", category: "tutorial", topic: "participation" }
      },
      {
        content: "Los airdrops se anuncian en Discord, Twitter y la plataforma. Los snapshots se toman en fechas específicas y los tokens se distribuyen automáticamente.",
        metadata: { type: "airdrop", category: "process", topic: "distribution" }
      },

      // === INFORMACIÓN TÉCNICA AVANZADA ===
      {
        content: "NUVOS Cloud utiliza contratos inteligentes en Ethereum con las siguientes características: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 para máxima seguridad.",
        metadata: { type: "technical", category: "security", topic: "smart-contracts" }
      },
      {
        content: "La plataforma soporta wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Asegúrate de tener ETH para gas fees en transacciones.",
        metadata: { type: "technical", category: "wallets", topic: "compatibility" }
      },
      {
        content: "Gas fees en NUVOS varían según congestión de Ethereum: ~50-200 gwei para transacciones normales. Usa herramientas como ETH Gas Station para optimizar.",
        metadata: { type: "technical", category: "transactions", topic: "gas-fees" }
      },
      {
        content: "Los contratos de NUVOS están verificados en Etherscan. SmartStaking maneja depósitos/retiros, Marketplace maneja NFTs. Ambos tienen funciones de emergencia.",
        metadata: { type: "technical", category: "contracts", topic: "verification" }
      },

      // === FAQs EXPANDIDAS ===
      {
        content: "¿Cuánto tiempo toma recibir recompensas de staking? Las recompensas se calculan en tiempo real y están disponibles para retiro inmediatamente después del depósito.",
        metadata: { type: "faq", category: "staking", topic: "timing" }
      },
      {
        content: "¿Puedo hacer unstake en cualquier momento? Sí, puedes retirar tus fondos y recompensas en cualquier momento sin penalizaciones usando withdraw() o withdrawAll().",
        metadata: { type: "faq", category: "staking", topic: "unstaking" }
      },
      {
        content: "¿Cómo funcionan los royalties en el marketplace? Los royalties (max 10%) se pagan automáticamente al creador original en cada venta secundaria del NFT.",
        metadata: { type: "faq", category: "marketplace", topic: "royalties" }
      },
      {
        content: "¿Qué pasa si mi transacción falla? Verifica: suficiente ETH para gas, wallet conectada, límites no excedidos, contrato no pausado. Intenta aumentar gas limit.",
        metadata: { type: "faq", category: "troubleshooting", topic: "transactions" }
      },
      {
        content: "¿Puedo cancelar una oferta en el marketplace? Sí, puedes cancelar ofertas que hayas hecho usando cancelOffer(). El ETH depositado se devuelve automáticamente.",
        metadata: { type: "faq", category: "marketplace", topic: "offers" }
      },
      {
        content: "¿Hay límites en el marketplace? Sí: máximo 50 NFTs por batch mint, precio mínimo configurable, royalty máximo 10%, y límites de gas por transacción.",
        metadata: { type: "faq", category: "marketplace", topic: "limits" }
      },

      // === TOKENIZACIÓN Y UTILIDAD ===
      {
        content: "La tokenización en NUVOS Cloud permite convertir activos reales en NFTs verificables en blockchain, facilitando propiedad fraccionada y comercio global.",
        metadata: { type: "tokenization", category: "concept", topic: "real-world-assets" }
      },
      {
        content: "Los tokens de NUVOS Cloud tienen múltiples utilidades: governance, descuentos en fees, acceso premium, airdrops exclusivos, y staking con APY mejorado.",
        metadata: { type: "tokenization", category: "utility", topic: "token-benefits" }
      },

      // === SEGURIDAD Y MEJORES PRÁCTICAS ===
      {
        content: "Mejores prácticas de seguridad en NUVOS: nunca compartas tu seed phrase, verifica URLs, usa hardware wallets para grandes cantidades, mantén software actualizado.",
        metadata: { type: "security", category: "best-practices", topic: "wallet-security" }
      },
      {
        content: "Antes de interactuar con contratos: verifica direcciones en Etherscan, lee términos, entiende riesgos, empieza con cantidades pequeñas para probar.",
        metadata: { type: "security", category: "best-practices", topic: "contract-interaction" }
      },

      // === ROADMAP Y FUTURO ===
      {
        content: "NUVOS Cloud roadmap incluye: integración con más blockchains, nuevas funciones DeFi, partnerships estratégicos, y expansión del ecosistema NFT.",
        metadata: { type: "roadmap", category: "future", topic: "development" }
      },
      {
        content: "Próximas funciones de NUVOS: lending/borrowing con NFTs como colateral, farming de liquidez, governance token, y marketplace multi-chain.",
        metadata: { type: "roadmap", category: "features", topic: "upcoming" }
      }
    ];

    // Inicializar el índice con los documentos
    const result = await embeddingsService.upsertIndex('knowledge_base', knowledgeBase.map(doc => ({
      text: doc.content,
      meta: doc.metadata
    })));

    console.log(`✅ Base de conocimientos inicializada: ${result.count} documentos indexados`);
    console.log('📊 Categorías disponibles:', [...new Set(knowledgeBase.map(d => d.metadata.type))]);
    
  } catch (error) {
    console.error('❌ Error inicializando base de conocimientos:', error.message);
    // No lanzar error para no interrumpir el arranque del servidor
  }
}

export default embeddingsService;