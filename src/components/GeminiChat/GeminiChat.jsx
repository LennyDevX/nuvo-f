import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';
import memoWithName from '../../utils/performance/memoWithName';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import components
import ChatMessages from './components/ChatMessages';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInputArea from './components/ChatInputArea/index';
import { useChatState } from '../../hooks/chat/useChatState';
import { conversationManager } from './core/conversationManager';

const DEFAULT_MULTIMODAL_MODEL = 'gemini-2.5-flash-preview-04-17'; // O el que soporte imágenes

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
  
  // Use the enhanced chat state hook
  const {
    state,
    dispatch,
    handleSendMessage: handleSendMessageCore,
    handleNewConversation: handleNewConversationCore,
    checkApiConnection
  } = useChatState({ shouldReduceMotion, isLowPerformance });



  // Check API connection on mount and handle initialization
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      await checkApiConnection();
      if (isMounted) {
        // The loading of conversation is now handled inside useChatState
        // We just need to wait for the state to settle.
        setIsInitializing(false);
      }
    };

    initializeChat();

    return () => { isMounted = false; };
  }, [checkApiConnection]); // Depend on messages to react to history loading

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Nuevo handler para enviar imagen
  const handleSendImage = useCallback(async (text, imageFile) => {
    if (!imageFile) return;
    if (imageFile.size > MAX_IMAGE_SIZE) {
      alert('La imagen es demasiado grande (máx 5MB). Usa una imagen más pequeña.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result;
      const userMessage = {
        text: text?.trim() || '',
        sender: 'user',
        image: imageBase64
      };
      handleSendMessageCore({ preventDefault: () => {} }, userMessage, setInput);
    };
    reader.readAsDataURL(imageFile);
  }, [handleSendMessageCore, setInput]);

  // Wrapper para handleSendMessage que soporta multimodalidad
  const handleSendMessage = useCallback((e, inputOverride, setInputOverride) => {
    if (typeof inputOverride === 'object' && inputOverride.image) {
      handleSendMessageCore(e, inputOverride, setInputOverride || setInput);
    } else {
      handleSendMessageCore(e, input, setInput);
    }
  }, [handleSendMessageCore, input, setInput]);

  // Wrapper handlers that include input management
  const handleNewConversation = useCallback(() => {
    handleNewConversationCore();
    setInput('');
  }, [handleNewConversationCore]);

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
      {/* Mobile Header - Navbar Style */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-purple-500/20 bg-gray-900/95 backdrop-blur-md sticky top-0 z-10">
        {/* Left-side buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLeftSidebar}
            className={`btn-nuvo-base btn-nuvo-sm ${leftSidebarOpen ? 'btn-nuvo-chat-primary' : 'btn-nuvo-chat-secondary'}`}
            aria-label="Toggle AI tools menu"
            aria-expanded={leftSidebarOpen}
          >
            <FaBars className="w-5 h-5" />
          </button>
          {state.messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="btn-nuvo-base btn-nuvo-chat-primary btn-nuvo-sm"
              aria-label="Start new conversation"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Centered Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-white truncate">
            NUVOS <span className="text-purple-400">AI</span>
          </h1>
        </div>

        {/* Right-side button */}
        <div className="flex items-center">
            <button
            onClick={toggleRightSidebar}
            className={`btn-nuvo-base btn-nuvo-sm ${rightSidebarOpen ? 'btn-nuvo-chat-primary' : 'btn-nuvo-chat-secondary'}`}
            aria-label="Toggle profile menu"
            aria-expanded={rightSidebarOpen}
            >
            <FaUserCircle className="w-5 h-5" />
            </button>
        </div>
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
          status={state.status}
          error={state.error}
          dispatch={dispatch} 
          shouldReduceMotion={shouldReduceMotion}
        />
      )}

      {/* Input Area */}
      <ChatInputArea
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        status={state.status}
        isInitializing={isInitializing}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onNewConversation={handleNewConversation}
        hasMessages={state.messages.length > 0}
        isOnline={state.isOnline}
        onSendImage={handleSendImage}
      />
    </div>
  );
};

export default memoWithName(GeminiChat);
         