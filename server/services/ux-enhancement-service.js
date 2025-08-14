/**
 * Servicio de Mejoras de UX para Streaming
 * Implementa typing indicators, progress indicators, smooth scrolling y syntax highlighting
 */

class UXEnhancementService {
  constructor() {
    this.activeIndicators = new Map();
    this.progressTrackers = new Map();
    this.syntaxPatterns = {
      javascript: {
        keywords: /\b(const|let|var|function|class|if|else|for|while|return|import|export|async|await|try|catch|finally)\b/g,
        strings: /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g,
        comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
        numbers: /\b\d+(\.\d+)?\b/g,
        operators: /[+\-*/%=<>!&|^~?:]/g
      },
      python: {
        keywords: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|async|await)\b/g,
        strings: /(['"])(?:(?!\1)[^\\]|\\.)*\1|'''[\s\S]*?'''|"""|[\s\S]*?"""/g,
        comments: /#.*$/gm,
        numbers: /\b\d+(\.\d+)?\b/g,
        decorators: /@\w+/g
      },
      css: {
        selectors: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*(?=\s*\{)/g,
        properties: /[a-zA-Z-]+(?=\s*:)/g,
        values: /:\s*([^;\}]+)/g,
        comments: /\/\*[\s\S]*?\*\//g,
        units: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\b/g
      },
      html: {
        tags: /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/g,
        attributes: /\s([a-zA-Z-]+)=/g,
        values: /="([^"]*)"/g,
        comments: /<!--[\s\S]*?-->/g
      },
      json: {
        keys: /"([^"]+)"\s*:/g,
        strings: /"([^"]*)"/g,
        numbers: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g,
        booleans: /\b(true|false|null)\b/g
      }
    };
    
    this.typingStates = {
      THINKING: 'thinking',
      TYPING: 'typing',
      PROCESSING: 'processing',
      STREAMING: 'streaming',
      PAUSED: 'paused',
      COMPLETE: 'complete'
    };
  }

  /**
   * Crea un typing indicator avanzado
   */
  createTypingIndicator(sessionId, options = {}) {
    const {
      type = this.typingStates.THINKING,
      duration = null,
      animated = true,
      showProgress = false,
      customMessage = null
    } = options;

    const indicator = {
      id: sessionId,
      type,
      startTime: Date.now(),
      duration,
      animated,
      showProgress,
      customMessage,
      currentFrame: 0,
      isActive: true
    };

    this.activeIndicators.set(sessionId, indicator);
    return this.generateTypingIndicatorData(indicator);
  }

  /**
   * Actualiza el estado del typing indicator
   */
  updateTypingIndicator(sessionId, newState, options = {}) {
    const indicator = this.activeIndicators.get(sessionId);
    if (!indicator) return null;

    indicator.type = newState;
    indicator.lastUpdate = Date.now();
    
    if (options.progress !== undefined) {
      indicator.progress = options.progress;
    }
    
    if (options.customMessage) {
      indicator.customMessage = options.customMessage;
    }

    return this.generateTypingIndicatorData(indicator);
  }

  /**
   * Genera datos del typing indicator
   */
  generateTypingIndicatorData(indicator) {
    const messages = {
      [this.typingStates.THINKING]: {
        text: indicator.customMessage || 'Pensando...',
        animation: '🤔',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.TYPING]: {
        text: indicator.customMessage || 'Escribiendo respuesta...',
        animation: '✍️',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.PROCESSING]: {
        text: indicator.customMessage || 'Procesando información...',
        animation: '⚙️',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.STREAMING]: {
        text: indicator.customMessage || 'Transmitiendo...',
        animation: '📡',
        dots: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      },
      [this.typingStates.PAUSED]: {
        text: indicator.customMessage || 'En pausa...',
        animation: '⏸️',
        dots: '⠿'
      }
    };

    const messageData = messages[indicator.type] || messages[this.typingStates.THINKING];
    const currentDot = messageData.dots[indicator.currentFrame % messageData.dots.length];
    
    indicator.currentFrame++;

    return {
      sessionId: indicator.id,
      type: 'typing_indicator',
      state: indicator.type,
      message: messageData.text,
      animation: messageData.animation,
      animatedDot: currentDot,
      progress: indicator.progress,
      timestamp: Date.now(),
      isActive: indicator.isActive
    };
  }

  /**
   * Crea un progress indicator
   */
  createProgressIndicator(sessionId, options = {}) {
    const {
      totalSteps = 100,
      currentStep = 0,
      showPercentage = true,
      showETA = true,
      showThroughput = false,
      customLabels = {}
    } = options;

    const tracker = {
      sessionId,
      totalSteps,
      currentStep,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      showPercentage,
      showETA,
      showThroughput,
      customLabels,
      stepHistory: [],
      isComplete: false
    };

    this.progressTrackers.set(sessionId, tracker);
    return this.generateProgressData(tracker);
  }

  /**
   * Actualiza el progress indicator
   */
  updateProgress(sessionId, currentStep, customData = {}) {
    const tracker = this.progressTrackers.get(sessionId);
    if (!tracker) return null;

    const now = Date.now();
    const stepDelta = currentStep - tracker.currentStep;
    const timeDelta = now - tracker.lastUpdate;

    // Actualizar historial para cálculos de velocidad
    tracker.stepHistory.push({
      step: currentStep,
      timestamp: now,
      delta: stepDelta,
      timeDelta
    });

    // Mantener solo los últimos 10 registros
    if (tracker.stepHistory.length > 10) {
      tracker.stepHistory.shift();
    }

    tracker.currentStep = currentStep;
    tracker.lastUpdate = now;
    tracker.isComplete = currentStep >= tracker.totalSteps;

    // Agregar datos personalizados
    Object.assign(tracker, customData);

    return this.generateProgressData(tracker);
  }

  /**
   * Genera datos del progress indicator
   */
  generateProgressData(tracker) {
    const percentage = Math.min(100, Math.round((tracker.currentStep / tracker.totalSteps) * 100));
    const elapsed = Date.now() - tracker.startTime;
    
    // Calcular ETA
    let eta = null;
    if (tracker.showETA && tracker.currentStep > 0 && !tracker.isComplete) {
      const avgTimePerStep = elapsed / tracker.currentStep;
      const remainingSteps = tracker.totalSteps - tracker.currentStep;
      eta = Math.round((remainingSteps * avgTimePerStep) / 1000); // en segundos
    }

    // Calcular throughput
    let throughput = null;
    if (tracker.showThroughput && tracker.stepHistory.length > 1) {
      const recentHistory = tracker.stepHistory.slice(-5);
      const totalSteps = recentHistory.reduce((sum, entry) => sum + entry.delta, 0);
      const totalTime = recentHistory.reduce((sum, entry) => sum + entry.timeDelta, 0);
      throughput = totalTime > 0 ? Math.round((totalSteps / totalTime) * 1000) : 0; // pasos por segundo
    }

    // Generar barra de progreso visual
    const progressBar = this.generateProgressBar(percentage);

    return {
      sessionId: tracker.sessionId,
      type: 'progress_indicator',
      percentage,
      currentStep: tracker.currentStep,
      totalSteps: tracker.totalSteps,
      elapsed: Math.round(elapsed / 1000),
      eta,
      throughput,
      progressBar,
      isComplete: tracker.isComplete,
      customLabels: tracker.customLabels,
      timestamp: Date.now()
    };
  }

  /**
   * Genera barra de progreso visual
   */
  generateProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledChar = '█';
    const emptyChar = '░';
    const partialChars = ['▏', '▎', '▍', '▌', '▋', '▊', '▉'];
    
    let bar = filledChar.repeat(filled);
    
    // Agregar carácter parcial si es necesario
    if (empty > 0 && percentage % (100 / width) !== 0) {
      const partialIndex = Math.floor(((percentage % (100 / width)) / (100 / width)) * partialChars.length);
      bar += partialChars[partialIndex] || emptyChar;
      bar += emptyChar.repeat(empty - 1);
    } else {
      bar += emptyChar.repeat(empty);
    }
    
    return `[${bar}] ${percentage}%`;
  }

  /**
   * Detecta el lenguaje de programación del código
   */
  detectLanguage(code) {
    const indicators = {
      javascript: [
        /\b(const|let|var)\s+\w+\s*=/,
        /function\s*\w*\s*\(/,
        /=\s*>\s*\{/,
        /require\s*\(/,
        /import\s+.*from/
      ],
      python: [
        /def\s+\w+\s*\(/,
        /class\s+\w+/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*['"]__main__['"]/
      ],
      css: [
        /[.#]\w+\s*\{/,
        /\w+\s*:\s*[^;]+;/,
        /@media\s*\(/,
        /@import\s+/
      ],
      html: [
        /<\/?[a-zA-Z][^>]*>/,
        /<!DOCTYPE/i,
        /<html/i,
        /<head/i,
        /<body/i
      ],
      json: [
        /^\s*\{[\s\S]*\}\s*$/,
        /^\s*\[[\s\S]*\]\s*$/,
        /"\w+"\s*:\s*/
      ]
    };

    for (const [language, patterns] of Object.entries(indicators)) {
      const matches = patterns.filter(pattern => pattern.test(code)).length;
      if (matches >= 2) {
        return language;
      }
    }

    return 'text';
  }

  /**
   * Aplica syntax highlighting progresivo
   */
  applySyntaxHighlighting(code, language = null) {
    if (!language) {
      language = this.detectLanguage(code);
    }

    const patterns = this.syntaxPatterns[language];
    if (!patterns) {
      return {
        highlighted: code,
        language: 'text',
        tokens: []
      };
    }

    let highlighted = code;
    const tokens = [];

    // Aplicar patrones de syntax highlighting
    for (const [tokenType, pattern] of Object.entries(patterns)) {
      highlighted = highlighted.replace(pattern, (match, ...groups) => {
        const token = {
          type: tokenType,
          value: match,
          position: highlighted.indexOf(match)
        };
        tokens.push(token);
        
        return `<span class="syntax-${tokenType}">${match}</span>`;
      });
    }

    return {
      highlighted,
      language,
      tokens,
      hasHighlighting: tokens.length > 0
    };
  }

  /**
   * Genera configuración de smooth scrolling
   */
  generateSmoothScrollConfig(contentLength, streamingSpeed) {
    const estimatedDuration = (contentLength / streamingSpeed) * 1000; // en ms
    
    return {
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
      scrollSpeed: Math.max(1, Math.min(10, streamingSpeed / 10)),
      updateInterval: Math.max(50, Math.min(200, estimatedDuration / 100)),
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      threshold: 0.1
    };
  }

  /**
   * Calcula métricas de scroll
   */
  calculateScrollMetrics(element, content) {
    return {
      contentHeight: content.length * 20, // Estimación aproximada
      viewportHeight: element?.clientHeight || 600,
      scrollPosition: element?.scrollTop || 0,
      scrollPercentage: element ? (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100 : 0,
      isAtBottom: element ? (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) : true
    };
  }

  /**
   * Limpia indicadores inactivos
   */
  cleanupInactiveIndicators(maxAge = 300000) { // 5 minutos
    const now = Date.now();
    
    for (const [sessionId, indicator] of this.activeIndicators.entries()) {
      if (now - indicator.startTime > maxAge) {
        this.activeIndicators.delete(sessionId);
      }
    }
    
    for (const [sessionId, tracker] of this.progressTrackers.entries()) {
      if (now - tracker.startTime > maxAge || tracker.isComplete) {
        this.progressTrackers.delete(sessionId);
      }
    }
  }

  /**
   * Detiene un typing indicator
   */
  stopTypingIndicator(sessionId) {
    const indicator = this.activeIndicators.get(sessionId);
    if (indicator) {
      indicator.isActive = false;
      indicator.type = this.typingStates.COMPLETE;
      return this.generateTypingIndicatorData(indicator);
    }
    return null;
  }

  /**
   * Completa un progress indicator
   */
  completeProgress(sessionId) {
    const tracker = this.progressTrackers.get(sessionId);
    if (tracker) {
      tracker.currentStep = tracker.totalSteps;
      tracker.isComplete = true;
      return this.generateProgressData(tracker);
    }
    return null;
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      activeIndicators: this.activeIndicators.size,
      activeProgressTrackers: this.progressTrackers.size,
      supportedLanguages: Object.keys(this.syntaxPatterns),
      typingStates: Object.values(this.typingStates)
    };
  }

  /**
   * Limpia todos los indicadores
   */
  cleanup() {
    this.activeIndicators.clear();
    this.progressTrackers.clear();
  }
}

export default new UXEnhancementService();