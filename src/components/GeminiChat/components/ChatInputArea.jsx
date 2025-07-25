import React, { useRef, useCallback, useEffect, useState } from 'react';
import { FaPaperPlane, FaBars, FaUserCircle, FaStop, FaEllipsisV, FaUpload, FaSearch, FaBrain, FaImage, FaCode, FaMicrophone } from 'react-icons/fa';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB, ajusta el valor si lo necesitas

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
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [inputValue, setInputValue] = React.useState('');

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const MAX_FILE_SIZE_MB = 4; // Puedes ajustar este límite según tu backend

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // The parent component is responsible for clearing the text input
  }, [input, selectedImage, isLoading, isInitializing, onSendImage, onSendMessage]);

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [setInput]);

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

  // Maneja la selección de imagen
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Solo imágenes permitidas
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_IMAGE_SIZE) {
        alert('La imagen es demasiado grande (máx 5MB). Usa una imagen más pequeña.');
        return;
      }
      setSelectedImage(file);
    }
  }, []);

  // Elimina la imagen seleccionada
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Limita el tamaño de los archivos/imágenes que puedes enviar desde el frontend
  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        alert(`El archivo es demasiado grande. Máximo permitido: ${MAX_FILE_SIZE_MB} MB`);
        return;
      }
      // ...continúa con el procesamiento normal del archivo...
    }
  }

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
              <div className="flex-1 relative min-w-0">
                <textarea
                  ref={(el) => {
                    inputRef.current = el;
                    textareaRef.current = el;
                  }}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Message"
                  className={`
                    w-full resize-none rounded-xl 
                    border-2 border-purple-800/20 
                    bg-gray-500/20 backdrop-blur-sm 
                    text-white placeholder-gray-400 
                    focus:border-purple-500 focus:outline-none 
                    focus:ring-2 focus:ring-purple-500/20 
                    focus:bg-gray-700
                    leading-tight
                    transition-all duration-200
                    shadow-lg
                    touch-manipulation
                    text-base
                    px-3 py-3
                    min-h-[48px]
                    ${isKeyboardOpen ? 'focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400' : ''}
                  `}
                  rows={1}
                  style={{ 
                    height: '48px',
                    maxHeight: '48px',
                    WebkitAppearance: 'none',
                    fontSize: '16px',
                    outline: 'none',
                    lineHeight: '1.2'
                  }}
                  disabled={isLoading || isInitializing}
                  aria-label="Chat message input"
                  aria-describedby="input-help"
                />
              </div>

              {/* Action buttons - Mobile optimized */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Features menu button - Hide when keyboard is open on mobile */}
                <div className={`features-menu-container relative ${isMobile && isKeyboardOpen ? 'hidden' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                    className="
                      flex items-center justify-center 
                      w-12 h-12 md:w-10 md:h-10 rounded-xl
                      bg-gray-500/30 hover:bg-gray-600 text-gray-300 hover:text-white
                      border-2 border-purple-800/20 hover:border-purple-500/50
                      transition-all duration-200 ease-out
                      shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                      touch-manipulation
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                    "
                    aria-label="More features"
                    aria-expanded={showFeaturesMenu}
                  >
                    <FaEllipsisV className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                  
                  {/* Backdrop overlay - Positioned relative to features menu */}
                  {showFeaturesMenu && (
                    <div 
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                      onClick={() => setShowFeaturesMenu(false)}
                    />
                  )}
                  
                  {/* Features dropdown menu - Enhanced styling with higher z-index than backdrop */}
                  {showFeaturesMenu && (
                    <div className={`
                      absolute bottom-full mb-3
                      bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl
                      overflow-hidden z-[101] animate-in slide-in-from-bottom-2 fade-in-0 duration-200
                      ${isMobile 
                        ? 'right-0 w-80 max-w-[95vw]' 
                        : 'right-0 w-80 max-w-[90vw]'
                      }
                    `}>
                      {/* Header with improved styling */}
                      <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-800/20 to-pink-800/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-base">Coming Soon</h3>
                            <p className="text-gray-300 text-sm mt-1">Advanced AI features in development</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Features list with enhanced styling */}
                      <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                        {futureFeatures.map((feature, index) => (
                          <button
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature.id)}
                            className="
                              w-full flex items-center gap-4 p-4 
                              text-left hover:bg-purple-600/10 active:bg-purple-600/20
                              transition-all duration-200 ease-out
                              min-h-[68px] touch-manipulation group
                              focus:outline-none focus:bg-purple-600/10
                              disabled:opacity-60 disabled:cursor-not-allowed
                              border-b border-gray-700/50 last:border-b-0
                            "
                            disabled={true}
                            style={{ 
                              animationDelay: `${index * 50}ms`,
                              animation: 'fadeInUp 300ms ease-out forwards'
                            }}
                          >
                            <div className="
                              w-12 h-12 rounded-xl 
                              bg-gradient-to-br from-purple-600/30 to-pink-600/30
                              flex items-center justify-center 
                              flex-shrink-0 group-hover:scale-110 transition-transform duration-200
                              border border-purple-500/20
                            ">
                              <feature.icon className="w-5 h-5 text-purple-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm mb-1 group-hover:text-purple-200 transition-colors">
                                {feature.label}
                              </h4>
                              <p className="text-gray-400 text-xs leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <div className="text-xs bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 px-3 py-1.5 rounded-full border border-yellow-500/20 font-medium">
                                Soon
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Footer with additional info */}
                      <div className="p-3 bg-gray-800/50 border-t border-purple-500/20">
                        <p className="text-xs text-gray-400 text-center">
                          🚀 More features coming in future updates
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Botón para subir imagen */}
                <button
                  type="button"
                  className="
                    flex items-center justify-center
                    w-12 h-12 md:w-10 md:h-10 rounded-xl
                    bg-gray-500/30 hover:bg-gray-600 text-gray-300 hover:text-white
                    border-2 border-purple-800/20 hover:border-purple-500/50
                    transition-all duration-200 ease-out
                    shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                    touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  "
                  aria-label="Upload image"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isInitializing}
                >
                  <FaImage className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {/* Preview de imagen seleccionada */}
                {selectedImage && (
                  <div className="relative flex items-center ml-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="preview"
                      className="w-12 h-12 object-cover rounded-xl border border-purple-500/30 shadow"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                    >×</button>
                  </div>
                )}

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
                
              