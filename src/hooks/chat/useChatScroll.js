import { useRef, useState, useCallback, useEffect } from 'react';

// A simple debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const useChatScroll = (messages, isVirtualized, listRef, messageEndRef) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageCountRef = useRef(0);
  const lastStreamingContentRef = useRef('');

  const handleScroll = useCallback(
    debounce((e) => {
      const container = e.target;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight <= 150;
      
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom && messages.length > 3);
    }, 100),
    [messages.length]
  );

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (isVirtualized) {
      if (listRef.current) {
        listRef.current.scrollToItem(messages.length - 1, 'end');
      }
    } else {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior, block: 'end' });
      }
    }
    setIsAtBottom(true);
    setShowScrollButton(false);
  }, [isVirtualized, listRef, messageEndRef, messages.length]);

  useEffect(() => {
    const hasNewMessage = messages.length > lastMessageCountRef.current;
    const lastMessage = messages[messages.length - 1];
    const currentStreamingContent = lastMessage?.isStreaming ? lastMessage.text : '';
    const hasStreamingUpdate = currentStreamingContent !== lastStreamingContentRef.current;
    
    if (isAtBottom && (hasNewMessage || hasStreamingUpdate)) {
      // Use a microtask to allow the DOM to update before scrolling
      queueMicrotask(() => {
        scrollToBottom('smooth');
      });
    }
    
    lastMessageCountRef.current = messages.length;
    lastStreamingContentRef.current = currentStreamingContent;
  }, [messages, isAtBottom, scrollToBottom]);

  return { showScrollButton, handleScroll, scrollToBottom };
};
