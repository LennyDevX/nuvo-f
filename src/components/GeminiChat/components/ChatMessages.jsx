import React, { memo, useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { FaUser } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
import remarkGfm from 'remark-gfm';

// Lazy load components
const ReactMarkdown = lazy(() => import('react-markdown'));
const AnimatedAILogo = lazy(() => import('../../effects/AnimatedAILogo'));

// Simple debounce utility (local implementation)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Optimized Message Item with stable keys
const MessageItem = memo(({ message, index, shouldReduceMotion }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex w-full mb-6 px-4 md:px-6 ${isUser ? 'justify-end' : ''}`}
      data-message-index={index}
    >
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {isUser ? (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg border border-purple-500/20">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
                <FaUser size={14} className="text-white/90" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
                <Suspense fallback={<div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" />}>
                  <AnimatedAILogo reduced={true} isThinking={message.isStreaming} size="xs" />
                </Suspense>
              </div>
            </div>
            <div className="bg-gray-800/95 backdrop-blur-sm text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-purple-500/20">
              <Suspense fallback={<p className="text-sm leading-relaxed text-gray-100">{message.text}</p>}>
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

// Typing indicator component
const TypingIndicator = memo(() => (
  <div className="flex w-full mb-6 px-4 md:px-6">
    <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
          <Suspense fallback={<div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" />}>
            <AnimatedAILogo reduced={true} isThinking={true} size="xs" />
          </Suspense>
        </div>
      </div>
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-purple-500/20 shadow-lg">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
));

// Error component
const ErrorMessage = memo(({ error }) => (
  <div className="flex w-full mb-6 px-4 md:px-6">
    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm shadow-lg backdrop-blur-sm">
      {error}
    </div>
  </div>
));

// Main messages container with stable scroll
const ChatMessages = ({ 
  messages = [], 
  isLoading = false, 
  error = null, 
  shouldReduceMotion = false,
  messageEndRef
}) => {
  const containerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Stable scroll handler with proper debouncing
  const handleScroll = useCallback(
    debounce((e) => {
      const container = e.target;
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Reset user scrolling flag after delay
      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 1000);
      
      // Check if at bottom with tolerance
      const tolerance = 50;
      const atBottom = scrollHeight - scrollTop - clientHeight <= tolerance;
      setIsAtBottom(atBottom);
    }, 100),
    []
  );

  // Stable message keys
  const stableMessages = useMemo(() => {
    return messages.map((message, index) => ({
      ...message,
      id: message.id || `msg-${index}-${message.sender}-${message.text?.substring(0, 10)}`,
      index
    }));
  }, [messages]);

  // Auto-scroll only when new messages arrive and user is at bottom
  useEffect(() => {
    if (
      !isUserScrollingRef.current &&
      isAtBottom &&
      messages.length > lastMessageCountRef.current &&
      messageEndRef?.current
    ) {
      requestAnimationFrame(() => {
        messageEndRef.current?.scrollIntoView({ 
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'end'
        });
      });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, isAtBottom, shouldReduceMotion, messageEndRef]);

  // Dynamic viewport support
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Enhanced scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (messageEndRef?.current) {
      messageEndRef.current.scrollIntoView({ 
        behavior: smooth && !shouldReduceMotion ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      });
      setIsAtBottom(true);
    } else if (containerRef.current) {
      // Fallback to container scroll
      const container = containerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth && !shouldReduceMotion ? 'smooth' : 'auto'
      });
      setIsAtBottom(true);
    }
  }, [messageEndRef, shouldReduceMotion]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-0 bg-gray-900 relative"
      style={{ 
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)',
        scrollBehavior: shouldReduceMotion ? 'auto' : 'smooth',
        // Better mobile spacing - more room for input
        paddingBottom: window.innerWidth < 768 ? '140px' : '20px'
      }}
      onScroll={handleScroll}
    >
      <div className="max-w-4xl mx-auto py-4">
        {stableMessages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        {error && <ErrorMessage error={error} />}
        
        {/* Extra spacing for mobile to ensure content is not hidden */}
        <div className="h-12 md:h-6"></div>
        
        {/* Scroll anchor */}
        <div ref={messageEndRef} style={{ height: '1px' }} />
      </div>
      
      {/* Scroll to bottom button - Adjusted positioning for mobile */}
      {!isAtBottom && messages.length > 3 && (
        <button
          onClick={() => scrollToBottom(true)}
          className="
            fixed z-50
            bottom-[140px] right-5
            md:bottom-[6rem] md:right-6
            w-11 h-11 md:w-12 md:h-12
            bg-gradient-to-br from-purple-600/95 via-purple-700/95 to-purple-800/95
            hover:from-purple-700 hover:via-purple-800 hover:to-purple-900
            active:from-purple-800 active:via-purple-900 active:to-purple-950
            text-white rounded-full
            shadow-lg hover:shadow-xl hover:shadow-purple-500/25
            border border-purple-500/30 hover:border-purple-400/50
            transition-all duration-200 ease-out
            hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:ring-offset-1 focus:ring-offset-gray-900
            backdrop-blur-sm
            flex items-center justify-center
            touch-manipulation
            group
          "
          aria-label="Scroll to latest message"
          title="Go to latest message"
        >
          {/* Enhanced arrow icon */}
          <svg 
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-y-0.5 transition-transform duration-150" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          
          {/* Subtle pulse effect for attention */}
          <div className="absolute inset-0 rounded-full bg-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none animate-pulse" />
          
          {/* Notification dot for new messages */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-full border border-gray-900 opacity-90" />
        </button>
      )}
    </div>
  );
};

// Add CSS animation for fade-in
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `;
  if (!document.getElementById('chat-messages-styles')) {
    style.id = 'chat-messages-styles';
    document.head.appendChild(style);
  }
}

export default memo(ChatMessages);
