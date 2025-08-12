/**
 * Servicio de Streaming Semántico Avanzado
 * Implementa chunking semántico, pausas contextuales y velocidad variable
 */

class SemanticStreamingService {
  constructor() {
    this.patterns = {
      // Patrones para detectar diferentes tipos de contenido
      sentences: /[.!?]+\s+/g,
      codeBlocks: /```[\s\S]*?```/g,
      inlineCode: /`[^`]+`/g,
      formulas: /\$[^$]+\$/g,
      lists: /^\s*[-*+]\s+.+$/gm,
      headers: /^#{1,6}\s+.+$/gm,
      complexConcepts: /\b(algorithm|function|class|interface|implementation|architecture|optimization|performance|security|authentication|authorization|encryption|database|transaction|asynchronous|synchronous|paradigm|methodology|framework|library|dependency|configuration|deployment|scalability|maintainability|refactoring|debugging|testing|integration|abstraction|encapsulation|inheritance|polymorphism|composition|aggregation|association|coupling|cohesion|modularity|extensibility|reusability|portability|reliability|availability|consistency|integrity|durability|atomicity|isolation|concurrency|parallelism|distributed|microservices|monolithic|serverless|containerization|virtualization|orchestration|automation|continuous|pipeline|workflow|monitoring|logging|metrics|analytics|machine learning|artificial intelligence|neural network|deep learning|natural language processing|computer vision|data science|big data|blockchain|cryptocurrency|quantum computing|cloud computing|edge computing|internet of things|augmented reality|virtual reality|cybersecurity|penetration testing|vulnerability|exploit|malware|phishing|social engineering|compliance|governance|risk management|business intelligence|data warehouse|data lake|extract transform load|application programming interface|representational state transfer|graphql|websocket|http|tcp|udp|dns|ssl|tls|oauth|jwt|cors|csrf|xss|sql injection|nosql|relational database|document database|key value store|graph database|time series database|search engine|message queue|event streaming|publish subscribe|request response|client server|peer to peer|load balancing|caching|content delivery network|reverse proxy|firewall|intrusion detection|intrusion prevention|single sign on|multi factor authentication|role based access control|attribute based access control|zero trust|defense in depth|least privilege|separation of duties|fail safe|fail secure|redundancy|fault tolerance|disaster recovery|business continuity|service level agreement|key performance indicator|return on investment|total cost of ownership|proof of concept|minimum viable product|agile|scrum|kanban|devops|site reliability engineering|infrastructure as code|configuration management|version control|code review|pair programming|test driven development|behavior driven development|domain driven design|event driven architecture|service oriented architecture|representational state transfer|microservices architecture|serverless architecture|event sourcing|command query responsibility segregation|hexagonal architecture|clean architecture|onion architecture|layered architecture|model view controller|model view presenter|model view viewmodel|observer pattern|strategy pattern|factory pattern|singleton pattern|adapter pattern|decorator pattern|facade pattern|proxy pattern|command pattern|state pattern|template method pattern|visitor pattern|iterator pattern|composite pattern|bridge pattern|flyweight pattern|chain of responsibility pattern|mediator pattern|memento pattern|prototype pattern|builder pattern|abstract factory pattern|dependency injection|inversion of control|aspect oriented programming|functional programming|object oriented programming|procedural programming|declarative programming|imperative programming|reactive programming|event driven programming|data driven programming|test driven development|behavior driven development|domain driven design|feature driven development|extreme programming|lean software development|rapid application development|spiral model|waterfall model|v model|incremental model|iterative model|prototype model|rad model|agile model|scrum framework|kanban method|lean startup|design thinking|user experience|user interface|human computer interaction|accessibility|internationalization|localization|responsive design|progressive web application|single page application|server side rendering|client side rendering|static site generation|jamstack|headless cms|content management system|customer relationship management|enterprise resource planning|supply chain management|business process management|workflow management|project management|knowledge management|document management|digital asset management|web content management|learning management system|human resource management|financial management|inventory management|quality management|risk management|compliance management|governance risk compliance|information technology infrastructure library|control objectives for information technologies|payment card industry data security standard|general data protection regulation|health insurance portability accountability act|sarbanes oxley act|federal information security management act|national institute standards technology|international organization standardization|institute electrical electronics engineers|internet engineering task force|world wide web consortium|open web application security project|sans institute|mitre corporation|common vulnerabilities exposures|common vulnerability scoring system|national vulnerability database|computer emergency response team|information sharing analysis center|cybersecurity information sharing act|cybersecurity framework|zero trust architecture|secure development lifecycle|threat modeling|penetration testing|vulnerability assessment|security audit|compliance audit|risk assessment|business impact analysis|disaster recovery planning|business continuity planning|incident response planning|crisis management|change management|configuration management|asset management|vendor management|third party risk management|supply chain risk management|operational risk management|financial risk management|strategic risk management|reputational risk management|legal risk management|regulatory risk management)\b/gi
    };
    
    this.timings = {
      // Configuraciones de timing para diferentes tipos de contenido
      simple: { chunkDelay: 15, sentenceDelay: 50 },
      complex: { chunkDelay: 25, sentenceDelay: 150 },
      code: { chunkDelay: 30, sentenceDelay: 100 },
      formula: { chunkDelay: 40, sentenceDelay: 200 },
      list: { chunkDelay: 20, sentenceDelay: 80 },
      header: { chunkDelay: 10, sentenceDelay: 120 }
    };
  }

  /**
   * Analiza el contenido y determina su complejidad
   */
  analyzeContent(text) {
    const analysis = {
      totalLength: text.length,
      sentences: (text.match(this.patterns.sentences) || []).length,
      codeBlocks: (text.match(this.patterns.codeBlocks) || []).length,
      inlineCode: (text.match(this.patterns.inlineCode) || []).length,
      formulas: (text.match(this.patterns.formulas) || []).length,
      lists: (text.match(this.patterns.lists) || []).length,
      headers: (text.match(this.patterns.headers) || []).length,
      complexConcepts: (text.match(this.patterns.complexConcepts) || []).length,
      complexity: 'simple'
    };

    // Determinar complejidad general
    const complexityScore = 
      (analysis.codeBlocks * 3) +
      (analysis.formulas * 2) +
      (analysis.complexConcepts * 1.5) +
      (analysis.inlineCode * 0.5);

    if (complexityScore > 10) {
      analysis.complexity = 'high';
    } else if (complexityScore > 5) {
      analysis.complexity = 'medium';
    }

    return analysis;
  }

  /**
   * Divide el texto en chunks semánticos
   */
  createSemanticChunks(text) {
    const chunks = [];
    let currentChunk = '';
    let currentType = 'simple';
    let position = 0;

    // Procesar bloques de código primero
    const codeBlocks = [];
    text = text.replace(this.patterns.codeBlocks, (match, offset) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({ content: match, offset, type: 'code' });
      return placeholder;
    });

    // Dividir por oraciones
    const sentences = text.split(this.patterns.sentences);
    
    sentences.forEach((sentence, index) => {
      if (!sentence.trim()) return;

      // Restaurar bloques de código
      let processedSentence = sentence;
      codeBlocks.forEach((block, blockIndex) => {
        processedSentence = processedSentence.replace(
          `__CODE_BLOCK_${blockIndex}__`,
          block.content
        );
      });

      // Determinar tipo de contenido
      const sentenceType = this.determineSentenceType(processedSentence);
      
      // Si cambia el tipo o el chunk es muy largo, crear nuevo chunk
      if (sentenceType !== currentType || currentChunk.length > 200) {
        if (currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            type: currentType,
            position: position,
            timing: this.timings[currentType] || this.timings.simple
          });
          position += currentChunk.length;
        }
        currentChunk = processedSentence;
        currentType = sentenceType;
      } else {
        currentChunk += ' ' + processedSentence;
      }
    });

    // Agregar último chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        type: currentType,
        position: position,
        timing: this.timings[currentType] || this.timings.simple
      });
    }

    return chunks;
  }

  /**
   * Determina el tipo de una oración
   */
  determineSentenceType(sentence) {
    if (this.patterns.codeBlocks.test(sentence) || this.patterns.inlineCode.test(sentence)) {
      return 'code';
    }
    if (this.patterns.formulas.test(sentence)) {
      return 'formula';
    }
    if (this.patterns.headers.test(sentence)) {
      return 'header';
    }
    if (this.patterns.lists.test(sentence)) {
      return 'list';
    }
    if (this.patterns.complexConcepts.test(sentence)) {
      return 'complex';
    }
    return 'simple';
  }

  /**
   * Calcula pausas contextuales basadas en el contenido
   */
  calculateContextualPause(chunk, nextChunk) {
    let basePause = chunk.timing.sentenceDelay;

    // Pausas adicionales según transiciones
    if (chunk.type === 'complex' && nextChunk?.type !== 'complex') {
      basePause += 100; // Pausa después de conceptos complejos
    }
    
    if (chunk.type === 'code' && nextChunk?.type !== 'code') {
      basePause += 80; // Pausa después de código
    }

    if (chunk.type === 'formula') {
      basePause += 150; // Pausa extra para fórmulas
    }

    if (chunk.content.includes('\n\n')) {
      basePause += 200; // Pausa para párrafos
    }

    return Math.min(basePause, 500); // Máximo 500ms
  }

  /**
   * Stream semántico principal
   */
  async streamSemanticContent(res, text, options = {}) {
    const {
      enableSemanticChunking = true,
      enableContextualPauses = true,
      enableVariableSpeed = true,
      clientInfo = {}
    } = options;

    // Configurar headers optimizados
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Semantic-Streaming', 'enabled');

    try {
      if (!enableSemanticChunking) {
        // Fallback a streaming tradicional
        return this.streamTraditional(res, text, options);
      }

      // Analizar contenido
      const analysis = this.analyzeContent(text);
      res.setHeader('X-Content-Analysis', JSON.stringify(analysis));

      // Crear chunks semánticos
      const chunks = this.createSemanticChunks(text);
      
      // Enviar indicador de inicio
      res.write('\n[STREAMING_START]\n');
      await this.delay(50);

      // Procesar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const nextChunk = chunks[i + 1];

        // Verificar conexión
        if (res.destroyed || res.writableEnded) {
          break;
        }

        // Enviar metadata del chunk
        const chunkMetadata = {
          type: chunk.type,
          position: i + 1,
          total: chunks.length,
          complexity: analysis.complexity
        };
        
        res.write(`\n[CHUNK_META:${JSON.stringify(chunkMetadata)}]\n`);
        await this.delay(10);

        // Stream del contenido del chunk con velocidad variable
        await this.streamChunkContent(res, chunk, enableVariableSpeed);

        // Pausa contextual
        if (enableContextualPauses && nextChunk) {
          const pauseDuration = this.calculateContextualPause(chunk, nextChunk);
          await this.delay(pauseDuration);
        }
      }

      // Indicador de finalización
      res.write('\n[STREAMING_END]\n');
      res.end();

    } catch (error) {
      console.error('Error in semantic streaming:', error);
      if (!res.destroyed) {
        res.write(`\n[ERROR:${error.message}]\n`);
        res.end();
      }
    }
  }

  /**
   * Stream del contenido de un chunk con velocidad variable
   */
  async streamChunkContent(res, chunk, enableVariableSpeed) {
    const content = chunk.content;
    const timing = chunk.timing;
    
    if (!enableVariableSpeed) {
      res.write(content);
      return;
    }

    // Streaming carácter por carácter con timing adaptativo
    for (let i = 0; i < content.length; i++) {
      if (res.destroyed || res.writableEnded) break;
      
      const char = content[i];
      res.write(char);
      
      // Pausas especiales en puntuación
      if (/[.!?]/.test(char)) {
        await this.delay(timing.sentenceDelay * 0.3);
      } else if (/[,;:]/.test(char)) {
        await this.delay(timing.chunkDelay * 0.5);
      } else {
        await this.delay(timing.chunkDelay);
      }
    }
  }

  /**
   * Streaming tradicional como fallback
   */
  async streamTraditional(res, text, options) {
    const chunkSize = options.chunkSize || 15;
    const delayMs = options.delayMs || 20;

    for (let i = 0; i < text.length; i += chunkSize) {
      if (res.destroyed || res.writableEnded) break;
      
      const chunk = text.slice(i, i + chunkSize);
      res.write(chunk);
      await this.delay(delayMs);
    }
    
    res.end();
  }

  /**
   * Utilidad para delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      service: 'SemanticStreamingService',
      version: '1.0.0',
      features: {
        semanticChunking: true,
        contextualPauses: true,
        variableSpeed: true,
        contentAnalysis: true
      },
      supportedTypes: Object.keys(this.timings)
    };
  }
}

export default new SemanticStreamingService();