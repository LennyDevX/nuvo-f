import React, { memo, useMemo, useCallback, useRef, useEffect, useState, lazy, Suspense } from 'react';
import { FaUser } from 'react-icons/fa';
import remarkGfm from 'remark-gfm';

// Conditional import for react-window with fallback
let List = null;
const loadReactWindow = async () => {
  try {
    const reactWindow = await import('react-window');
    List = reactWindow.FixedSizeList;
  } catch (error) {
    console.warn('react-window not available, using fallback scrolling');
  }
};
loadReactWindow();

const ReactMarkdown = lazy(() => import('react-markdown'));
const AnimatedAILogo = lazy(() => import('../../effects/AnimatedAILogo'));

// Message height estimation
const ESTIMATED_MESSAGE_HEIGHT = 80;
const MIN_MESSAGE_HEIGHT = 60;
const MAX_MESSAGE_HEIGHT = 300;

// Fallback component when react-window is not available
const FallbackMessageList = memo(({ messages, isLoading, error, shouldReduceMotion }) => {
  const containerRef = useRef(null);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-0 bg-gray-900 relative"
      style={{ 
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)'
      }}
    >
      <div className="max-w-4xl mx-auto py-4">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id || `msg-${index}`}
            message={message}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        {error && <ErrorMessage error={error} />}
      </div>
    </div>
  );
});

// Shared message item component
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
              {/* Mostrar imagen si existe */}
              {message.image && (
                <img
                  src={message.image}
                  alt="user-upload"
                  className="mt-2 rounded-lg max-w-xs max-h-48 border border-purple-500/30 shadow"
                  style={{ objectFit: 'cover' }}
                />
              )}
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
                  {/* Mostrar imagen si existe en respuesta del modelo */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="ai-upload"
                      className="mt-2 rounded-lg max-w-xs max-h-48 border border-purple-500/30 shadow"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

// Memoized message item for virtualization
const VirtualMessageItem = memo(({ index, style, data }) => {
  const { messages, shouldReduceMotion, onHeightChange } = data;
  const message = messages[index];
  const itemRef = useRef(null);
  const [itemHeight, setItemHeight] = useState(ESTIMATED_MESSAGE_HEIGHT);

  // Measure actual height after render
  useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.offsetHeight;
      if (Math.abs(height - itemHeight) > 5) {
        setItemHeight(height);
        onHeightChange?.(index, height);
      }
    }
  }, [message.text, itemHeight, index, onHeightChange]);

  if (!message) {
    return <div style={style} />;
  }

  return (
    <div style={style}>
      <div ref={itemRef}>
        <MessageItem
          message={message}
          index={index}
          shouldReduceMotion={shouldReduceMotion}
        />
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

// Virtualized chat messages component
const VirtualizedChatMessages = ({ 
  messages = [], 
  isLoading = false, 
  error = null, 
  shouldReduceMotion = false,
  messageEndRef
}) => {
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const heightCache = useRef(new Map());
  const [listHeight, setListHeight] = useState(400);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // If react-window is not available, use fallback
  if (!List) {
    return (
      <FallbackMessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        shouldReduceMotion={shouldReduceMotion}
      />
    );
  }

  // Calculate container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        setListHeight(height - 100); // Account for input area
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle height changes for dynamic sizing
  const handleHeightChange = useCallback((index, height) => {
    heightCache.current.set(index, height);
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  }, []);

  // Get item height with caching
  const getItemHeight = useCallback((index) => {
    return heightCache.current.get(index) || ESTIMATED_MESSAGE_HEIGHT;
  }, []);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (shouldAutoScroll && listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll events
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested) {
      const isAtBottom = scrollOffset >= (listRef.current?.scrollHeight || 0) - listHeight - 50;
      setShouldAutoScroll(isAtBottom);
    }
  }, [listHeight]);

  // Memoized data for virtual list
  const itemData = useMemo(() => ({
    messages,
    shouldReduceMotion,
    onHeightChange: handleHeightChange
  }), [messages, shouldReduceMotion, handleHeightChange]);

  // Loading and error states
  const allItems = useMemo(() => {
    const items = [...messages];
    if (isLoading) {
      items.push({ id: 'loading', sender: 'bot', text: '', isStreaming: true });
    }
    if (error) {
      items.push({ id: 'error', sender: 'system', text: error, isError: true });
    }
    return items;
  }, [messages, isLoading, error]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-900 relative"
      style={{ 
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)'
      }}
    >
      {allItems.length > 0 ? (
        <List
          ref={listRef}
          height={listHeight}
          itemCount={allItems.length}
          itemSize={getItemHeight}
          itemData={{ ...itemData, messages: allItems }}
          onScroll={handleScroll}
          overscanCount={5}
          className="scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
        >
          {VirtualMessageItem}
        </List>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">No messages yet</p>
        </div>
      )}
      
      {/* Scroll anchor for non-virtualized scrolling */}
      <div ref={messageEndRef} style={{ height: '1px' }} />
      
      {/* Scroll to bottom button */}
      {!shouldAutoScroll && messages.length > 3 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            if (listRef.current) {
              listRef.current.scrollToItem(allItems.length - 1, 'end');
            }
          }}
          className="
            fixed z-50 bottom-[140px] right-5 md:bottom-[6rem] md:right-6
            w-11 h-11 md:w-12 md:h-12
            bg-gradient-to-br from-purple-600/95 via-purple-700/95 to-purple-800/95
            hover:from-purple-700 hover:via-purple-800 hover:to-purple-900
            text-white rounded-full shadow-lg hover:shadow-xl
            border border-purple-500/30 hover:border-purple-400/50
            transition-all duration-200 ease-out hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-purple-400/60
            backdrop-blur-sm flex items-center justify-center
          "
          aria-label="Scroll to latest message"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default memo(VirtualizedChatMessages);
