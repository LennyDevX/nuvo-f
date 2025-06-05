import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';
import memoWithName from '../../utils/performance/memoWithName';
import { useDebounce } from '../../hooks/performance/useEventOptimizers';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import modular components
import ChatMessages from './components/ChatMessages';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInputArea from './components/ChatInputArea';

// Conversation persistence utilities
const STORAGE_KEY = 'nuvos_chat_conversations';
const MAX_STORED_CONVERSATIONS = 10;

const saveConversationToStorage = (messages) => {
  if (messages.length === 0) return;
  
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newConversation = {
      id: Date.now(),
      timestamp: Date.now(),
      messages: messages,
      preview: messages[0]?.text?.substring(0, 100) || 'New conversation'
    };
    
    const updated = [newConversation, ...stored.slice(0, MAX_STORED_CONVERSATIONS - 1)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save conversation:', error);
  }
};

const loadConversationsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.warn('Failed to load conversations:', error);
    return [];
  }
};

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
  const [conversationId, setConversationId] = useState(null);
  
  // Cache for responses
  const responseCache = useRef(new Map());

  // Auto-save conversation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveConversationToStorage(messages);
      }, 1000); // Debounce saves
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

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

  // Process streaming response with optimistic updates
  const processStreamResponse = useCallback(async (reader, userMessage) => {
    const decoder = new TextDecoder();
    let fullResponse = '';
    let tempMessageIndex = -1;
    
    // Add temporary message for optimistic update
    setMessages(prev => {
      const newMessages = [...prev, { text: '', sender: 'bot', isStreaming: true }];
      tempMessageIndex = newMessages.length - 1;
      return newMessages;
    });
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        
        // Update streaming message
        setMessages(prev => {
          const updated = [...prev];
          if (updated[tempMessageIndex]) {
            updated[tempMessageIndex] = { 
              text: fullResponse, 
              sender: 'bot', 
              isStreaming: true 
            };
          }
          return updated;
        });
      }
      
      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        if (updated[tempMessageIndex]) {
          updated[tempMessageIndex] = { 
            text: fullResponse, 
            sender: 'bot', 
            isStreaming: false 
          };
        }
        return updated;
      });
      
      // Cache the response
      responseCache.current.set(userMessage.text, fullResponse);
      
    } catch (error) {
      console.error('Error processing stream:', error);
      setError("Error processing response. Please try again.");
      
      // Remove failed streaming message
      setMessages(prev => prev.filter((_, index) => index !== tempMessageIndex));
    }
  }, []);

  // Send message function with debounce and optimistic updates
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
        await processStreamResponse(reader, userMessage);
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

  // New conversation handler with persistence
  const handleNewConversation = useCallback(() => {
    // Save current conversation if it has messages
    if (messages.length > 0) {
      saveConversationToStorage(messages);
    }
    
    setMessages([]);
    setError(null);
    setConversationId(null);
    setInput('');
  }, [messages]);

  // Load conversation from storage
  const handleLoadConversation = useCallback((conversation) => {
    setMessages(conversation.messages);
    setConversationId(conversation.id);
    setError(null);
  }, []);

  // Smart keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Global shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      
      if (e.key === 'Escape') {
        // Close sidebars on escape
        if (leftSidebarOpen) toggleLeftSidebar();
        if (rightSidebarOpen) toggleRightSidebar();
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleNewConversation, leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header - only visible on mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-purple-500/20 bg-gray-900/95 backdrop-blur-md">
        {/* Left Menu Button */}
        <button
          onClick={toggleLeftSidebar}
          className={`
            w-12 h-12 rounded-xl transition-all duration-200 ease-out
            border-2 shadow-lg flex items-center justify-center
            touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
            ${leftSidebarOpen
              ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 border-purple-500 text-white shadow-purple-500/30'
              : 'bg-gray-800/80 hover:bg-gray-700 border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 shadow-lg hover:shadow-purple-500/20'
            }
          `}
          aria-label="Toggle AI tools menu"
          aria-expanded={leftSidebarOpen}
        >
          <FaBars className="w-5 h-5" />
        </button>
        
        {/* Center Area with Title and New Chat Button */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">
            Nuvos AI
          </h1>
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="
                w-10 h-10 rounded-xl
                bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 
                hover:from-purple-700 hover:via-pink-700 hover:to-purple-800
                active:from-purple-800 active:via-pink-800 active:to-purple-900
                border-2 border-purple-500/50 hover:border-purple-400/70
                text-white
                transition-all duration-200 ease-out
                flex items-center justify-center
                shadow-lg hover:shadow-purple-500/30
                hover:scale-105 active:scale-95
                touch-manipulation
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
              "
              aria-label="Start new conversation"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Right Profile Button */}
        <button
          onClick={toggleRightSidebar}
          className={`
            w-12 h-12 rounded-xl transition-all duration-200 ease-out
            border-2 shadow-lg flex items-center justify-center
            touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
            ${rightSidebarOpen
              ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 border-purple-500 text-white shadow-purple-500/30'
              : 'bg-gray-800/80 hover:bg-gray-700 border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 shadow-lg hover:shadow-purple-500/20'
            }
          `}
          aria-label="Toggle profile menu"
          aria-expanded={rightSidebarOpen}
        >
          <FaUserCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      {isInitializing ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg border border-white/20">
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
        hasMessages={messages.length > 0}
      />
    </div>
  );
};

export default memoWithName(GeminiChat);
