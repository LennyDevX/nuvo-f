import embeddingsService from './embeddings-service.js';

/**
 * Base de conocimientos limpia con contenido bilingüe
 */
export const knowledgeBase = [
  // === INFORMACIÓN GENERAL ===
  {
    content: "Nuvos Cloud is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. The platform includes Smart Staking contracts, NFT marketplace, AI-powered chat (Nuvim AI 1.0), and tokenization tools. / Nuvos Cloud es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización. Es un ecosistema completo para la gestión de activos digitales y generación de ingresos pasivos. La plataforma incluye contratos Smart Staking, marketplace de NFTs, chat con IA (Nuvim AI 1.0), y herramientas de tokenización. Commands: 'Nuvos Cloud', 'Nuvos Cloud platform', 'Nuvos Cloud general'.",
    metadata: { type: "general", category: "platform", topic: "overview" }
  },
  {
    content: "Nuvos Cloud uses advanced blockchain technology with audited smart contracts to ensure maximum security, transparency and decentralization in all operations. Built on Polygon network with ReentrancyGuard, Pausable, AccessControl, ERC721, and ERC2981 standards for maximum security. / Nuvos Cloud utiliza tecnología blockchain avanzada con contratos inteligentes auditados para garantizar máxima seguridad, transparencia y descentralización en todas las operaciones. Construido en la red Polygon con estándares ReentrancyGuard, Pausable, AccessControl, ERC721, y ERC2981 para máxima seguridad. Commands: 'Nuvos Cloud technology', 'Nuvos Cloud blockchain', 'Nuvos Cloud security'.",
    metadata: { type: "general", category: "technology", topic: "blockchain" }
  },
  {
    content: "Nuvim AI 1.0 is the first stable version of the AI chat integrated into Nuvos Cloud platform. It provides complete platform integration, allowing users to ask questions about staking, marketplace, NFTs, airdrops, and all platform features. The AI uses Gemini models and supports multimodal interactions including text and images. / Nuvim AI 1.0 es la primera versión estable del chat con IA integrado en la plataforma Nuvos Cloud. Proporciona integración completa con la plataforma, permitiendo a los usuarios hacer preguntas sobre staking, marketplace, NFTs, airdrops, y todas las funcionalidades de la plataforma. La IA usa modelos Gemini y soporta interacciones multimodales incluyendo texto e imágenes. Commands: 'Nuvim AI', 'Nuvos Cloud AI', 'Nuvos Cloud chat'.",
    metadata: { type: "general", category: "ai", topic: "nuvim-ai" }
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuvos Cloud SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Main functions include: deposit() for staking tokens, withdraw() for partial withdrawals, withdrawAll() for complete withdrawal, calculateRewards() for checking pending rewards, claimRewards() for claiming only rewards, compound() for reinvesting rewards, and emergencyWithdraw() for emergency situations. / El contrato SmartStaking de Nuvos Cloud permite a los usuarios depositar tokens POL y ganar recompensas automáticas. Las funciones principales incluyen: deposit() para hacer staking, withdraw() para retiros parciales, withdrawAll() para retiro completo, calculateRewards() para verificar recompensas pendientes, claimRewards() para reclamar solo recompensas, compound() para reinvertir recompensas, y emergencyWithdraw() para situaciones de emergencia. Commands: 'Nuvos Cloud smart contract', 'Nuvos Cloud SmartStaking', 'Nuvos Cloud functions'.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" }
  },
  {
    content: "Nuvos Cloud SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL per deposit. Maximum 300 deposits per user. Daily withdrawal limit exists for security. The contract includes custom errors like AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable for better error handling. / SmartStaking de Nuvos Cloud tiene límites de depósito: mínimo 5 POL y máximo 10000 POL por depósito. Máximo 300 depósitos por usuario. Existe límite de retiro diario por seguridad. El contrato incluye errores personalizados como AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable para mejor manejo de errores. Commands: 'Nuvos Cloud limits', 'Nuvos Cloud deposit minimum', 'Nuvos Cloud errors'.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" }
  },
  {
    content: "Nuvos Cloud SmartStaking reward calculation: Uses hourly ROI of 0.01% (0.0001) with compound interest. Maximum ROI multiplier is 1.25 (25% max return). Rewards are calculated in real-time and can be claimed or compounded at any time. The contract tracks pendingRewards and totalRewards for each user. / Cálculo de recompensas en SmartStaking de Nuvos Cloud: Usa ROI por hora de 0.01% (0.0001) con interés compuesto. El multiplicador máximo de ROI es 1.25 (25% retorno máximo). Las recompensas se calculan en tiempo real y pueden reclamarse o reinvertirse en cualquier momento. El contrato rastrea pendingRewards y totalRewards para cada usuario. Commands: 'Nuvos Cloud rewards calculation', 'Nuvos Cloud ROI', 'Nuvos Cloud compound'.",
    metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" }
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
    content: "Nuvos Cloud NFT marketplace allows users to buy, sell and trade NFTs. Supports ERC-721 tokens with metadata display, filtering options, and advanced search. Features include: listing NFTs for sale, purchasing NFTs with POL tokens, viewing detailed NFT information with rarity and traits, marketplace statistics and analytics, collection browsing, and price history tracking. The marketplace integrates with Alchemy and Moralis APIs for comprehensive NFT data. / El marketplace de NFT de Nuvos Cloud permite a los usuarios comprar, vender e intercambiar NFTs. Soporta tokens ERC-721 con visualización de metadatos, opciones de filtrado y búsqueda avanzada. Las características incluyen: listar NFTs para venta, comprar NFTs con tokens POL, ver información detallada de NFTs con rareza y características, estadísticas y análisis del marketplace, navegación de colecciones, y seguimiento del historial de precios. El marketplace se integra con las APIs de Alchemy y Moralis para datos completos de NFTs. Commands: 'Nuvos Cloud marketplace', 'Nuvos Cloud NFT', 'Nuvos Cloud buy NFT', 'Nuvos Cloud sell NFT'.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" }
  },
  {
    content: "Nuvos Cloud marketplace features advanced filtering and search capabilities. Users can filter NFTs by: collection, price range, rarity, traits/attributes, listing status (for sale, sold, not listed), and creation date. The marketplace dashboard shows real-time statistics including total volume, floor prices, trending collections, and recent sales. Caching system ensures fast loading of NFT metadata and images. / El marketplace de Nuvos Cloud cuenta con capacidades avanzadas de filtrado y búsqueda. Los usuarios pueden filtrar NFTs por: colección, rango de precios, rareza, características/atributos, estado de listado (en venta, vendido, no listado), y fecha de creación. El dashboard del marketplace muestra estadísticas en tiempo real incluyendo volumen total, precios mínimos, colecciones en tendencia, y ventas recientes. El sistema de caché asegura carga rápida de metadatos e imágenes de NFTs. Commands: 'Nuvos Cloud marketplace filters', 'Nuvos Cloud NFT search', 'Nuvos Cloud marketplace stats'.",
    metadata: { type: "marketplace", category: "nft", topic: "features" }
  },
  {
    content: "Nuvos Cloud marketplace roadmap includes exciting updates: NFT Marketplace Preview in June 2025, and Marketplace Contracts v2.0 in July 2025 with enhanced features like auction systems, royalty management, and cross-chain compatibility. The marketplace will support multiple blockchain networks and advanced trading mechanisms. / La hoja de ruta del marketplace de Nuvos Cloud incluye actualizaciones emocionantes: Vista previa del Marketplace NFT en junio de 2025, y Contratos del Marketplace v2.0 en julio de 2025 con características mejoradas como sistemas de subasta, gestión de regalías, y compatibilidad entre cadenas. El marketplace soportará múltiples redes blockchain y mecanismos de trading avanzados. Commands: 'Nuvos Cloud marketplace roadmap', 'Nuvos Cloud marketplace v2', 'Nuvos Cloud marketplace future'.",
    metadata: { type: "marketplace", category: "nft", topic: "roadmap" }
  },
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
    content: "Nuvos Cloud airdrops reward early adopters and active users. Eligibility based on wallet activity, staking participation, platform engagement, and holding specific NFTs. Current upcoming airdrops include: NUVO Token Pre-Launch (Q2 2025) for early platform users with enhanced staking rewards, and Governance NFT airdrop for active community members with voting rights and exclusive access. Registration is required through the Airdrops Dashboard. / Los airdrops de Nuvos Cloud recompensan a los primeros adoptantes y usuarios activos. Elegibilidad basada en actividad de wallet, participación en staking, compromiso con la plataforma, y posesión de NFTs específicos. Los próximos airdrops incluyen: NUVO Token Pre-Launch (Q2 2025) para usuarios tempranos de la plataforma con recompensas de staking mejoradas, y airdrop de NFT de Gobernanza para miembros activos de la comunidad con derechos de voto y acceso exclusivo. Se requiere registro a través del Dashboard de Airdrops. Commands: 'Nuvos Cloud airdrop', 'Nuvos Cloud rewards', 'Nuvos Cloud NUVO token', 'Nuvos Cloud governance NFT'.",
    metadata: { type: "airdrop", category: "rewards", topic: "eligibility" }
  },
  {
    content: "Nuvos Cloud airdrop system includes multiple distribution mechanisms: automatic airdrops for eligible users, manual claim processes through the dashboard, and time-limited campaigns. The Airdrop contract handles secure token distribution with functions like claimAirdrop(), checkEligibility(), and getAirdropInfo(). Users can track their airdrop history and upcoming eligibility through their profile dashboard. / El sistema de airdrops de Nuvos Cloud incluye múltiples mecanismos de distribución: airdrops automáticos para usuarios elegibles, procesos de reclamación manual a través del dashboard, y campañas con tiempo limitado. El contrato de Airdrop maneja la distribución segura de tokens con funciones como claimAirdrop(), checkEligibility(), y getAirdropInfo(). Los usuarios pueden rastrear su historial de airdrops y próxima elegibilidad a través de su dashboard de perfil. Commands: 'Nuvos Cloud airdrop claim', 'Nuvos Cloud airdrop contract', 'Nuvos Cloud airdrop history'.",
    metadata: { type: "airdrop", category: "system", topic: "distribution" }
  },
  {
    content: "To participate in Nuvos Cloud airdrops: 1) Keep POL in staking, 2) Participate in community, 3) Own Nuvos Cloud NFTs, 4) Keep wallet connected during snapshots. / Para participar en airdrops de Nuvos Cloud: 1) Mantén POL en staking, 2) Participa en la comunidad, 3) Posee NFTs de Nuvos Cloud, 4) Mantén wallet conectada durante snapshots. Commands: 'Nuvos Cloud participate airdrop'.",
    metadata: { type: "airdrop", category: "tutorial", topic: "participation" }
  },
  {
    content: "Nuvos Cloud airdrops are announced on Discord, Twitter and the platform. Snapshots are taken on specific dates and tokens are distributed automatically. / Los airdrops de Nuvos Cloud se anuncian en Discord, Twitter y la plataforma. Los snapshots se toman en fechas específicas y los tokens se distribuyen automáticamente. Commands: 'Nuvos Cloud airdrop announcements'.",
    metadata: { type: "airdrop", category: "process", topic: "distribution" }
  },

  // === TOKENIZATION TOOLS ===
  {
    content: "Nuvos Cloud provides comprehensive tokenization tools for creating and managing digital assets. Features include: ERC-20 token creation with customizable parameters, ERC-721 NFT minting with metadata management, batch minting capabilities, royalty settings for creators, and whitelist management for exclusive launches. The tokenization section offers step-by-step guides and templates for different token types. Integration with IPFS for decentralized metadata storage. / Nuvos Cloud proporciona herramientas completas de tokenización para crear y gestionar activos digitales. Las características incluyen: creación de tokens ERC-20 con parámetros personalizables, acuñación de NFTs ERC-721 con gestión de metadatos, capacidades de acuñación por lotes, configuración de regalías para creadores, y gestión de listas blancas para lanzamientos exclusivos. La sección de tokenización ofrece guías paso a paso y plantillas para diferentes tipos de tokens. Integración con IPFS para almacenamiento descentralizado de metadatos. Commands: 'Nuvos Cloud tokenization', 'Nuvos Cloud create token', 'Nuvos Cloud mint NFT', 'Nuvos Cloud whitelist'.",
    metadata: { type: "tokenization", category: "tools", topic: "overview" }
  },
  {
    content: "Nuvos Cloud roadmap spans from 2024 to 2025 with major milestones: Foundation Phase (Q1 2024) - Smart Staking Contract v1 deployment, Development Phase (Q2-Q3 2024) - Alpha v1.0 Platform Release, Launch Phase (Q4 2024) - Beta Platform Launch, Initial Phase (Q1 2025) - Smart Staking 1.0 launch, Innovation Phase (Q2 2025) - NFT Dashboard and Gemini AI Chatbot integration. Future plans include marketplace v2.0, governance token launch, and cross-chain expansion. / La hoja de ruta de Nuvos Cloud abarca desde 2024 hasta 2025 con hitos importantes: Fase de Fundación (Q1 2024) - Despliegue del Contrato Smart Staking v1, Fase de Desarrollo (Q2-Q3 2024) - Lanzamiento de la Plataforma Alpha v1.0, Fase de Lanzamiento (Q4 2024) - Lanzamiento de la Plataforma Beta, Fase Inicial (Q1 2025) - Lanzamiento de Smart Staking 1.0, Fase de Innovación (Q2 2025) - Integración del Dashboard NFT y Chatbot Gemini AI. Los planes futuros incluyen marketplace v2.0, lanzamiento del token de gobernanza, y expansión entre cadenas. Commands: 'Nuvos Cloud roadmap', 'Nuvos Cloud timeline', 'Nuvos Cloud future plans'.",
    metadata: { type: "general", category: "roadmap", topic: "timeline" }
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuvos Cloud platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL for gas fees in transactions. The platform uses secure RPC endpoints and implements best practices for wallet security including transaction signing and approval flows. ENS (Ethereum Name Service) is supported for user-friendly addresses. / La plataforma Nuvos Cloud soporta wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Asegúrate de tener POL para gas fees en transacciones. La plataforma usa endpoints RPC seguros e implementa mejores prácticas para seguridad de wallets incluyendo flujos de firma y aprobación de transacciones. ENS (Ethereum Name Service) es soportado para direcciones amigables al usuario. Commands: 'Nuvos Cloud wallets', 'Nuvos Cloud ENS'.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" }
  },
  {
    content: "Gas fees in Nuvos Cloud are optimized on Polygon network with average transaction costs under $0.01. Fees vary according to network congestion: ~1-30 gwei for normal transactions. The platform implements gas optimization techniques including batch transactions and efficient contract calls. Use tools like Polygon Gas Station to monitor current rates. Emergency functions may have higher gas costs due to additional security checks. / Gas fees en Nuvos Cloud están optimizados en la red Polygon con costos promedio de transacción bajo $0.01. Las tarifas varían según la congestión de la red: ~1-30 gwei para transacciones normales. La plataforma implementa técnicas de optimización de gas incluyendo transacciones por lotes y llamadas eficientes a contratos. Usa herramientas como Polygon Gas Station para monitorear las tarifas actuales. Las funciones de emergencia pueden tener costos de gas más altos debido a verificaciones de seguridad adicionales. Commands: 'Nuvos Cloud gas fees', 'Nuvos Cloud gas optimization'.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" }
  },
  {
    content: "Nuvos Cloud uses smart contracts on Polygon with the following features: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 for maximum security. / Nuvos Cloud utiliza contratos inteligentes en Polygon con las siguientes características: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 para máxima seguridad. Commands: 'Nuvos Cloud technical'.",
    metadata: { type: "technical", category: "security", topic: "smart-contracts" }
  },
  {
    content: "Nuvos Cloud contracts are verified on Polygonscan for full transparency. SmartStaking handles deposits/withdrawals with automatic reward calculations, Marketplace handles NFT trading with offer systems. Both contracts include emergency functions and are protected with ReentrancyGuard, Pausable, and AccessControl patterns. Contract addresses and ABIs are publicly available for developers. / Los contratos de Nuvos Cloud están verificados en Polygonscan para total transparencia. SmartStaking maneja depósitos/retiros con cálculos automáticos de recompensas, Marketplace maneja trading de NFTs con sistemas de ofertas. Ambos contratos incluyen funciones de emergencia y están protegidos con patrones ReentrancyGuard, Pausable, y AccessControl. Las direcciones de contratos y ABIs están disponibles públicamente para desarrolladores. Commands: 'Nuvos Cloud Polygonscan', 'Nuvos Cloud contract addresses', 'Nuvos Cloud ABI'.",
    metadata: { type: "technical", category: "contracts", topic: "verification" }
  },
  {
    content: "Nuvos Cloud integrates with multiple external APIs and services: Alchemy API for comprehensive NFT data and metadata, Moralis API for blockchain analytics, IPFS for decentralized storage of NFT metadata and images, Google Gemini AI for intelligent chat responses, and Polygon Gas Station for real-time gas price optimization. The platform uses caching mechanisms to ensure fast response times and reduce API costs. / Nuvos Cloud se integra con múltiples APIs y servicios externos: API de Alchemy para datos completos de NFTs y metadatos, API de Moralis para análisis de blockchain, IPFS para almacenamiento descentralizado de metadatos e imágenes de NFTs, Google Gemini AI para respuestas inteligentes de chat, y Polygon Gas Station para optimización de precios de gas en tiempo real. La plataforma usa mecanismos de caché para asegurar tiempos de respuesta rápidos y reducir costos de API. Commands: 'Nuvos Cloud APIs', 'Nuvos Cloud integrations', 'Nuvos Cloud IPFS', 'Nuvos Cloud Alchemy'.",
    metadata: { type: "technical", category: "integrations", topic: "external-apis" }
  },

  // === FAQ ===
  {
    content: "What if my transaction fails in Nuvos Cloud? Check: sufficient POL for gas, wallet connected, limits not exceeded, contract not paused. Try increasing gas limit. Common errors include 'insufficient funds', 'execution reverted', or 'user rejected transaction'. For persistent issues, check Polygonscan for detailed error messages. / ¿Qué pasa si mi transacción falla en Nuvos Cloud? Verifica: suficiente POL para gas, wallet conectada, límites no excedidos, contrato no pausado. Intenta aumentar gas limit. Errores comunes incluyen 'insufficient funds', 'execution reverted', o 'user rejected transaction'. Para problemas persistentes, verifica Polygonscan para mensajes de error detallados. Commands: 'Nuvos Cloud transaction fails', 'Nuvos Cloud troubleshooting'.",
    metadata: { type: "faq", category: "troubleshooting", topic: "transactions" }
  },
  {
    content: "How to maximize staking rewards in Nuvos Cloud? 1) Stake larger amounts for better compound effects, 2) Use compound function regularly to reinvest rewards, 3) Keep funds staked longer for maximum ROI multiplier (up to 1.25x), 4) Monitor gas fees and compound during low-cost periods. The hourly ROI of 0.01% compounds over time for significant returns. / ¿Cómo maximizar las recompensas de staking en Nuvos Cloud? 1) Haz staking de cantidades mayores para mejores efectos de interés compuesto, 2) Usa la función compound regularmente para reinvertir recompensas, 3) Mantén fondos en staking por más tiempo para el multiplicador máximo de ROI (hasta 1.25x), 4) Monitorea las tarifas de gas y haz compound durante períodos de bajo costo. El ROI por hora de 0.01% se compone con el tiempo para retornos significativos. Commands: 'Nuvos Cloud maximize rewards', 'Nuvos Cloud staking tips'.",
    metadata: { type: "faq", category: "optimization", topic: "staking-rewards" }
  },
  {
    content: "How to buy and sell NFTs on Nuvos Cloud marketplace? To buy: 1) Browse marketplace or use filters, 2) Click on desired NFT, 3) Review details and price, 4) Click 'Buy Now' and confirm transaction. To sell: 1) Go to your profile/NFTs section, 2) Select NFT to list, 3) Set price in POL, 4) Confirm listing transaction. You can also make offers on unlisted NFTs or accept offers on your NFTs. / ¿Cómo comprar y vender NFTs en el marketplace de Nuvos Cloud? Para comprar: 1) Navega el marketplace o usa filtros, 2) Haz clic en el NFT deseado, 3) Revisa detalles y precio, 4) Haz clic en 'Buy Now' y confirma la transacción. Para vender: 1) Ve a tu perfil/sección de NFTs, 2) Selecciona NFT para listar, 3) Establece precio en POL, 4) Confirma transacción de listado. También puedes hacer ofertas en NFTs no listados o aceptar ofertas en tus NFTs. Commands: 'Nuvos Cloud buy NFT', 'Nuvos Cloud sell NFT', 'Nuvos Cloud NFT offers'.",
    metadata: { type: "faq", category: "tutorial", topic: "nft-trading" }
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
  },

  // === ADVANCED USE CASES ===
  {
    content: "Advanced Nuvos Cloud strategies: 1) Portfolio diversification - combine staking, NFT investments, and airdrop participation, 2) Yield optimization - time compound operations with gas costs, 3) NFT flipping - use marketplace analytics to identify undervalued assets, 4) Community engagement - participate in governance discussions for future airdrops, 5) Cross-platform integration - use APIs for external portfolio tracking. / Estrategias avanzadas de Nuvos Cloud: 1) Diversificación de portafolio - combina staking, inversiones en NFTs, y participación en airdrops, 2) Optimización de rendimiento - programa operaciones compound con costos de gas, 3) Trading de NFTs - usa análisis del marketplace para identificar activos subvalorados, 4) Participación comunitaria - participa en discusiones de gobernanza para futuros airdrops, 5) Integración entre plataformas - usa APIs para seguimiento externo de portafolio. Commands: 'Nuvos Cloud advanced strategies', 'Nuvos Cloud portfolio optimization'.",
    metadata: { type: "advanced", category: "strategies", topic: "optimization" }
  },
  {
    content: "Nuvos Cloud developer resources: Smart contract ABIs available for SmartStaking.json, Marketplace.json, and Airdrop.json. Integration examples include Web3 connection, transaction handling, event listening, and error management. The platform supports custom dApp integrations and provides comprehensive documentation for developers building on top of Nuvos Cloud infrastructure. / Recursos para desarrolladores de Nuvos Cloud: ABIs de contratos inteligentes disponibles para SmartStaking.json, Marketplace.json, y Airdrop.json. Ejemplos de integración incluyen conexión Web3, manejo de transacciones, escucha de eventos, y gestión de errores. La plataforma soporta integraciones de dApps personalizadas y proporciona documentación completa para desarrolladores construyendo sobre la infraestructura de Nuvos Cloud. Commands: 'Nuvos Cloud developers', 'Nuvos Cloud API documentation', 'Nuvos Cloud integration'.",
    metadata: { type: "developer", category: "resources", topic: "integration" }
  },

  // === COMMANDS ===
  {
    content: "Available commands for Nuvos Cloud information: 'Nuvos Cloud general', 'Nuvos Cloud staking', 'Nuvos Cloud marketplace', 'Nuvos Cloud airdrop', 'Nuvos Cloud technical', 'Nuvos Cloud help', 'Nuvos Cloud tokenization', 'Nuvos Cloud roadmap', 'Nuvos Cloud AI chat', 'Nuvos Cloud troubleshooting', 'Nuvos Cloud advanced strategies', 'Nuvos Cloud developers'. Use specific topics for detailed information. / Comandos disponibles para información de Nuvos Cloud: 'Nuvos Cloud general', 'Nuvos Cloud staking', 'Nuvos Cloud marketplace', 'Nuvos Cloud airdrop', 'Nuvos Cloud technical', 'Nuvos Cloud help', 'Nuvos Cloud tokenization', 'Nuvos Cloud roadmap', 'Nuvos Cloud AI chat', 'Nuvos Cloud troubleshooting', 'Nuvos Cloud advanced strategies', 'Nuvos Cloud developers'. Usa temas específicos para información detallada. Commands: 'Nuvos Cloud commands'.",
    metadata: { type: "commands", category: "help", topic: "available" }
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