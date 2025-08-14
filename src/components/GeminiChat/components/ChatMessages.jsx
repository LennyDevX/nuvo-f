import React, { memo, useRef, useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useChatScroll } from '../../../hooks/chat/useChatScroll';
import MessageItem from './MessageItem';
import AnimatedAILogo from '../../effects/AnimatedAILogo';
import ScrollToBottomButton from './ScrollToBottomButton';

const VIRTUALIZATION_THRESHOLD = 50;
const ESTIMATED_MESSAGE_HEIGHT = 90; // Adjusted for potential timestamps and grouping

// Typing indicator component
const TypingIndicator = memo(() => (
    <div className="flex w-full mb-4 px-4 md:px-6">
        <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-purple-500/20 shadow-lg">
                <div className="flex items-center">
                    <span className="text-lg font-semibold bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-text"
                          style={{
                            backgroundImage: 'linear-gradient(100deg, #c084fc, #8b5cf6, #ec4899, #c084fc, #ffffff, #8b5cf6, #ec4899, #6366f1)',
                            backgroundSize: '300% 300%',
                            animation: 'gradientShift 12s ease-in-out infinite',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                        Thinking...
                    </span>
                </div>
            </div>
        </div>
    </div>
));

// Error component with retry
const ErrorMessage = memo(({ error, onRetry }) => (
    <div className="flex w-full mb-4 px-4 md:px-6">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm shadow-lg backdrop-blur-sm flex flex-col gap-2">
            <span>{typeof error === 'string' ? error : error.message}</span>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="bg-red-500/50 hover:bg-red-500/70 text-white font-bold py-1 px-3 rounded-md text-xs self-start transition-colors duration-200"
                >
                    Retry
                </button>
            )}
        </div>
    </div>
));

const OldErrorMessage = memo(({ error }) => (
    <div className="flex w-full mb-4 px-4 md:px-6">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm shadow-lg backdrop-blur-sm">
            {error}
        </div>
    </div>
));

const processMessagesForGrouping = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    return messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];
        
        const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender;
        const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
        
        return { ...msg, isFirstInGroup, isLastInGroup, id: msg.id || `msg-${index}` };
    });
};

const ChatMessages = memo(({ messages, isTyping, onRegenerate, isMobile, showRegenerateButton, status = 'idle', error = null, dispatch, shouldReduceMotion = false }) => {
    const containerRef = useRef(null);
    const messageEndRef = useRef(null);
    const listRef = useRef(null);
    const [listHeight, setListHeight] = useState(400);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [lastReadMessageIndex, setLastReadMessageIndex] = useState(0);

    const shouldUseVirtualization = messages.length > VIRTUALIZATION_THRESHOLD;

    const { showScrollButton, handleScroll, scrollToBottom: hookScrollToBottom } = useChatScroll(
        messages,
        shouldUseVirtualization,
        listRef,
        messageEndRef
    );

    const groupedMessages = useMemo(() => processMessagesForGrouping(messages), [messages]);
    const stableMessages = useMemo(() => groupedMessages, [groupedMessages]);

    // Mobile detection and viewport height setup
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileDevice(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                setListHeight(containerRef.current.offsetHeight);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
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

    // Update last read message index when user is at bottom
    useEffect(() => {
        if (isAtBottom && messages.length > 0) {
            setLastReadMessageIndex(messages.length - 1);
        }
    }, [isAtBottom, messages.length]);

    // Handle scroll for non-virtualized version
    const handleRetry = useCallback(() => {
        if (error && typeof error.onRetry === 'function') {
            error.onRetry();
        }
    }, [error]);

    const handleScrollLocal = useCallback((e) => {
        const container = e.target;
        const threshold = 100;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        setIsAtBottom(atBottom);
        
        if (handleScroll) {
            handleScroll(e);
        }
    }, [handleScroll]);

    // Calculate typing indicator state outside renderMessageList for reuse
    const isWaitingForResponse = status === 'waiting_for_response';
    const isStreaming = status === 'streaming';
    
    // Show typing indicator when waiting for response OR when streaming but the bot message is still empty
    const lastMessage = groupedMessages.length > 0 ? groupedMessages[groupedMessages.length - 1] : null;
    const shouldShowTypingIndicator = isWaitingForResponse || 
        (isStreaming && lastMessage && (
            lastMessage.sender === 'user' || 
            (lastMessage.sender === 'bot' && (!lastMessage.text || lastMessage.text.trim() === ''))
        ));

    const renderMessageList = () => {
        const isLoading = isWaitingForResponse || isStreaming;
        const allItems = [...groupedMessages];
        
        if (shouldShowTypingIndicator) {
            allItems.push({ type: 'loading', id: 'loading-indicator' });
        }
        // Error is now attached to a message, but we might have a general error.
        // Let's display a general error if present.
        const generalError = typeof error === 'string' ? error : null;
        if (generalError) allItems.push({ type: 'error', text: generalError, id: 'general-error' });


        if (shouldUseVirtualization) {
            const VirtualMessageItem = ({ index, style }) => {
                const item = allItems[index];
                if (!item) return null;
                if (item.type === 'loading') return <div style={style}><TypingIndicator /></div>;
                if (item.type === 'error') return <div style={style}><ErrorMessage error={item.text} onRetry={handleRetry} /></div>;

                return (
                    <div style={style}>
                        <MessageItem 
                            message={item} 
                            shouldReduceMotion={shouldReduceMotion} 
                            isFirstInGroup={item.isFirstInGroup} 
                            isLastInGroup={item.isLastInGroup} 
                        />
                    </div>
                );
            };

            return (
                <List
                    ref={listRef}
                    height={listHeight}
                    itemCount={allItems.length}
                    itemSize={() => ESTIMATED_MESSAGE_HEIGHT}
                    onScroll={handleScroll}
                    className="scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
                >
                    {VirtualMessageItem}
                </List>
            );
        }

        // Filter out empty bot messages when showing typing indicator
        const messagesToRender = shouldShowTypingIndicator 
            ? stableMessages.filter(message => {
                // Don't show empty bot messages when typing indicator is active
                if (message.sender === 'bot' && (!message.text || message.text.trim() === '')) {
                    return false;
                }
                return true;
            })
            : stableMessages;

        return (
            <div className="max-w-4xl mx-auto py-4">
                {messagesToRender.map((message, index) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                        isFirstInGroup={message.isFirstInGroup}
                        isLastInGroup={message.isLastInGroup}
                    />
                ))}
                
                {shouldShowTypingIndicator && <TypingIndicator />}
                {/* We now show errors on the message itself, but can keep a general error fallback */}
                {error && typeof error === 'string' && <ErrorMessage error={error} onRetry={handleRetry} />}
                
                {/* Extra spacing for mobile to ensure content is not hidden */}
                <div className={`${isMobileDevice ? 'h-12' : 'h-6'}`}></div>
                
                {/* Scroll anchor */}
                <div ref={messageEndRef} style={{ height: '1px' }} />
            </div>
        );
    };

    return (
        <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto px-0 chat-background relative"
            style={{ 
                height: isMobileDevice ? 'calc(100vh - 180px)' : 'calc(100vh - 140px)',
                maxHeight: isMobileDevice ? 'calc(100vh - 180px)' : 'calc(100vh - 140px)',
                scrollBehavior: shouldReduceMotion ? 'auto' : 'smooth',
                // Better mobile spacing - reduced padding for less gap
                paddingBottom: isMobileDevice ? '120px' : '20px'
            }}
            onScroll={!shouldUseVirtualization ? handleScrollLocal : undefined}
        >
            {renderMessageList()}
            
            {/* Enhanced Scroll to Bottom Button */}
            <ScrollToBottomButton
                isAtBottom={isAtBottom}
                showScrollButton={showScrollButton}
                messages={messages}
                onScrollToBottom={scrollToBottom}
                containerRef={containerRef}
                lastReadMessageIndex={lastReadMessageIndex}
                isMobile={isMobileDevice}
            />
        </div>
    );
});

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