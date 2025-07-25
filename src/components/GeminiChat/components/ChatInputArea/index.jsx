import React, { useRef, useCallback, useEffect, useState } from 'react';
import { FaPaperPlane, FaBars, FaUserCircle } from 'react-icons/fa';
import FeaturesMenu from './FeaturesMenu';
import ImageUpload from './ImageUpload';
import MainInput from './MainInput';

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
  hasMessages = false,
  onSendImage // <-- Nuevo prop para enviar imagen
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-focus input on desktop
  useEffect(() => {
    if (!isMobile && inputRef.current && !isInitializing) {
      inputRef.current.focus();
    }
  }, [isInitializing, isMobile]);

  // Handle input focus on mobile - ensure visibility
  const handleInputFocus = useCallback(() => {
    if (isMobile && inputRef.current) {
      // Hide mobile navbar when keyboard opens
      const mobileNavbar = document.querySelector('nav.fixed.bottom-0');
      if (mobileNavbar) {
        mobileNavbar.style.transform = 'translateY(100%)';
        mobileNavbar.style.transition = 'transform 0.3s ease-out';
      }
      
      // Force scroll to input on focus
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [isMobile]);

  // Handle input blur - show navbar again
  const handleInputBlur = useCallback(() => {
    if (isMobile) {
      // Show mobile navbar when keyboard closes
      setTimeout(() => {
        const mobileNavbar = document.querySelector('nav.fixed.bottom-0');
        if (mobileNavbar) {
          mobileNavbar.style.transform = 'translateY(0%)';
        }
      }, 100);
    }
  }, [isMobile]);

  // Unify submission logic into a single handler
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading || isInitializing) {
      return;
    }

    if (selectedImage) {
      // If there's an image, use the onSendImage prop from the parent
      onSendImage(input, selectedImage);
    } else {
      // Otherwise, use the standard onSendMessage prop
      onSendMessage(event);
    }

    // Reset the selected image and file input after submission
    setSelectedImage(null);
    // The parent component is responsible for clearing the text input
  }, [input, selectedImage, isLoading, isInitializing, onSendImage, onSendMessage]);

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      onNewConversation?.();
    }
  }, [handleSubmit, onNewConversation]);

  // Enhanced mobile virtual keyboard handling
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentViewportHeight;
      
      // Keyboard is considered open if height difference is significant (>100px)
      const keyboardOpen = heightDifference > 100;
      const calculatedKeyboardHeight = keyboardOpen ? heightDifference : 0;
      
      setKeyboardHeight(calculatedKeyboardHeight);
      setIsKeyboardOpen(keyboardOpen);
      
      // Handle navbar visibility based on keyboard state
      const mobileNavbar = document.querySelector('nav.fixed.bottom-0');
      if (mobileNavbar) {
        if (keyboardOpen) {
          // Hide navbar when keyboard is open
          mobileNavbar.style.transform = 'translateY(100%)';
          mobileNavbar.style.transition = 'transform 0.3s ease-out';
        } else {
          // Show navbar when keyboard is closed
          mobileNavbar.style.transform = 'translateY(0%)';
          mobileNavbar.style.transition = 'transform 0.3s ease-out';
        }
      }
      
      // Update CSS custom properties
      document.documentElement.style.setProperty('--keyboard-height', `${calculatedKeyboardHeight}px`);
      document.documentElement.style.setProperty('--viewport-height', `${currentViewportHeight}px`);
      
      // Add/remove class to body for keyboard state
      if (keyboardOpen) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    // Use Visual Viewport API if available
    if ('visualViewport' in window) {
      const viewport = window.visualViewport;
      viewport.addEventListener('resize', handleViewportChange);
      handleViewportChange();
      
      return () => {
        viewport.removeEventListener('resize', handleViewportChange);
        // Cleanup: ensure navbar is visible
        const mobileNavbar = document.querySelector('nav.fixed.bottom-0');
        if (mobileNavbar) {
          mobileNavbar.style.transform = 'translateY(0%)';
        }
        document.documentElement.style.removeProperty('--keyboard-height');
        document.documentElement.style.removeProperty('--viewport-height');
        document.body.classList.remove('keyboard-open');
      };
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
      handleViewportChange();
      
      return () => {
        window.removeEventListener('resize', handleViewportChange);
        // Cleanup: ensure navbar is visible
        const mobileNavbar = document.querySelector('nav.fixed.bottom-0');
        if (mobileNavbar) {
          mobileNavbar.style.transform = 'translateY(0%)';
        }
        document.documentElement.style.removeProperty('--keyboard-height');
        document.documentElement.style.removeProperty('--viewport-height');
        document.body.classList.remove('keyboard-open');
      };
    }
  }, [isMobile]);

  // Handle input change with auto-resize
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, [setInput]);

  return (
    <>
      {/* Mobile keyboard detection style injection */}
      {isMobile && (
        <style>
          {`
            .keyboard-open {
              height: 100vh !important;
              height: 100dvh !important;
            }
            
            .keyboard-open .chat-input-container {
              position: fixed !important;
              bottom: 0 !important;
              z-index: 9999 !important;
              transform: translateY(0) !important;
            }
            
            /* Hide mobile navbar when keyboard is open */
            .keyboard-open nav.fixed.bottom-0 {
              transform: translateY(100%) !important;
              transition: transform 0.3s ease-out !important;
            }
            
            @supports (height: 100dvh) {
              .keyboard-open {
                height: 100dvh !important;
              }
            }
          `}
        </style>
      )}

      <div 
        ref={containerRef}
        className={`
          chat-input-container
          ${isMobile ? 'fixed' : 'md:relative'} 
          left-0 md:left-auto 
          right-0 md:right-auto 
          md:w-full
          border-t border-purple-500/20 
          bg-gray-800/98 
          backdrop-blur-md 
          shadow-2xl
          transition-all duration-200 ease-out
          ${isMobile 
            ? isKeyboardOpen
              ? 'z-[9999] bottom-0' // Ultra high z-index when keyboard is open
              : 'z-[150] bottom-[64px]' // Above mobile navigation when closed
            : 'z-auto bottom-0'
          }
        `}
        style={{ 
          minHeight: isMobile ? '64px' : '70px',
          ...(isMobile && isKeyboardOpen && {
            position: 'fixed',
            bottom: '0px',
            zIndex: 9999,
            transform: 'translateY(0px)'
          })
        }}
      >
        <div className="max-w-4xl mx-auto px-3 py-2 md:p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 md:gap-3">
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
                    : 'bg-gray-500/30 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700 hover:scale-105'
                  }
                `}
                aria-label="Toggle AI tools menu"
                aria-expanded={leftSidebarOpen}
              >
                <FaBars className="w-4 h-4" />
              </button>

              {/* Input container - Mobile optimized */}
              <MainInput
                ref={inputRef}
                input={input}
                onInputChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                isLoading={isLoading}
                isInitializing={isInitializing}
                isKeyboardOpen={isKeyboardOpen}
              />

              {/* Action buttons - Mobile optimized */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Features menu button - Hide when keyboard is open on mobile */}
                <FeaturesMenu isMobile={isMobile} isKeyboardOpen={isKeyboardOpen} />
                
                {/* Botón para subir imagen */}
                <ImageUpload
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  isLoading={isLoading}
                  isInitializing={isInitializing}
                />

                {/* Send button - ahora usa handleSendMultimodal */}
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isLoading || isInitializing}
                  className={`
                    flex items-center justify-center 
                    w-12 h-12 md:w-10 md:h-10 rounded-xl
                    transition-all duration-200 ease-out
                    shadow-lg hover:shadow-xl
                    touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                    ${(!input.trim() && !selectedImage) || isLoading || isInitializing
                      ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed opacity-60 border-2 border-gray-500/30'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white hover:from-purple-700 hover:via-pinkk -700 hover:to-purple-800 border-purple-500 hover:border-purple-600 scale-105'
                    }
                  `}
                >
                  <FaPaperPlane className="w-4 h-4 md:w-3.5 md:h-3.5 ml-0.5" />
                </button>
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
                    : 'bg-gray-800/80 border-purple-500/40 text-purple-400 hover:border-purple-500/60 hover:bg-gray-700 hover:scale-105'
                  }
                `}
                aria-label="Toggle profile menu"
                aria-expanded={rightSidebarOpen}
              >
                <FaUserCircle className="w-4 h-4 " />
              </button>
            </div>
            {/* Hidden help text for screen readers */}
            <div id="input-help" className="sr-only">
              Press Enter to send, Shift+Enter for new line, Ctrl+N for new conversation
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatInputArea;