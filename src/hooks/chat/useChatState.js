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

  // RAG Enhancement: Search for relevant context before sending to Gemini
  const enhanceMessageWithRAG = useCallback(async (userMessage) => {
    try {
      // Only enhance text messages (not images)
      if (!userMessage.text || userMessage.image) {
        return userMessage;
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
              const enhancedMessage = {
                ...userMessage,
                text: `Contexto relevante de la base de conocimientos de NUVOS:\n${contextText}\n\nPregunta del usuario: ${userMessage.text}\n\nPor favor responde basándote en el contexto proporcionado y en español.`,
                originalText: userMessage.text // Keep original for display
              };
              return enhancedMessage;
            }
          }
        }
      }
    } catch (error) {
      console.warn('RAG enhancement failed, proceeding without context:', error);
    }
    
    return userMessage;
  }, []);

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

