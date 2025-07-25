import React, { memo, useRef, useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useChatScroll } from '../../../hooks/chat/useChatScroll';
import MessageItem from './MessageItem';
import AnimatedAILogo from '../../effects/AnimatedAILogo';

const VIRTUALIZATION_THRESHOLD = 50;
const ESTIMATED_MESSAGE_HEIGHT = 90; // Adjusted for potential timestamps and grouping

// Typing indicator component
const TypingIndicator = memo(() => (
    <div className="flex w-full mb-4 px-4 md:px-6">
        <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
            <div className="flex-shrink-0 self-end w-10 h-10">
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

const ChatMessages = ({
    messages = [],
    isLoading = false,
    error = null,
    shouldReduceMotion = false,
}) => {
    const containerRef = useRef(null);
    const messageEndRef = useRef(null);
    const listRef = useRef(null);
    const [listHeight, setListHeight] = useState(400);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

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
            setIsMobile(window.innerWidth < 768);
        };
        
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        checkMobile();
        setVH();
        
        window.addEventListener('resize', checkMobile);
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('resize', setVH);
            window.removeEventListener('orientationchange', setVH);
        };
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

    // Handle scroll for non-virtualized version
    const handleScrollLocal = useCallback((e) => {
        const container = e.target;
        const threshold = 100;
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        setIsAtBottom(atBottom);
        
        if (handleScroll) {
            handleScroll(e);
        }
    }, [handleScroll]);

    const renderMessageList = () => {
        const allItems = [...groupedMessages];
        if (isLoading) allItems.push({ type: 'loading' });
        if (error) allItems.push({ type: 'error', text: error });

        if (shouldUseVirtualization) {
            const VirtualMessageItem = ({ index, style }) => {
                const item = allItems[index];
                if (!item) return null;
                if (item.type === 'loading') return <div style={style}><TypingIndicator /></div>;
                if (item.type === 'error') return <div style={style}><ErrorMessage error={item.text} /></div>;

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

        return (
            <div className="max-w-4xl mx-auto py-4">
                {stableMessages.map((message, index) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                        isFirstInGroup={message.isFirstInGroup}
                        isLastInGroup={message.isLastInGroup}
                    />
                ))}
                
                {isLoading && <TypingIndicator />}
                {error && <ErrorMessage error={error} />}
                
                {/* Extra spacing for mobile to ensure content is not hidden */}
                <div className="h-12 md:h-6"></div>
                
                {/* Scroll anchor */}
                <div ref={messageEndRef} style={{ height: '1px' }} />
            </div>
        );
    };

    return (
        <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto px-0 bg-gray-900 relative"
            style={{ 
                height: 'calc(100vh - 140px)',
                maxHeight: 'calc(100vh - 140px)',
                scrollBehavior: shouldReduceMotion ? 'auto' : 'smooth',
                // Better mobile spacing - more room for input
                paddingBottom: isMobile ? '140px' : '20px'
            }}
            onScroll={!shouldUseVirtualization ? handleScrollLocal : undefined}
        >
            {renderMessageList()}
            
            {/* Scroll to bottom button - Adjusted positioning for mobile */}
            {(!isAtBottom || showScrollButton) && messages.length > 3 && (
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