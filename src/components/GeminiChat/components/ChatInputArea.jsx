import React, { useRef, useCallback, useEffect, useState } from 'react';
import { FaPaperPlane, FaBars, FaUserCircle, FaStop, FaEllipsisV, FaUpload, FaSearch, FaBrain, FaImage, FaCode, FaMicrophone } from 'react-icons/fa';

const ChatInputArea = ({
  input,
  setInput,
  onSendMessage,
  isLoading = false,
  isInitializing = false,
  toggleLeftSidebar,
  toggleRightSidebar,
  leftSidebarOpen = false,
  rightSidebarOpen = false,
  onNewConversation,
  hasMessages = false
}) => {
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);

  // Auto-focus input on desktop
  useEffect(() => {
    if (window.innerWidth >= 768 && inputRef.current && !isInitializing) {
      inputRef.current.focus();
    }
  }, [isInitializing]);

  // Close features menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFeaturesMenu && !e.target.closest('.features-menu-container')) {
        setShowFeaturesMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFeaturesMenu]);

  // Handle input change with auto-resize
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [setInput]);

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(e);
    }
    
    // Smart keyboard shortcuts
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      setShowFeaturesMenu(false);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      onNewConversation?.();
    }
  }, [onSendMessage, onNewConversation]);

  // Future features list
  const futureFeatures = [
    { id: 'upload', icon: FaUpload, label: 'Upload Files', description: 'Share documents and images' },
    { id: 'web-search', icon: FaSearch, label: 'Web Search', description: 'Real-time web information' },
    { id: 'reasoning', icon: FaBrain, label: 'Advanced Reasoning', description: 'Deep analysis mode' },
    { id: 'image-gen', icon: FaImage, label: 'Image Generation', description: 'Create AI images' },
    { id: 'code-assist', icon: FaCode, label: 'Code Assistant', description: 'Programming help' },
    { id: 'voice', icon: FaMicrophone, label: 'Voice Input', description: 'Speak to chat' }
  ];

  // Handle feature click
  const handleFeatureClick = useCallback((featureId) => {
    console.log(`Future feature clicked: ${featureId}`);
    setShowFeaturesMenu(false);
    // TODO: Implement feature handlers
  }, []);

  return (
    <div className="
      fixed md:relative 
      bottom-16 md:bottom-0 
      left-0 md:left-auto 
      right-0 md:right-auto 
      md:w-full
      border-t border-purple-500/20 
      bg-gray-800/98 
      backdrop-blur-md 
      p-3 md:p-4 
      shadow-2xl
      z-[90] md:z-auto
    ">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSendMessage} className="relative">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Left sidebar toggle - Desktop only */}
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className={`
                hidden md:flex items-center justify-center
                w-12 h-12 rounded-xl transition-all duration-200 ease-out
                border-2 shadow-lg flex-shrink-0
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                ${leftSidebarOpen 
                  ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 border-purple-500 text-white shadow-purple-500/30 scale-105' 
                  : 'bg-gray-700/80 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700 hover:scale-105'
                }
              `}
              aria-label="Toggle AI tools menu"
              aria-expanded={leftSidebarOpen}
            >
              <FaBars className="w-4 h-4" />
            </button>

            {/* Input container */}
            <div className="flex-1 relative min-w-0">
              <textarea
                ref={(el) => {
                  inputRef.current = el;
                  textareaRef.current = el;
                }}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Message Nuvos AI..."
                className="
                  w-full resize-none rounded-xl 
                  border-2 border-purple-500/30 
                  bg-gray-700/95 backdrop-blur-sm 
                  px-4 py-3 pr-24 md:pr-20
                  text-white placeholder-gray-400 
                  focus:border-purple-500 focus:outline-none 
                  focus:ring-2 focus:ring-purple-500/20 
                  focus:bg-gray-700
                  text-base md:text-base 
                  transition-all duration-200
                  shadow-lg
                  min-h-[56px] md:min-h-[48px]
                  touch-manipulation
                "
                rows={1}
                style={{ maxHeight: '120px' }}
                disabled={isLoading || isInitializing}
                aria-label="Chat message input"
                aria-describedby="input-help"
              />
              
              {/* Action buttons container */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {/* Features menu button */}
                <div className="features-menu-container relative">
                  <button
                    type="button"
                    onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                    className="
                      flex items-center justify-center 
                      w-9 h-9 rounded-lg
                      bg-gray-600/80 hover:bg-gray-600 text-gray-300 hover:text-white
                      transition-all duration-200 ease-out
                      shadow-md hover:shadow-lg
                      touch-manipulation
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                    "
                    aria-label="More features"
                    aria-expanded={showFeaturesMenu}
                  >
                    <FaEllipsisV className="w-3 h-3" />
                  </button>
                  
                  {/* Features dropdown menu */}
                  {showFeaturesMenu && (
                    <div className="
                      absolute bottom-full right-0 mb-2
                      w-72 max-w-[90vw]
                      bg-gray-800/95 backdrop-blur-md border border-purple-500/20 rounded-xl shadow-2xl
                      overflow-hidden z-50
                    ">
                      <div className="p-3 border-b border-purple-500/20 bg-gray-700/50">
                        <h3 className="text-white font-medium text-sm">Coming Soon</h3>
                        <p className="text-gray-400 text-xs">Advanced AI features in development</p>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {futureFeatures.map((feature) => (
                          <button
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature.id)}
                            className="
                              w-full flex items-center gap-3 p-3 
                              text-left hover:bg-gray-700/50 
                              transition-colors duration-200
                              min-h-[52px] touch-manipulation
                              focus:outline-none focus:bg-gray-700/50
                              disabled:opacity-50 disabled:cursor-not-allowed
                            "
                            disabled={true}
                          >
                            <div className="
                              w-10 h-10 rounded-lg 
                              bg-purple-600/20 
                              flex items-center justify-center 
                              flex-shrink-0
                            ">
                              <feature.icon className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">
                                {feature.label}
                              </h4>
                              <p className="text-gray-400 text-xs truncate">
                                {feature.description}
                              </p>
                            </div>
                            <div className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full flex-shrink-0">
                              Soon
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isInitializing}
                  className={`
                    flex items-center justify-center 
                    w-10 h-10 md:w-9 md:h-9 rounded-xl
                    transition-all duration-200 ease-out
                    shadow-lg hover:shadow-xl
                    touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                    ${!input.trim() || isLoading || isInitializing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 hover:scale-105 active:scale-95'
                    }
                  `}
                  aria-label={isLoading ? "Stop generation" : "Send message"}
                >
                  {isLoading ? (
                    <FaStop className="w-3.5 h-3.5" />
                  ) : (
                    <FaPaperPlane className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Right sidebar toggle - Desktop only */}
            <button
              type="button"
              onClick={toggleRightSidebar}
              className={`
                hidden md:flex items-center justify-center
                w-12 h-12 rounded-xl transition-all duration-200 ease-out
                border-2 shadow-lg flex-shrink-0
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                ${rightSidebarOpen 
                  ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 border-purple-500 text-white shadow-purple-500/30 scale-105' 
                  : 'bg-gray-700/80 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700 hover:scale-105'
                }
              `}
              aria-label="Toggle profile menu"
              aria-expanded={rightSidebarOpen}
            >
              <FaUserCircle className="w-4 h-4" />
            </button>
          </div>
          
          {/* Hidden help text for screen readers */}
          <div id="input-help" className="sr-only">
            Press Enter to send, Shift+Enter for new line, Ctrl+N for new conversation
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInputArea;
