import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';
import memoWithName from '../../utils/performance/memoWithName';
import { useDebounce } from '../../hooks/performance/useEventOptimizers';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import modular components
import ChatMessages from './components/ChatMessages';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInputArea from './components/ChatInputArea';

const GeminiChat = ({ 
  shouldReduceMotion = false, 
  isLowPerformance = false,
  toggleLeftSidebar = () => {},
  toggleRightSidebar = () => {},
  leftSidebarOpen = false,
  rightSidebarOpen = false
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache for responses
  const responseCache = useRef(new Map());

  // Check API connection on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkApiConnection = async () => {
      try {
        const apiUrl = '/server/hello';
        await fetch(apiUrl);
      } catch (error) {
        if (isMounted) {
          setError("Unable to connect to AI service. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setTimeout(() => setIsInitializing(false), 400);
        }
      }
    };
    
    checkApiConnection();
    
    return () => { isMounted = false; };
  }, []);

  // Format messages for API
  const formatMessagesForAPI = useCallback(() => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }, [messages]);

  // Process streaming response
  const processStreamResponse = useCallback(async (reader) => {
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        fullResponse += decoder.decode(value);
      }
      
      setMessages(prev => [...prev, { text: fullResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error processing stream:', error);
      setError("Error processing response. Please try again.");
    }
  }, []);

  // Send message function with debounce
  const sendMessageDebounced = useDebounce(async (userMessage) => {
    const cacheKey = userMessage.text;
    
    setIsLoading(true);
    setError(null);

    // Check cache for existing response
    if (responseCache.current.has(cacheKey)) {
      setMessages(prev => [
        ...prev,
        { text: responseCache.current.get(cacheKey), sender: 'bot' }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = '/server/gemini';
      const formattedMessages = [...formatMessagesForAPI(), {
        role: 'user',
        parts: [{ text: userMessage.text }]
      }];
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: formattedMessages,
          stream: true 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      if (response.body) {
        const reader = response.body.getReader();
        await processStreamResponse(reader);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle message submission
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    sendMessageDebounced(userMessage);
  }, [input, isLoading, sendMessageDebounced]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
  }, []);

  // New conversation handler
  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header - only visible on mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-purple-500/20 bg-gray-900">
        <button
          onClick={toggleLeftSidebar}
          className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors border border-purple-500/30"
          aria-label="Toggle menu"
        >
          <FaBars className="w-5 h-5 text-purple-400" />
        </button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">
            Nuvos AI
          </h1>
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors border border-purple-500/30"
              aria-label="New conversation"
            >
              <FaPlus className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
        
        <button
          onClick={toggleRightSidebar}
          className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors border border-purple-500/30"
          aria-label="Toggle profile"
        >
          <FaUserCircle className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Main Content Area */}
      {isInitializing ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <AnimatedAILogo size="sm" isThinking={true} />
            </div>
            <p className="text-gray-400 text-sm">Initializing...</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
      ) : (
        <ChatMessages 
          messages={messages}
          isLoading={isLoading}
          error={error}
          shouldReduceMotion={shouldReduceMotion}
        />
      )}

      {/* Input Area */}
      <ChatInputArea
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isInitializing={isInitializing}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />
    </div>
  );
};

export default memoWithName(GeminiChat);
