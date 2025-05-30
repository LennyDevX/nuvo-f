import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FaPaperPlane, FaUser, FaBars, FaUserCircle } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
import memoWithName from '../../utils/performance/memoWithName';
import { useDebounce } from '../../hooks/performance/useEventOptimizers';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import remark-gfm normally
import remarkGfm from 'remark-gfm';

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import('react-markdown'));

// Simple text message component
const UserMessage = memoWithName(({ message }) => (
  <div className="message message-user">
    <div className="message-content message-content-user">
      <p style={{ margin: 0, padding: 0 }}>{message.text}</p>
    </div>
    <div className="message-avatar user-avatar">
      <FaUser size={14} />
    </div>
  </div>
));

// AI message with markdown support
const BotMessage = memoWithName(({ message, isThinking = false }) => (
  <div className="message message-ai">
    <div className="message-avatar ai-avatar">
      <AnimatedAILogo reduced={true} isThinking={isThinking} />
    </div>
    <div className="message-content message-content-ai">
      <Suspense fallback={<p style={{ margin: 0 }}>{message.text}</p>}>
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
      </Suspense>
    </div>
  </div>
));

// Loading indicator component with thinking state
const TypingIndicator = () => (
  <div className="message message-ai">
    <div className="message-avatar ai-avatar">
      <AnimatedAILogo reduced={true} isThinking={true} />
    </div>
    <div className="message-content message-content-ai typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  </div>
);

// Empty state welcome component
const WelcomeScreen = ({ onSuggestionClick }) => {
  const suggestions = [
    "What is blockchain?",
    "Explain NFTs", 
    "How does staking work?",
    "Tell me about DeFi"
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-logo">
        <AnimatedAILogo isThinking={false} isResponding={false} />
      </div>
      <h1 className="welcome-title">Nuvos AI Assistant</h1>
      <p className="welcome-subtitle">
        Ask me anything about blockchain, crypto, NFTs or the Nuvos ecosystem.
      </p>
      <div className="suggestions-container">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            className="suggestion-chip"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main chat component
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);
  
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
          // Shorter loading time for improved UX
          setTimeout(() => setIsInitializing(false), 600);
        }
      }
    };
    
    checkApiConnection();
    
    return () => { isMounted = false; };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      if (messages.length === 1) {
        // First message needs special handling to ensure visibility
        setTimeout(() => {
          messagesEndRef.current.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'end' });
        }, 100);
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    }
  }, [messages, isLoading, shouldReduceMotion]);

  // Focus input after initialization
  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitializing]);

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
    if (!input.trim()) return;

    const userMessage = { text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    sendMessageDebounced(userMessage);
  }, [input, sendMessageDebounced]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  // Handle input height adjustment with mobile considerations
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Reset height first to get accurate scrollHeight
    e.target.style.height = '44px'; // Use a fixed minimum height
    
    // Set new height based on content (with max height limit)
    const newHeight = Math.min(e.target.scrollHeight, 100);
    e.target.style.height = `${newHeight}px`;
    
    // Scroll the message container when input grows
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={`chat-layout ${messages.length === 0 ? 'empty-chat' : ''}`}>
      <div 
        className="messages-container" 
        id="chat-messages"
        ref={chatContainerRef}
      >
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`message-wrapper ${index === 0 ? 'first-message' : ''}`}>
                {message.sender === 'user' ? (
                  <UserMessage message={message} />
                ) : (
                  <BotMessage message={message} />
                )}
              </div>
            ))}
            
            {isLoading && <TypingIndicator />}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="bottom-nav-container">
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className={`sidebar-toggle-btn ${leftSidebarOpen ? 'active' : ''}`}
            aria-label="Toggle tools menu"
          >
            <FaBars size={20} />
          </button>
          
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Message Nuvos AI..."
              className="chat-input"
              rows={1}
              disabled={isLoading || isInitializing}
            />
          </div>
          
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading || isInitializing}
            aria-label="Send message"
          >
            <FaPaperPlane size={16} />
          </button>
          
          <button
            type="button"
            onClick={toggleRightSidebar}
            className={`sidebar-toggle-btn ${rightSidebarOpen ? 'active' : ''}`}
            aria-label="Toggle profile menu"
          >
            <FaUserCircle size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default memoWithName(GeminiChat);
