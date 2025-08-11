import embeddingsService from './embeddings-service.js';

/**
 * Base de conocimientos limpia con contenido bilingüe
 */
export const knowledgeBase = [
  // === INFORMACIÓN GENERAL ===
  {
    content: "Nuvos Cloud is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. / Nuvos Cloud es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización. Es un ecosistema completo para la gestión de activos digitales y generación de ingresos pasivos. Commands: 'Nuvos Cloud', 'Nuvos Cloud platform', 'Nuvos Cloud general'.",
    metadata: { type: "general", category: "platform", topic: "overview" }
  },
  {
    content: "Nuvos Cloud uses advanced blockchain technology with audited smart contracts to ensure maximum security, transparency and decentralization in all operations. / Nuvos Cloud utiliza tecnología blockchain avanzada con contratos inteligentes auditados para garantizar máxima seguridad, transparencia y descentralización en todas las operaciones. Commands: 'Nuvos Cloud technology', 'Nuvos Cloud blockchain', 'Nuvos Cloud security'.",
    metadata: { type: "general", category: "technology", topic: "blockchain" }
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuvos Cloud SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Includes functions like deposit(), withdraw(), calculateRewards() and emergencyWithdraw(). / El contrato SmartStaking de Nuvos Cloud permite a los usuarios depositar tokens POL y ganar recompensas automáticas. Incluye funciones como deposit(), withdraw(), calculateRewards() y emergencyWithdraw(). Commands: 'Nuvos Cloud smart contract', 'Nuvos Cloud SmartStaking'.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" }
  },
  {
    content: "Nuvos Cloud SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL. Maximum 300 deposits per user. / SmartStaking de Nuvos Cloud tiene límites de depósito: mínimo 5 POL y máximo 10000 POL. Máximo 300 depósitos por usuario. Commands: 'Nuvos Cloud limits', 'Nuvos Cloud deposit minimum'.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" }
  },

  // === STAKING INFORMATION ===
  {
    content: "Nuvos Cloud staking allows depositing POL tokens in the SmartStaking contract to earn automatic rewards. Rewards are calculated based on time held. / El staking en Nuvos Cloud permite depositar tokens POL en el contrato SmartStaking para ganar recompensas automáticas. Las recompensas se calculan según el tiempo de permanencia. Commands: 'Nuvos Cloud staking', 'Nuvos Cloud rewards'.",
    metadata: { type: "staking", category: "guide", topic: "basics" }
  },
  {
    content: "How to stake in Nuvos Cloud: 1) Connect wallet, 2) Go to Staking section, 3) Enter amount (min 5 POL), 4) Confirm transaction. Rewards calculated automatically. / Para hacer staking en Nuvos Cloud: 1) Conecta tu wallet, 2) Ve a la sección Staking, 3) Ingresa cantidad (min 5 POL), 4) Confirma transacción. Recompensas se calculan automáticamente. Commands: 'Nuvos Cloud how to stake'.",
    metadata: { type: "staking", category: "tutorial", topic: "how-to" }
  },
  {
    content: "Claiming rewards in Nuvos Cloud: Use claimRewards() to withdraw only rewards or withdrawAll() to withdraw capital + rewards. No penalties for early withdrawal. / Reclamar recompensas en Nuvos Cloud: Usa claimRewards() para retirar solo recompensas o withdrawAll() para retirar capital + recompensas. Sin penalizaciones por retiro temprano. Commands: 'Nuvos Cloud claim rewards'.",
    metadata: { type: "staking", category: "tutorial", topic: "claiming" }
  },
  {
    content: "Nuvos Cloud APY tiers based on time: 0-30 days: 0.01% per hour, 30-90 days: 0.012%, 90-180 days: 0.016%, 180+ days: 0.02%, 365 days: 0.03%. Bonuses: 0.5% for 30 days, 1% for 90 days, 2% for 180 days, 5% for 365 days. / Niveles de APY en Nuvos Cloud según tiempo: 0-30 días: 0.01% por hora, 30-90 días: 0.012%, 90-180 días: 0.016%, 180+ días: 0.02%, 365 días: 0.03%. Bonos: 0.5% para 30 días, 1% para 90 días, 2% para 180 días, 5% para 365 días. Commands: 'Nuvos Cloud APY', 'Nuvos Cloud rates'.",
    metadata: { type: "staking", category: "rewards", topic: "apy-tiers" }
  },
  {
    content: "Staking risks in Nuvos Cloud: Smart contract risk (mitigated by audits), impermanent loss (not applicable), market volatility of POL token. Platform has emergency functions for security. / Riesgos del staking en Nuvos Cloud: riesgo de contrato inteligente (mitigado por auditorías), pérdida impermanente (no aplicable), volatilidad del mercado del token POL. La plataforma tiene funciones de emergencia para seguridad. Commands: 'Nuvos Cloud risks'.",
    metadata: { type: "staking", category: "guide", topic: "risks" }
  },

  // === MARKETPLACE ===
  {
    content: "Nuvos Cloud marketplace offers system includes: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Offers have expiration date and require POL deposit. / El sistema de ofertas en el marketplace de Nuvos Cloud incluye: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Las ofertas tienen fecha de expiración y requieren depósito de POL. Commands: 'Nuvos Cloud marketplace', 'Nuvos Cloud offers'.",
    metadata: { type: "marketplace", category: "offers", topic: "system" }
  },

  // === NFT INFORMATION ===
  {
    content: "NFT utility in Nuvos Cloud: Governance voting rights, staking bonuses, exclusive access to features, marketplace fee discounts, and participation in special airdrops. / Utilidad de NFTs en Nuvos Cloud: derechos de voto en governance, bonos de staking, acceso exclusivo a funcionalidades, descuentos en fees del marketplace, y participación en airdrops especiales. Commands: 'Nuvos Cloud NFT', 'Nuvos Cloud NFT utility'.",
    metadata: { type: "nft", category: "utility", topic: "benefits" }
  },

  // === AIRDROPS ===
  {
    content: "Nuvos Cloud airdrops are free token distributions to eligible users. Criteria include: having POL in staking, owning NFTs, or active participation. / Los airdrops en Nuvos Cloud son distribuciones gratuitas de tokens a usuarios elegibles. Criterios incluyen: tener POL en staking, poseer NFTs, o participación activa. Commands: 'Nuvos Cloud airdrop'.",
    metadata: { type: "airdrop", category: "guide", topic: "basics" }
  },
  {
    content: "To participate in Nuvos Cloud airdrops: 1) Keep POL in staking, 2) Participate in community, 3) Own Nuvos Cloud NFTs, 4) Keep wallet connected during snapshots. / Para participar en airdrops de Nuvos Cloud: 1) Mantén POL en staking, 2) Participa en la comunidad, 3) Posee NFTs de Nuvos Cloud, 4) Mantén wallet conectada durante snapshots. Commands: 'Nuvos Cloud participate airdrop'.",
    metadata: { type: "airdrop", category: "tutorial", topic: "participation" }
  },
  {
    content: "Nuvos Cloud airdrops are announced on Discord, Twitter and the platform. Snapshots are taken on specific dates and tokens are distributed automatically. / Los airdrops de Nuvos Cloud se anuncian en Discord, Twitter y la plataforma. Los snapshots se toman en fechas específicas y los tokens se distribuyen automáticamente. Commands: 'Nuvos Cloud airdrop announcements'.",
    metadata: { type: "airdrop", category: "process", topic: "distribution" }
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuvos Cloud platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL for gas fees in transactions. / La plataforma Nuvos Cloud soporta wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Asegúrate de tener POL para gas fees en transacciones. Commands: 'Nuvos Cloud wallets'.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" }
  },
  {
    content: "Gas fees in Nuvos Cloud vary according to Polygon congestion: ~1-30 gwei for normal transactions. Use tools like Polygon Gas Station to optimize. / Gas fees en Nuvos Cloud varían según congestión de Polygon: ~1-30 gwei para transacciones normales. Usa herramientas como Polygon Gas Station para optimizar. Commands: 'Nuvos Cloud gas fees'.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" }
  },
  {
    content: "Nuvos Cloud uses smart contracts on Polygon with the following features: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 for maximum security. / Nuvos Cloud utiliza contratos inteligentes en Polygon con las siguientes características: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 para máxima seguridad. Commands: 'Nuvos Cloud technical'.",
    metadata: { type: "technical", category: "security", topic: "smart-contracts" }
  },
  {
    content: "Nuvos Cloud contracts are verified on Polygonscan. SmartStaking handles deposits/withdrawals, Marketplace handles NFTs. Both have emergency functions. / Los contratos de Nuvos Cloud están verificados en Polygonscan. SmartStaking maneja depósitos/retiros, Marketplace maneja NFTs. Ambos tienen funciones de emergencia. Commands: 'Nuvos Cloud Polygonscan'.",
    metadata: { type: "technical", category: "contracts", topic: "verification" }
  },

  // === FAQ ===
  {
    content: "What if my transaction fails in Nuvos Cloud? Check: sufficient POL for gas, wallet connected, limits not exceeded, contract not paused. Try increasing gas limit. / ¿Qué pasa si mi transacción falla en Nuvos Cloud? Verifica: suficiente POL para gas, wallet conectada, límites no excedidos, contrato no pausado. Intenta aumentar gas limit. Commands: 'Nuvos Cloud transaction fails'.",
    metadata: { type: "faq", category: "troubleshooting", topic: "transactions" }
  },
  {
    content: "Can I cancel an offer in Nuvos Cloud marketplace? Yes, you can cancel offers you've made using cancelOffer(). The deposited POL is automatically returned. / ¿Puedo cancelar una oferta en el marketplace de Nuvos Cloud? Sí, puedes cancelar ofertas que hayas hecho usando cancelOffer(). El POL depositado se devuelve automáticamente. Commands: 'Nuvos Cloud cancel offer'.",
    metadata: { type: "faq", category: "marketplace", topic: "offers" }
  },
  {
    content: "How long does it take to receive staking rewards in Nuvos Cloud? Rewards are calculated in real-time and available for withdrawal immediately after deposit. / ¿Cuánto tiempo toma recibir recompensas de staking en Nuvos Cloud? Las recompensas se calculan en tiempo real y están disponibles para retiro inmediatamente después del depósito. Commands: 'Nuvos Cloud FAQ rewards timing'.",
    metadata: { type: "faq", category: "staking", topic: "timing" }
  },
  {
    content: "Can I unstake at any time in Nuvos Cloud? Yes, you can withdraw your funds and rewards at any time without penalties using withdraw() or withdrawAll(). / ¿Puedo hacer unstake en cualquier momento en Nuvos Cloud? Sí, puedes retirar tus fondos y recompensas en cualquier momento sin penalizaciones usando withdraw() o withdrawAll(). Commands: 'Nuvos Cloud unstake'.",
    metadata: { type: "faq", category: "staking", topic: "unstaking" }
  },
  {
    content: "How do royalties work in Nuvos Cloud marketplace? Royalties (max 10%) are automatically paid to the original creator on each secondary sale of the NFT. / ¿Cómo funcionan los royalties en el marketplace de Nuvos Cloud? Los royalties (max 10%) se pagan automáticamente al creador original en cada venta secundaria del NFT. Commands: 'Nuvos Cloud royalties'.",
    metadata: { type: "faq", category: "marketplace", topic: "royalties" }
  },
  {
    content: "Are there limits in Nuvos Cloud marketplace? Yes: maximum 50 NFTs per batch mint, configurable minimum price, maximum 10% royalty, and gas limits per transaction. / ¿Hay límites en el marketplace de Nuvos Cloud? Sí: máximo 50 NFTs por batch mint, precio mínimo configurable, royalty máximo 10%, y límites de gas por transacción. Commands: 'Nuvos Cloud marketplace limits'.",
    metadata: { type: "faq", category: "marketplace", topic: "limits" }
  },

  // === TOKENIZATION ===
  {
    content: "Asset tokenization in Nuvos Cloud: NUVOS allows tokenizing real-world assets like real estate, art, commodities. Each token represents a fraction of the underlying asset. / Tokenización de activos en Nuvos Cloud: NUVOS permite tokenizar activos del mundo real como inmuebles, arte, commodities. Cada token representa una fracción del activo subyacente. Commands: 'Nuvos Cloud tokenization'.",
    metadata: { type: "tokenization", category: "assets", topic: "real-world-assets" }
  },
  {
    content: "NUVOS token utility in Nuvos Cloud: Governance (voting on proposals), staking (generando rewards), fees (transaction discounts), premium access to features. / Utilidad del token NUVOS en Nuvos Cloud: Governance (votación en propuestas), staking (generar recompensas), fees (descuentos en transacciones), acceso premium a funcionalidades. Commands: 'Nuvos Cloud token utility'.",
    metadata: { type: "tokenization", category: "utility", topic: "token-use-cases" }
  },
  {
    content: "NFT fractionalization in Nuvos Cloud: High-value NFTs can be fractionalized into multiple ERC-20 tokens, enabling shared ownership and greater liquidity. / Fraccionamiento de NFTs en Nuvos Cloud: Los NFTs de alto valor pueden fraccionarse en múltiples tokens ERC-20, permitiendo propiedad compartida y mayor liquidez. Commands: 'Nuvos Cloud fractionalization'.",
    metadata: { type: "tokenization", category: "nft", topic: "fractionalization" }
  },

  // === SECURITY ===
  {
    content: "Security audits in Nuvos Cloud: All contracts have been audited by recognized firms. Reports available in official documentation. / Auditorías de seguridad en Nuvos Cloud: Todos los contratos han sido auditados por firmas reconocidas. Reportes disponibles en la documentación oficial. Commands: 'Nuvos Cloud audits'.",
    metadata: { type: "security", category: "audits", topic: "smart-contract-security" }
  },
  {
    content: "Security best practices in Nuvos Cloud: Use hardware wallets, verify contract addresses, don't share private keys, keep software updated. / Mejores prácticas de seguridad en Nuvos Cloud: Usa wallets hardware, verifica direcciones de contratos, no compartas claves privadas, mantén software actualizado. Commands: 'Nuvos Cloud security best practices'.",
    metadata: { type: "security", category: "best-practices", topic: "user-security" }
  },
  {
    content: "MEV protection in Nuvos Cloud: We implement protections against Maximum Extractable Value to protect users from front-running and sandwich attacks. / Protección contra MEV en Nuvos Cloud: Implementamos protecciones contra Maximum Extractable Value para proteger a los usuarios de front-running y sandwich attacks. Commands: 'Nuvos Cloud MEV protection'.",
    metadata: { type: "security", category: "mev-protection", topic: "transaction-security" }
  },

  // === ROADMAP ===
  {
    content: "Q1 2024 Nuvos Cloud: Launch of Smart Staking v2.0, integration with more wallets, marketplace UI/UX improvements. / Q1 2024 Nuvos Cloud: Lanzamiento de Smart Staking v2.0, integración con más wallets, mejoras en UI/UX del marketplace. Commands: 'Nuvos Cloud roadmap Q1 2024'.",
    metadata: { type: "roadmap", category: "q1-2024", topic: "upcoming-features" }
  },
  {
    content: "Q2 2024 Nuvos Cloud: Implementation of decentralized governance, mobile app launch, Layer 2 solutions integration. / Q2 2024 Nuvos Cloud: Implementación de governance descentralizada, lanzamiento de mobile app, integración con Layer 2 solutions. Commands: 'Nuvos Cloud roadmap Q2 2024'.",
    metadata: { type: "roadmap", category: "q2-2024", topic: "governance-mobile" }
  },
  {
    content: "Q3-Q4 2024 Nuvos Cloud: Multi-chain expansion, strategic partnerships, advanced DeFi functionalities, real asset tokenization. / Q3-Q4 2024 Nuvos Cloud: Expansión multi-chain, partnerships estratégicos, funcionalidades avanzadas de DeFi, tokenización de activos reales. Commands: 'Nuvos Cloud roadmap H2 2024'.",
    metadata: { type: "roadmap", category: "h2-2024", topic: "expansion-defi" }
  }
];

/**
 * Función para inicializar automáticamente la base de conocimientos al arrancar el servidor
 */
export async function initializeKnowledgeBaseOnStartup() {
  try {
    console.log('🚀 Inicializando base de conocimientos automáticamente...');
    console.log('📚 Inicializando base de conocimientos con contenido bilingüe y referencias POL...');
    
    // Inicializar el índice con los documentos
    const result = await embeddingsService.upsertIndex('knowledge_base', knowledgeBase.map(doc => ({
      text: doc.content,
      meta: doc.metadata
    })));

    console.log(`✅ Base de conocimientos inicializada: ${knowledgeBase.length} documentos indexados`);
    console.log('📊 Categorías disponibles:', [...new Set(knowledgeBase.map(d => d.metadata.type))]);
    
    // Mostrar estadísticas detalladas
    const categoryStats = {};
    knowledgeBase.forEach(doc => {
      const category = doc.metadata.type;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log('📈 Distribución por categorías:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} documentos`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando base de conocimientos:', error.message);
    // No lanzar error para no interrumpir el arranque del servidor
  }
}