import React, { useRef, useCallback } from 'react';
import { FaPaperPlane, FaBars, FaUserCircle, FaStop } from 'react-icons/fa';

const ChatInputArea = ({
  input,
  setInput,
  onSendMessage,
  isLoading = false,
  isInitializing = false,
  toggleLeftSidebar,
  toggleRightSidebar,
  leftSidebarOpen = false,
  rightSidebarOpen = false
}) => {
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

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
  }, [onSendMessage]);

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
          <div className="flex items-center gap-2 md:gap-3">
            {/* Left sidebar toggle - Desktop only */}
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className={`
                hidden md:flex items-center justify-center
                w-12 h-12 rounded-xl transition-all duration-200
                border-2 shadow-lg flex-shrink-0
                ${leftSidebarOpen 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/25' 
                  : 'bg-gray-700/80 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700'
                }
              `}
              aria-label="Toggle tools menu"
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
                  px-4 py-3 pr-14 
                  text-white placeholder-gray-400 
                  focus:border-purple-500 focus:outline-none 
                  focus:ring-2 focus:ring-purple-500/20 
                  focus:bg-gray-700
                  text-base md:text-base 
                  transition-all duration-200
                  shadow-lg
                  min-h-[48px] md:min-h-[48px]
                "
                rows={1}
                style={{ maxHeight: '120px' }}
                disabled={isLoading || isInitializing}
              />
              
              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isInitializing}
                className={`
                  absolute right-3 top-1/2 transform -translate-y-1/2 
                  flex items-center justify-center 
                  w-9 h-9 rounded-lg 
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  ${!input.trim() || isLoading || isInitializing
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 active:scale-95'
                  }
                `}
                aria-label="Send message"
              >
                {isLoading ? (
                  <FaStop className="w-4 h-4" />
                ) : (
                  <FaPaperPlane className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            </div>

            {/* Right sidebar toggle - Desktop only */}
            <button
              type="button"
              onClick={toggleRightSidebar}
              className={`
                hidden md:flex items-center justify-center
                w-12 h-12 rounded-xl transition-all duration-200
                border-2 shadow-lg flex-shrink-0
                ${rightSidebarOpen 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-purple-500/25' 
                  : 'bg-gray-700/80 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700'
                }
              `}
              aria-label="Toggle profile menu"
            >
              <FaUserCircle className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInputArea;
