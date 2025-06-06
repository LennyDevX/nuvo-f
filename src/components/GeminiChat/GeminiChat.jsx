import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';
import memoWithName from '../../utils/performance/memoWithName';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import modular components and core functionality
import ChatMessages from './components/ChatMessages';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInputArea from './components/ChatInputArea';
import { useChatState } from '../../hooks/chat/useChatState';
import { conversationManager } from './core/conversationManager';

const GeminiChat = ({ 
  shouldReduceMotion = false, 
  isLowPerformance = false,
  toggleLeftSidebar = () => {},
  toggleRightSidebar = () => {},
  leftSidebarOpen = false,
  rightSidebarOpen = false
}) => {
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const messageEndRef = useRef(null);

  // Use the modularized chat state hook
  const {
    state,
    handleSendMessage: handleSendMessageCore,
    handleNewConversation: handleNewConversationCore,
    handleLoadConversation,
    checkApiConnection
  } = useChatState({ shouldReduceMotion, isLowPerformance });

  // Auto-save conversation when messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      const timeoutId = setTimeout(() => {
        conversationManager.saveConversationToStorage(state.messages);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.messages]);

  // Check API connection on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeChat = async () => {
      await checkApiConnection();
      
      if (isMounted) {
        setTimeout(() => setIsInitializing(false), 400);
      }
    };
    
    initializeChat();
    
    return () => { isMounted = false; };
  }, [checkApiConnection]);

  // Wrapper handlers that include input management
  const handleSendMessage = useCallback((e) => {
    handleSendMessageCore(e, input, setInput);
  }, [handleSendMessageCore, input]);

  const handleNewConversation = useCallback(() => {
    // Save current conversation if it has messages
    if (state.messages.length > 0) {
      conversationManager.saveConversationToStorage(state.messages);
    }
    
    handleNewConversationCore();
    setInput('');
  }, [state.messages, handleNewConversationCore]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
  }, []);

  // Smart keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      
      if (e.key === 'Escape') {
        if (leftSidebarOpen) toggleLeftSidebar();
        if (rightSidebarOpen) toggleRightSidebar();
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleNewConversation, leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-purple-500/20 bg-gray-900/95 backdrop-blur-md">
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
        
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">
            Nuvos AI
          </h1>
          {state.messages.length > 0 && (
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
      ) : state.messages.length === 0 ? (
        <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
      ) : (
        <ChatMessages 
          messages={state.messages}
          isLoading={state.isLoading}
          error={state.error}
          shouldReduceMotion={shouldReduceMotion}
          messageEndRef={messageEndRef}
        />
      )}

      {/* Input Area */}
      <ChatInputArea
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={state.isLoading}
        isInitializing={isInitializing}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onNewConversation={handleNewConversation}
        hasMessages={state.messages.length > 0}
      />
    </div>
  );
};

export default memoWithName(GeminiChat);
