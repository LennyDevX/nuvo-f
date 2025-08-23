import { useReducer, useRef, useCallback, useEffect, useState } from 'react';
import { debounce } from '../../utils/performance/debounce';
import { chatReducer, initialChatState } from '../../components/GeminiChat/core/chatReducer';
import { StreamingService } from '../../components/GeminiChat/core/streamingService';
import { enhancedCache } from '../../components/GeminiChat/core/cacheManager';
import { conversationManager } from '../../components/GeminiChat/core/conversationManager';

export const useChatState = ({ shouldReduceMotion = false, isLowPerformance = false }) => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const streamingService = useRef(null);
  if (!streamingService.current) {
    streamingService.current = new StreamingService();
  }
  const retryCount = useRef(0);
  const maxRetries = 3;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [conversationId, setConversationId] = useState(null);

  // Enhanced offline/online detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      retryCount.current = 0;
      dispatch({ type: 'SET_ERROR', payload: null });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'You are offline. Messages will be sent when connection is restored.' 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const lastConversation = conversationManager.loadLastConversation();
    if (lastConversation) {
      dispatch({ type: 'LOAD_CONVERSATION', payload: lastConversation });
      setConversationId(lastConversation.id);
    }
  }, []); // Run only once on mount

  const loadConversation = useCallback((conversation) => {
    dispatch({ type: 'LOAD_CONVERSATION', payload: conversation });
    setConversationId(conversation.id);
  }, []);

  const debouncedSave = useCallback(
    debounce((messages, id) => {
      conversationManager.saveConversationToStorage(messages, id);
    }, 500), // Debounce de 500ms
    []
  );

  useEffect(() => {
    if (state.messages.length > 0) {
      debouncedSave(state.messages, conversationId);
    }

    const handleBeforeUnload = () => {
        conversationManager.saveConversationToStorage(state.messages, conversationId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.messages, conversationId, debouncedSave]);

  // Formatea mensajes para API Gemini multimodal
  const formatMessagesForAPI = useCallback(() => {
    return state.messages.map(msg => {
      const parts = [];
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      if (msg.image) {
        // Gemini SDK espera imágenes como objetos { inlineData: { mimeType, data } }
        const match = /^data:(image\/\w+);base64,(.*)$/.exec(msg.image);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts
      };
    });
  }, [state.messages]);

  // Enhanced cache key generation
  const generateCacheKey = useCallback((userMessage, context = []) => {
    const contextHash = context.slice(-5).map(m => m.text.substring(0, 50)).join('|');
    // Use encodeURIComponent and hash instead of btoa to handle UTF-8 characters
    const safeHash = encodeURIComponent(contextHash).replace(/%/g, '').substring(0, 16);
    return `${userMessage.text}_${safeHash}`;
  }, []);

  // Process stream response with enhanced error handling
  const processStreamResponse = useCallback(async (response, userMessage, setInput) => {
    if (!response.body) {
      throw new Error('No stream available');
    }

    try {
      await streamingService.current.processStream({
        response,
        dispatch,
        isLowPerformance,
        shouldReduceMotion,
        onUpdate: (content) => dispatch({ type: 'UPDATE_STREAM', payload: content }),
        onFinish: async (finalContent) => {
          retryCount.current = 0; // Reset retry count on success
          const finalMessages = [...state.messages];
          const lastMsg = finalMessages[finalMessages.length - 1];
          if (lastMsg?.isStreaming) {
            lastMsg.text = finalContent;
            lastMsg.isStreaming = false;
          }
          conversationManager.saveConversationToStorage(finalMessages, conversationId);
          
          // RAG Enhancement: Index conversation automatically
          try {
            const originalUserText = userMessage.originalText || userMessage.text;
            await fetch('/server/gemini/embeddings/index', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'chat_history',
                documents: [{
                  content: `Usuario: ${originalUserText}\nIA: ${finalContent}`,
                  metadata: {
                    timestamp: Date.now(),
                    type: 'conversation',
                    user_query: originalUserText,
                    ai_response: finalContent,
                    conversation_id: conversationId
                  }
                }]
              })
            });
          } catch (error) {
            console.warn('Failed to index conversation:', error);
          }
        },
        onError: (error, onRetry, messageId) => {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: { error, onRetry, messageId }
          });
        },
        lastMessage: userMessage,
        setInput
      });
    } catch (error) {
      console.error('Error in processStreamResponse:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: "Stream processing failed. Please try again." 
      });
    }
  }, [isLowPerformance, shouldReduceMotion, state.messages.length, generateCacheKey, isOnline]);

  // Función para detectar URLs en texto
  const detectUrls = useCallback((text) => {
    // Regex más robusta para detectar URLs, incluyendo las que están entre backticks o comillas
    const urlRegex = /(?:`|"|\')?\s*(https?:\/\/[^\s<>"'`\)\]\}]+)\s*(?:`|"|\')?/gi;
    const matches = [];
    let match;
    
    while ((match = urlRegex.exec(text)) !== null) {
      matches.push(match[1]); // Capturar solo la URL sin los delimitadores
    }
    
    // Limpiar y normalizar URLs detectadas
    return matches.map(url => {
      // Remover espacios al inicio y final
      url = url.trim();
      
      // Remover caracteres especiales al final que no pertenecen a la URL
      url = url.replace(/[.,;:!?\)\]}>"'`]+$/, '');
      
      // Detectar URLs truncadas y mostrar advertencia
      if (url.includes('…') || url.includes('...')) {
        console.warn(`URL detectada parece estar truncada: ${url}`);
        console.warn('Esto puede causar errores en la extracción de contenido');
      }
      
      return url;
    }).filter(url => {
      // Filtrar URLs válidas
      try {
        new URL(url);
        return true;
      } catch {
        console.warn(`URL inválida detectada y filtrada: ${url}`);
        return false;
      }
    });
  }, []);

  // Función para extraer contenido de URLs
  const extractUrlContent = useCallback(async (urls) => {
    try {
      const response = await fetch('/server/gemini/extract-multiple-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          options: {
            concurrency: 2,
            continueOnError: true,
            includeInContext: true
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.warn('Error extracting URL content:', error);
    }
    return null;
  }, []);

  // RAG Enhancement: Search for relevant context and process URLs before sending to Gemini
  const enhanceMessageWithRAG = useCallback(async (userMessage) => {
    try {
      // Only enhance text messages (not images)
      if (!userMessage.text || userMessage.image) {
        return userMessage;
      }

      let enhancedText = userMessage.text;
      let urlContent = '';
      
      // Detectar y procesar URLs en el mensaje
      const urls = detectUrls(userMessage.text);
      if (urls.length > 0) {
        console.log('URLs detectadas:', urls);
        
        // Mostrar indicador de procesamiento de URLs
        dispatch({ 
          type: 'SET_URL_PROCESSING', 
          payload: { urls, status: 'processing' } 
        });
        
        const urlResult = await extractUrlContent(urls);
        if (urlResult && urlResult.results && urlResult.results.length > 0) {
          // Usar el contenido formateado del servicio web scraper
          const urlContents = urlResult.results.map(result => 
            result.formatted || result.content
          ).join('\n\n');
          
          urlContent = `\n\n${urlContents}`;
          console.log('Contenido de URLs extraído exitosamente');
          
          // Actualizar estado con URLs procesadas
          dispatch({ 
            type: 'SET_URL_PROCESSING', 
            payload: { urls, status: 'completed', content: urlResult.results } 
          });
        } else {
          // Proporcionar información más detallada del error
          let errorMessage = 'No se pudo extraer contenido';
          if (urlResult && urlResult.errors && urlResult.errors.length > 0) {
            errorMessage = urlResult.errors[0].error || errorMessage;
          }
          
          console.warn('Error extrayendo contenido de URLs:', errorMessage);
          dispatch({ 
            type: 'SET_URL_PROCESSING', 
            payload: { urls, status: 'failed', error: errorMessage } 
          });
        }
      }

      // Search for relevant context in knowledge base
      const searchResponse = await fetch('/server/gemini/embeddings/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'knowledge_base',
          query: userMessage.text,
          topK: 3
        })
      });

      let ragContext = '';
      if (searchResponse.ok) {
        const relevantContext = await searchResponse.json();
        
        // Add context to prompt if relevant results found
        if (relevantContext.results && relevantContext.results.length > 0) {
          // Filter results with good similarity scores (>0.6 for better coverage)
          const goodResults = relevantContext.results.filter(r => r.score > 0.6);
          
          if (goodResults.length > 0) {
            const contextText = goodResults
              .map(r => r.content || r.metadata?.text)
              .filter(content => content && content.trim())
              .join('\n\n');
            
            if (contextText) {
              console.log('RAG Context found:', goodResults.length, 'relevant results');
              ragContext = `\n\nContexto relevante de la base de conocimientos de NUVOS:\n${contextText}`;
            }
          }
        }
      }

      // Buscar también en el contexto de URLs si existe
      if (urls.length > 0) {
        try {
          const urlContextResponse = await fetch('/server/gemini/embeddings/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'url_context',
              query: userMessage.text,
              topK: 2
            })
          });

          if (urlContextResponse.ok) {
            const urlContextResult = await urlContextResponse.json();
            if (urlContextResult.results && urlContextResult.results.length > 0) {
              const urlContextText = urlContextResult.results
                .filter(r => r.score > 0.5)
                .map(r => {
                  const title = r.metadata?.title || 'Contenido sin título';
                  const content = r.content || '';
                  return `**${title}**:\n${content.substring(0, 500)}...`;
                })
                .join('\n\n');
              
              if (urlContextText) {
                ragContext += `\n\nContexto relevante de URLs procesadas anteriormente:\n${urlContextText}`;
              }
            }
          }
        } catch (error) {
          console.warn('Error searching URL context:', error);
        }
      }

      // Combinar todo el contexto
      if (ragContext || urlContent) {
        const enhancedMessage = {
          ...userMessage,
          text: `${ragContext}${urlContent}\n\nPregunta del usuario: ${userMessage.text}\n\nPor favor responde basándote en el contexto proporcionado y en español.`,
          originalText: userMessage.text, // Keep original for display
          hasUrls: urls.length > 0,
          processedUrls: urls
        };
        return enhancedMessage;
      }
    } catch (error) {
      console.warn('RAG enhancement failed, proceeding without context:', error);
      // Limpiar estado de procesamiento de URLs en caso de error
      dispatch({ 
        type: 'SET_URL_PROCESSING', 
        payload: { urls: [], status: 'failed' } 
      });
    }
    
    return userMessage;
  }, [detectUrls, extractUrlContent, dispatch]);

  // Enhanced send message with RAG and better caching and offline support
  const sendMessageDebounced = useCallback(
    debounce(async (userMessage, setInput) => {
      // Check if offline
      if (!isOnline) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: "You are offline. Please check your connection and try again." 
        });
        return;
      }

      // Enhance message with RAG before processing
      const enhancedMessage = await enhanceMessageWithRAG(userMessage);
      const cacheKey = generateCacheKey(enhancedMessage, state.messages);
      
      // Check enhanced cache first
      if (enhancedCache.has(cacheKey)) {
        const cachedResponse = enhancedCache.get(cacheKey);
        dispatch({ type: 'START_STREAMING' });
        
        // Simulate progressive loading for cached content with better UX
        const words = cachedResponse.split(' ');
        let currentText = '';
        
        const wordBatch = shouldReduceMotion ? 6 : 2;
        const delay = shouldReduceMotion ? 20 : 25;
        
        for (let i = 0; i < words.length; i += wordBatch) {
          currentText += words.slice(i, i + wordBatch).join(' ') + ' ';
          dispatch({ type: 'UPDATE_STREAM', payload: currentText.trim() });
          
          if (!shouldReduceMotion && i < words.length - wordBatch) {
            await new Promise(resolve => setTimeout(resolve, delay));  
          }
        }
        
        dispatch({ type: 'FINISH_STREAM' });
        return;
      }
      
      // Start streaming immediately to show typing indicator
      dispatch({ type: 'START_STREAMING' });

      // Enhanced AbortController with timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 60000); // 60 second timeout
      
      if (window.currentGeminiRequest) {
        window.currentGeminiRequest.abort();
      }
      window.currentGeminiRequest = abortController;

      try {
        const apiUrl = '/server/gemini';
        // Si el mensaje tiene imagen, ajusta el formato
        const formattedMessages = [...formatMessagesForAPI()];
        if (enhancedMessage.text || enhancedMessage.image) {
          const parts = [];
          if (enhancedMessage.text) parts.push({ text: enhancedMessage.text });
          if (enhancedMessage.image) {
            const match = /^data:(image\/\w+);base64,(.*)$/.exec(enhancedMessage.image);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              });
            }
          }
          formattedMessages.push({
            role: 'user',
            parts
          });
        }
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'Cache-Control': 'no-cache',
            'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          },
          body: JSON.stringify({ 
            messages: formattedMessages,
            stream: true,
            temperature: 0.7,
            maxTokens: 3000,
            metadata: {
              cacheKey,
              retryCount: retryCount.current
            }
          }),
          signal: abortController.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Try to get error details from response
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (err) {}
          console.error('Gemini API error:', response.status, response.statusText, errorText);
          // Mejorar el manejo de errores 500
          if (response.status === 500) {
            // Try to parse JSON error if available
            let errorMsg = errorText;
            try {
              const json = JSON.parse(errorText);
              errorMsg = json.details || json.error || errorText;
            } catch (e) {}
            throw new Error(`Gemini API error 500: ${errorMsg}`);
          }
          throw new Error(`Server error: ${response.status} - ${response.statusText} - ${errorText}`);
        }
        
        // Use original message for display, enhanced for API
        const displayMessage = {
          ...userMessage,
          text: enhancedMessage.originalText || userMessage.text
        };
        await processStreamResponse(response, displayMessage, setInput);
        
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.log('Request cancelled or timed out');
          return; // Early exit
        }
        
        console.error('Error sending message:', error);

        const onRetry = () => {
            dispatch({ type: 'REMOVE_LAST_MESSAGE' });
            if (userMessage) {
                setInput(userMessage.text);
            }
        };

        dispatch({ 
          type: 'SET_ERROR', 
          payload: { 
            message: `Failed to send message: ${error.message}`,
            onRetry,
            messageId: userMessage.id
           }
        });
      } finally {
        if (window.currentGeminiRequest === abortController) {
          window.currentGeminiRequest = null;
        }
      }
    }, 300),
    [formatMessagesForAPI, processStreamResponse, shouldReduceMotion, generateCacheKey, state.messages, isOnline]
  );

  // Enhanced message handlers
  const handleSendMessage = useCallback((e, input, setInput) => {
    e.preventDefault();
    if (!input || state.isLoading) return;

    // Si input es objeto multimodal (con imagen), asegúrate de incluir texto y imagen
    let userMessage;
    if (typeof input === 'object' && (input.image || input.text)) {
      userMessage = {
        text: input.text?.trim() || '',
        sender: 'user',
        image: input.image || null
      };
    } else {
      userMessage = { text: input.trim(), sender: 'user' };
    }

    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
    setInput('');

    sendMessageDebounced(userMessage, setInput);
  }, [state.isLoading, sendMessageDebounced]);

  const handleNewConversation = useCallback(() => {
    // Guardar la conversación actual antes de resetear si tiene mensajes
    if (state.messages.length > 0 && conversationId) {
      conversationManager.saveConversationToStorage(state.messages, conversationId);
    }
    
    // Generar nuevo ID para la nueva conversación
    const newConversationId = crypto.randomUUID();
    setConversationId(newConversationId);
    
    dispatch({ type: 'RESET_CONVERSATION' });
  }, [state.messages, conversationId]);

  const handleLoadConversation = useCallback((conversation) => {
    dispatch({ type: 'LOAD_CONVERSATION', payload: conversation });
    setConversationId(conversation.id);
  }, []);

  // API connection check
  const checkApiConnection = useCallback(async () => {
    try {
      const response = await fetch('/server/gemini/check-api');
      if (!response.ok) {
        throw new Error(`API check failed: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API connection check:', data.status);
      return data.status === 'ok';
    } catch (error) {
      console.error('Error checking API connection:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to API. Please check your network and server.' });
      return false;
    }
  }, []);

  // Enhanced cache management
  const clearCache = useCallback(() => {
    enhancedCache.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return enhancedCache.getStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamingService.current?.destroy();
    };
  }, []);

  return {
    // State
    state: {
      ...state,
      isOnline
    },
    dispatch,
    
    // Handlers
    handleSendMessage,
    handleNewConversation,
    handleLoadConversation,
    
    // Utils
    checkApiConnection,
    formatMessagesForAPI,
    
    // Enhanced cache management
    clearCache,
    getCacheStats,
    
    // Performance stats
    getPerformanceStats: () => ({
      cache: getCacheStats(),
      retryCount: retryCount.current,
      isOnline
    }),
    
    // Additional exports for compatibility
    loadConversation,
    conversationId,
    setConversationId
  };
};

