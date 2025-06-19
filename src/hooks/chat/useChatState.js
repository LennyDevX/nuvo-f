import { useReducer, useRef, useCallback, useEffect } from 'react';
import { debounce } from '../../utils/performance/debounce';
import { chatReducer, initialChatState } from '../../components/GeminiChat/core/chatReducer';
import { StreamingService } from '../../components/GeminiChat/core/streamingService';

export const useChatState = ({ shouldReduceMotion = false, isLowPerformance = false }) => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const responseCache = useRef(new Map());
  const streamingService = useRef(new StreamingService());

  // Format messages for API
  const formatMessagesForAPI = useCallback(() => {
    return state.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }, [state.messages]);

  // Process stream response with optimizations
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
          // Cache successful response with proper content reference
          if (finalContent && finalContent.length > 10 && finalContent.length < 15000) {
            responseCache.current.set(userMessage.text, finalContent);
            if (responseCache.current.size > 50) {
              const firstKey = responseCache.current.keys().next().value;
              responseCache.current.delete(firstKey);
            }
          }
        },
        onError: (error) => {
          console.error('Stream processing error:', error);
          dispatch({ 
            type: 'SET_ERROR', 
            payload: "Connection interrupted. Please try again." 
          });
          dispatch({ type: 'REMOVE_FAILED_MESSAGE', payload: state.messages.length });
        }
      });
    } catch (error) {
      console.error('Error in processStreamResponse:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: "Stream processing failed. Please try again." 
      });
    }
  }, [isLowPerformance, shouldReduceMotion, state.messages.length]);

  // Send message with caching and debouncing
  const sendMessageDebounced = useCallback(
    debounce(async (userMessage) => {
      const cacheKey = userMessage.text;
      
      // Check local cache first
      if (responseCache.current.has(cacheKey)) {
        const cachedResponse = responseCache.current.get(cacheKey);
        dispatch({ type: 'START_STREAMING' });
        
        // Simulate progressive loading for cached content
        const words = cachedResponse.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i += 3) {
          currentText += words.slice(i, i + 3).join(' ') + ' ';
          dispatch({ type: 'UPDATE_STREAM', payload: currentText.trim() });
          
          if (!shouldReduceMotion) {
            await new Promise(resolve => setTimeout(resolve, 50));  
          }
        }
        
        dispatch({ type: 'FINISH_STREAM' });
        return;
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });

      // AbortController for cancellation
      const abortController = new AbortController();
      
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
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ 
            messages: formattedMessages,
            stream: true,
            temperature: 0.7,
            maxTokens: 3000
          }),
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
        
        await processStreamResponse(response, userMessage);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled');
          return;
        }
        
        console.error('Error:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Error: ${error.message}. Please try again.` 
        });
      } finally {
        if (window.currentGeminiRequest === abortController) {
          window.currentGeminiRequest = null;
        }
      }
    }, 300),
    [formatMessagesForAPI, processStreamResponse, shouldReduceMotion]
  );

  // Message handlers
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

  return {
    // State
    state,
    dispatch,
    
    // Handlers
    handleSendMessage,
    handleNewConversation,
    handleLoadConversation,
    
    // Utils
    checkApiConnection,
    formatMessagesForAPI,
    
    // Cache management
    clearCache: () => responseCache.current.clear(),
    getCacheStats: () => ({
      size: responseCache.current.size,
      keys: Array.from(responseCache.current.keys()).slice(0, 5)
    })
  };
};
