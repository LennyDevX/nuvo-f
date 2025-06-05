import React, { memo, useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { FaUser } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
import { FixedSizeList as List } from 'react-window';
import AnimatedAILogo from '../../effects/AnimatedAILogo';
import remarkGfm from 'remark-gfm';

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import('react-markdown'));

// Virtual list item component
const MessageItem = memo(({ index, style, data }) => {
  const { messages, shouldReduceMotion } = data;
  const message = messages[index];
  const isUser = message.sender === 'user';
  
  return (
    <div style={style} className="px-4 md:px-6">
      <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : ''}`}>
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
                  <AnimatedAILogo reduced={true} isThinking={message.isStreaming} size="xs" />
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
    </div>
  );
});

// Typing indicator component
const TypingIndicator = memo(() => (
  <div className="flex w-full mb-6 px-4 md:px-6">
    <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20">
          <AnimatedAILogo reduced={true} isThinking={true} size="xs" />
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

// Main messages container
const ChatMessages = ({ 
  messages = [], 
  isLoading = false, 
  error = null, 
  shouldReduceMotion = false 
}) => {
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const renderStartTime = useRef(Date.now());
  
  // Calculate item height based on content
  const getItemSize = useCallback((index) => {
    const message = messages[index];
    if (!message) return 80;
    
    const baseHeight = 60;
    const textLength = message.text.length;
    const estimatedLines = Math.ceil(textLength / 50);
    
    return Math.max(baseHeight, baseHeight + (estimatedLines - 1) * 20);
  }, [messages]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Auto-scroll to bottom when messages change (only if already at bottom)
  useEffect(() => {
    if (isAtBottom && listRef.current && messages.length > 0) {
      const scrollToBottom = () => {
        listRef.current?.scrollToItem(messages.length - 1, 'end');
      };
      
      if (shouldReduceMotion) {
        scrollToBottom();
      } else {
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages, isLoading, shouldReduceMotion, isAtBottom]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested) {
      const tolerance = 100;
      const maxScroll = Math.max(0, (messages.length * 80) - containerHeight);
      setIsAtBottom(scrollOffset >= maxScroll - tolerance);
    }
  }, [messages.length, containerHeight]);

  // Prepare data for virtual list
  const itemData = useMemo(() => ({
    messages,
    shouldReduceMotion
  }), [messages, shouldReduceMotion]);

  // Use virtual scrolling only for large message lists
  const useVirtualScrolling = messages.length > 50;

  if (useVirtualScrolling) {
    return (
      <div ref={containerRef} className="flex-1 overflow-hidden px-0 md:px-0 bg-gray-900">
        <div className="max-w-4xl mx-auto h-full relative">
          <List
            ref={listRef}
            height={containerHeight}
            itemCount={messages.length + (isLoading ? 1 : 0) + (error ? 1 : 0)}
            itemSize={getItemSize}
            itemData={itemData}
            onScroll={handleScroll}
            style={{ paddingBottom: '120px' }}
          >
            {({ index, style }) => {
              if (index === messages.length && isLoading) {
                return (
                  <div style={style}>
                    <TypingIndicator />
                  </div>
                );
              }
              
              if (index === messages.length + (isLoading ? 1 : 0) && error) {
                return (
                  <div style={style}>
                    <ErrorMessage error={error} />
                  </div>
                );
              }
              
              return <MessageItem index={index} style={style} data={itemData} />;
            }}
          </List>
          
          {!isAtBottom && (
            <button
              onClick={() => {
                listRef.current?.scrollToItem(messages.length - 1, 'end');
                setIsAtBottom(true);
              }}
              className="
                fixed bottom-32 right-6 z-10
                bg-purple-600 hover:bg-purple-700 
                text-white rounded-full p-3 shadow-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500
              "
            >
              ↓ New messages
            </button>
          )}
        </div>
      </div>
    );
  }

  // Standard scrolling for smaller lists
  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-0 bg-gray-900 pb-4 md:pb-0">
      <div className="max-w-4xl mx-auto py-4">
        {messages.map((message, index) => (
          <MessageItem
            key={`${index}-${message.sender}-${message.text.substring(0, 20)}`}
            index={index}
            style={{}}
            data={itemData}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        {error && <ErrorMessage error={error} />}
        
        {/* Mobile spacing for input */}
        <div className="md:hidden h-32"></div>
      </div>
    </div>
  );
};

export default memo(ChatMessages);
