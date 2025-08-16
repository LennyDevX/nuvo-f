import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { conversationManager } from '../../../GeminiChat/core/conversationManager';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const ConversationHistorySidebar = ({
  isOpen,
  onClose,
  onLoadConversation,
  currentConversationId,
  onNewChat // Add onNewChat prop
}) => {
  const focusTrapRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Performance and accessibility optimizations
  const shouldReduceMotion = useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isLowPerformance = useMemo(() => {
    // Check for low-end devices
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const hasSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    const hasSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    
    return hasSlowConnection || hasLowMemory || hasSlowCPU || shouldReduceMotion;
  }, [shouldReduceMotion]);

  // Optimized animation configurations
  const getBackdropAnimationConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      };
    }

    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    };
  }, [shouldReduceMotion]);

  const getSidebarAnimationConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      };
    }

    // Different animations for mobile and desktop
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      return {
        initial: { y: "100%", x: 0 },
        animate: { y: 0, x: 0 },
        exit: { y: "100%", x: 0 },
        transition: { 
          type: 'spring', 
          damping: isLowPerformance ? 40 : 30, 
          stiffness: isLowPerformance ? 200 : 300,
          mass: isLowPerformance ? 1.2 : 0.8
        }
      };
    } else {
      // Desktop: fade in with slight scale
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { 
          duration: 0.2,
          ease: "easeOut"
        }
      };
    }
  }, [shouldReduceMotion, isLowPerformance]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstFocusableRef.current?.focus();
        // Remove focus immediately to prevent persistent focus styling
        setTimeout(() => {
          firstFocusableRef.current?.blur();
        }, 100);
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Tab trapping
    if (e.key === 'Tab') {
      const firstElement = firstFocusableRef.current;
      const lastElement = lastFocusableRef.current;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  const [conversations, setConversations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchConversations = useCallback(() => {
    const storedConversations = conversationManager.loadConversationsFromStorage();
    setConversations(storedConversations);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      conversationManager.deleteConversation(id);
      fetchConversations();
    }
  }, [fetchConversations]);

  const handleEditClick = useCallback((conversation) => {
    setEditingId(conversation.id);
    setNewTitle(conversation.title || conversation.preview);
  }, []);

  const handleSaveEdit = useCallback((id) => {
    conversationManager.updateConversationTitle(id, newTitle);
    fetchConversations();
    setEditingId(null);
    setNewTitle('');
  }, [fetchConversations, newTitle]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setNewTitle('');
  }, []);

  return (
    <>
      {/* Backdrop with blur effect for mobile */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            onClick={onClose}
            aria-hidden="true"
            {...getBackdropAnimationConfig}
          />
        )}
      </AnimatePresence>
      
      {/* Desktop blur overlay for main content - now clickeable */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            className="hidden md:block fixed inset-0 backdrop-blur-sm z-[150] cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
            {...getBackdropAnimationConfig}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
            className="
              fixed z-[200] md:z-[300] shadow-2xl
              bottom-0 left-0 right-0 h-[90vh] rounded-t-3xl
              md:top-22 md:left-6 md:bottom-24 md:right-auto md:h-[calc(100vh-8rem)] md:w-100 md:max-w-[340px] md:rounded-2xl
              bg-gray-900/95 md:bg-gray-900/98 backdrop-blur-xl
              border-purple-500/20
              border-t-2 md:border md:border-purple-500/20
              flex flex-col
              md:shadow-2xl md:shadow-purple-900/30
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-sidebar-title"
            aria-describedby="history-sidebar-description"
            {...getSidebarAnimationConfig}
          >
            {/* Mobile drag indicator */}
            <div className="md:hidden flex justify-center pt-4 pb-3 flex-shrink-0">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header - Fixed height and proper positioning */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 md:bg-gray-800/95 border-b border-purple-500/20 p-6 md:p-5 relative flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 
                    id="history-sidebar-title"
                    className="bg-nuvo-gradient-text font-bold flex items-center gap-4 md:gap-3 text-xl md:text-2xl leading-tight mb-3 md:mb-2"
                  >
                    
                    History Chat
                  </h2>
                  <p 
                    id="history-sidebar-description" 
                    className="text-base md:text-sm text-gray-300 leading-relaxed font-medium"
                  >
                    Saved conversations
                  </p>
                </div>
                <button
                  ref={firstFocusableRef}
                  onClick={onNewChat}
                  className="
                    w-12 h-12 md:w-9 md:h-9 rounded-2xl md:rounded-xl
                    bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                    border border-purple-500/50 hover:border-purple-400/60
                    text-white hover:text-white 
                    transition-all duration-200 ease-out
                    flex items-center justify-center
                    backdrop-filter blur(8px)
                    shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                    group flex-shrink-0
                  "
                  aria-label="Start new conversation"
                  title="Start new conversation"
                  onFocus={(e) => e.target.blur()}
                >
                  <span className="text-lg md:text-sm font-bold group-hover:scale-110 transition-transform duration-200">+</span>
                </button>
              </div>
            </div>

        {/* Contenido del historial */}
        <div className="flex-1 overflow-hidden min-h-0">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
              
              <p className="text-gray-400 text-base sm:text-lg font-medium mb-2">No conversations</p>
              <p className="text-gray-500 text-xs sm:text-sm">Start a new conversation to begin</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 h-full overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {conversations.map((conv, index) => {
                  const isActive = currentConversationId === conv.id;
                  const timestamp = new Date(conv.timestamp).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <div key={conv.id} className="group relative">
                      {editingId === conv.id ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-gray-800/80 rounded-xl border border-purple-500/30">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="flex-1 bg-gray-700/80 text-white text-xs sm:text-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-gray-700 transition-all duration-200"
                            placeholder="Conversation title"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveEdit(conv.id)} 
                            className="p-1.5 sm:p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all duration-200 flex-shrink-0"
                            title="Save"
                          >
                            <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex-shrink-0"
                            title="Cancel"
                          >
                            <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => onLoadConversation(conv)}
                            className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] sm:hover:scale-[1.02] ${
                              isActive 
                                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 shadow-lg shadow-purple-500/20 text-white' 
                                : 'bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/50 text-gray-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-medium text-xs sm:text-sm mb-1 truncate">
                                  {conv.title || conv.preview || `Conversación ${index + 1}`}
                                </h3>
                                <p className="text-xs opacity-70 truncate leading-relaxed">
                                  {conv.preview && conv.preview.length > 50 
                                    ? `${conv.preview.substring(0, 50)}...` 
                                    : conv.preview || 'Sin vista previa'
                                  }
                                </p>
                                <div className="flex items-center mt-1.5 sm:mt-2 text-xs opacity-60">
                                  <span className="truncate">{timestamp}</span>
                                  <span className="mx-1 sm:mx-2">•</span>
                                  <span className="flex-shrink-0">{conv.messages?.length || 0} msg</span>
                                </div>
                              </div>
                              {isActive && (
                                <div className="ml-1 sm:ml-2 flex-shrink-0">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>
                          </button>
                          
                          {/* Botones de acción - Reposicionados debajo del contenido */}
                          <div className="flex justify-end gap-1 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(conv);
                              }}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all duration-200 flex items-center gap-1"
                              title="Edit title"
                            >
                              <FaEdit className="w-3 h-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(conv.id);
                              }}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex items-center gap-1"
                              title="Delete conversation"
                            >
                              <FaTrash className="w-3 h-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConversationHistorySidebar;