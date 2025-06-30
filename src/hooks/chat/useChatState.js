import { useReducer, useRef, useCallback, useEffect, useState } from 'react';
import { debounce } from '../../utils/performance/debounce';
import { chatReducer, initialChatState } from '../../components/GeminiChat/core/chatReducer';
import { StreamingService } from '../../components/GeminiChat/core/streamingService';
import { enhancedCache } from '../../components/GeminiChat/core/cacheManager';

export const useChatState = ({ shouldReduceMotion = false, isLowPerformance = false }) => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const streamingService = useRef(new StreamingService());
  const retryCount = useRef(0);
  const maxRetries = 3;
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Format messages for API
  const formatMessagesForAPI = useCallback(() => {
    return state.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }, [state.messages]);

  // Enhanced cache key generation
  const generateCacheKey = useCallback((userMessage, context = []) => {
    const contextHash = context.slice(-5).map(m => m.text.substring(0, 50)).join('|');
    return `${userMessage.text}_${btoa(contextHash).substring(0, 16)}`;
  }, []);

  // Process stream response with enhanced error handling
  const processStreamResponse = useCallback(async (response, userMessage) => {
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
        onFinish: (finalContent) => {
          dispatch({ type: 'FINISH_STREAM' });
          
          // Enhanced caching with context awareness
          if (finalContent && finalContent.length > 10 && finalContent.length < 15000) {
            const cacheKey = generateCacheKey(userMessage, state.messages);
            const ttl = finalContent.length > 1000 ? 3600000 : 1800000; // Longer TTL for detailed responses
            enhancedCache.set(cacheKey, finalContent, ttl);
          }
          
          retryCount.current = 0; // Reset retry count on success
        },
        onError: (error) => {
          console.error('Stream processing error:', error);
          
          if (retryCount.current < maxRetries && isOnline) {
            retryCount.current++;
            dispatch({ 
              type: 'SET_ERROR', 
              payload: `Connection issue. Retrying... (${retryCount.current}/${maxRetries})` 
            });
            
            // Retry after delay
            setTimeout(() => {
              sendMessageDebounced(userMessage);
            }, 2000 * retryCount.current);
          } else {
            dispatch({ 
              type: 'SET_ERROR', 
              payload: isOnline 
                ? "Connection failed after multiple attempts. Please try again." 
                : "You are offline. Please check your connection."
            });
            dispatch({ type: 'REMOVE_FAILED_MESSAGE', payload: state.messages.length });
          }
        }
      });
    } catch (error) {
      console.error('Error in processStreamResponse:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: "Stream processing failed. Please try again." 
      });
    }
  }, [isLowPerformance, shouldReduceMotion, state.messages.length, generateCacheKey, isOnline]);

  // Enhanced send message with better caching and offline support
  const sendMessageDebounced = useCallback(
    debounce(async (userMessage) => {
      // Check if offline
      if (!isOnline) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: "You are offline. Please check your connection and try again." 
        });
        return;
      }

      const cacheKey = generateCacheKey(userMessage, state.messages);
      
      // Check enhanced cache first
      if (enhancedCache.has(cacheKey)) {
        const cachedResponse = enhancedCache.get(cacheKey);
        dispatch({ type: 'START_STREAMING' });
        
        // Simulate progressive loading for cached content with better UX
        const words = cachedResponse.split(' ');
        let currentText = '';
        
        const wordBatch = shouldReduceMotion ? 8 : 4;
        const delay = shouldReduceMotion ? 30 : 50;
        
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
      
      dispatch({ type: 'SET_LOADING', payload: true });

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
        const formattedMessages = [...formatMessagesForAPI(), {
          role: 'user',
          parts: [{ text: userMessage.text }]
        }];
        
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
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
        
        await processStreamResponse(response, userMessage);
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.log('Request cancelled or timed out');
          return;
        }
        
        console.error('Error:', error);
        
        // Enhanced error handling with specific messages
        let errorMessage = 'An error occurred. Please try again.';
        
        if (!isOnline) {
          errorMessage = 'Connection lost. Please check your internet and try again.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        }
        
        dispatch({ 
          type: 'SET_ERROR', 
          payload: errorMessage
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
    if (!input.trim() || state.isLoading) return;

    const userMessage = { text: input.trim(), sender: 'user' };
    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
    setInput('');
    
    sendMessageDebounced(userMessage);
  }, [state.isLoading, sendMessageDebounced]);

  const handleNewConversation = useCallback(() => {
    dispatch({ type: 'RESET_CONVERSATION' });
  }, []);

  const handleLoadConversation = useCallback((conversation) => {
    dispatch({ type: 'LOAD_CONVERSATION', payload: conversation });
  }, []);

  // API connection check
  const checkApiConnection = useCallback(async () => {
    try {
      const apiUrl = '/server/hello';
      await fetch(apiUrl);
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: "Unable to connect to AI service. Please try again later." });
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
    })
  };
};
