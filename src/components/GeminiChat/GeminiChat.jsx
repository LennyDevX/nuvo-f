import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUser, FaSpinner } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
import memoWithName from '../../utils/performance/memoWithName';
import { useDebounce, useOptimizedScroll } from '../../hooks/performance/useEventOptimizers';
import AnimatedAILogo from '../effects/AnimatedAILogo';

// Import remark-gfm normally, not lazily
import remarkGfm from 'remark-gfm';

// Only lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import('react-markdown'));

// Componente de mensaje de usuario memoizado
const UserMessage = memoWithName(({ message }) => (
  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
    {message.text}
  </p>
));

// Componente de mensaje del bot memoizado - con carga diferida de Markdown
const BotMessage = memoWithName(({ message, shouldReduceAnimation }) => (
  <Suspense fallback={<p className="text-sm text-gray-300">Loading message...</p>}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]} // Use the imported remarkGfm directly
      components={{
        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-purple-300 mt-2 mb-1" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-purple-200 mt-2 mb-1" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-base font-semibold text-purple-100 mt-2 mb-1" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 text-sm" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 text-sm" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        p: ({node, ...props}) => <p className="mb-2 text-sm leading-relaxed" {...props} />,
        code: ({node, inline, className, children, ...props}) =>
          inline
            ? <code className="bg-gray-700/80 px-1 rounded text-xs font-mono" {...props}>{children}</code>
            : <pre className="bg-gray-800/80 p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-pre mb-2" {...props}><code>{children}</code></pre>,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-300 my-2" {...props} />,
        a: ({node, ...props}) => <a className="text-purple-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
        table: ({node, ...props}) => <table className="min-w-full text-xs my-2 border border-gray-700" {...props} />,
        th: ({node, ...props}) => <th className="bg-gray-700/60 px-2 py-1 font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="border px-2 py-1" {...props} />,
      }}
    >
      {message.text}
    </ReactMarkdown>
  </Suspense>
));

// Componente principal
const GeminiChat = ({ shouldReduceMotion = false, isLowPerformance = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const timeoutRef = useRef(null);
  const [lastInput, setLastInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Optimización para animaciones según preferencias de usuario
  const reduceAnimation = shouldReduceMotion || isLowPerformance;

  // Cachear respuestas previas para mejorar rendimiento
  const responseCache = useRef(new Map());

  // Verificar la conexión API al inicio (optimizado)
  useEffect(() => {
    let isMounted = true;
    
    const checkApiConnection = async () => {
      try {
        const apiUrl = '/server/hello';
        const response = await fetch(apiUrl);
        
        // Solo actualizar estado si el componente sigue montado
        if (isMounted) {
          if (!response.ok) {
            console.error('Error de conexión con la API:', response.status);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al verificar la API:', error);
        }
      } finally {
        // Simular un tiempo de carga más corto en dispositivos de bajo rendimiento
        const delay = isLowPerformance ? 400 : 800;
        
        // Solo actualizar estado si el componente sigue montado
        if (isMounted) {
          setTimeout(() => {
            setIsInitializing(false);
          }, delay);
        }
      }
    };
    
    checkApiConnection();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isLowPerformance]);

  // Focus input after initialization (optimizado)
  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitializing]);

  // Convierte el historial de mensajes al formato API (memoizado)
  const formatMessagesForAPI = useCallback(() => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }, [messages]);

  // Función para procesar la respuesta en streaming (optimizada)
  const processStreamResponse = useCallback(async (reader) => {
    setStreamedResponse('');
    const decoder = new TextDecoder();
    let partialResponse = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        partialResponse += chunk;
        
        // Actualizar respuesta con menos frecuencia en dispositivos de bajo rendimiento
        if (!isLowPerformance || partialResponse.length % 20 === 0) {
          setStreamedResponse(partialResponse);
        }
      }
      
      // Asegurar que tenemos la respuesta completa al final
      setStreamedResponse(partialResponse);
      
      // Cuando termina el streaming, actualiza los mensajes con la respuesta completa
      setMessages((prev) => [
        ...prev, 
        { text: partialResponse, sender: 'bot' }
      ]);
      setStreamedResponse('');
    } catch (error) {
      console.error('Error procesando streaming:', error);
      setStreamedResponse('');
      setMessages((prev) => [
        ...prev,
        { text: `Error: ${error.message}`, sender: 'bot error' }
      ]);
    }
  }, [isLowPerformance]);

  // Función para enviar mensajes con debounce
  const sendMessageDebounced = useDebounce(async (userMessage) => {
    const cacheKey = userMessage.text;
    
    setIsLoading(true);
    setTimeoutExceeded(false);

    // Comprobar caché
    if (responseCache.current.has(cacheKey)) {
      setMessages((prev) => [
        ...prev,
        { text: responseCache.current.get(cacheKey), sender: 'bot' }
      ]);
      setIsLoading(false);
      return;
    }

    // Inicia timeout para UX resiliente
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTimeoutExceeded(true);
    }, 30000); // 30 segundos

    try {
      const apiUrl = '/server/gemini';
      const formattedMessages = [...formatMessagesForAPI(), {
        role: 'user',
        parts: [{ text: userMessage.text }]
      }];
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: formattedMessages,
          stream: true 
        }),
      });
      if (!response.ok) {
        throw new Error(`Error de servidor: ${response.status}`);
      }
      if (response.body) {
        const reader = response.body.getReader();
        await processStreamResponse(reader);
      } else {
        const text = await response.text();
        const data = JSON.parse(text);
        const botResponse = data.response || 'No se recibió respuesta';
        
        // Cache the response
        responseCache.current.set(cacheKey, botResponse);
        
        setMessages((prev) => [...prev, { 
          text: botResponse, 
          sender: 'bot' 
        }]);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMessages((prev) => [...prev, { 
        text: `Error: ${error.message}. Por favor, verifica que el servidor API esté funcionando.`, 
        sender: 'bot error' 
      }]);
    } finally {
      setIsLoading(false);
      setTimeoutExceeded(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      inputRef.current?.focus();
    }
  }, 300);

  // Función de envío de mensaje optimizada
  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLastInput(input);
    setInput('');
    
    // Send message with debounce
    sendMessageDebounced(userMessage);
  }, [input, sendMessageDebounced]);

  // Permitir cancelar la espera (memoizado)
  const handleCancelTimeout = useCallback(() => {
    setIsLoading(false);
    setTimeoutExceeded(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Permitir reintentar el último mensaje (memoizado)
  const handleRetryTimeout = useCallback(() => {
    setInput(lastInput);
    setTimeoutExceeded(false);
    setIsLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [lastInput]);

  // Función para aplicar ejemplo de consulta (memoizada)
  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  // Desplazar al último mensaje suavemente sin afectar el rendimiento
  useEffect(() => {
    if (messagesEndRef.current) {
      const behavior = reduceAnimation ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, [messages, streamedResponse, reduceAnimation]);

  // Variantes de animación basadas en preferencias
  const animationVariants = useMemo(() => ({
    fadeIn: reduceAnimation 
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5 } },
    
    fadeInScale: reduceAnimation
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, transition: { duration: 0.5 } },
      
    messageIn: reduceAnimation
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } }
  }), [reduceAnimation]);

  // Optimizar hook para eventos de scroll
  useOptimizedScroll(() => {
    // Implementado para evitar problemas de rendimiento en el desplazamiento
  }, 100);

  return (
    <div className="flex flex-col h-full w-full bg-gray-900/30 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
      {/* Overlay de timeout prolongado */}
      <AnimatePresence>
        {timeoutExceeded && (
          <m.div
            key="timeout-overlay"
            {...animationVariants.fadeIn}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <FaSpinner className="animate-spin text-4xl text-purple-400 mb-4" />
            <p className="text-amber-400 text-lg font-semibold mb-2">This is taking longer than expected...</p>
            <p className="text-gray-300 mb-4 text-sm">The AI is still processing your request. You can wait, cancel, or retry.</p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelTimeout}
                className="px-4 py-2 rounded bg-gray-700/80 text-gray-200 hover:bg-gray-600/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRetryTimeout}
                className="px-4 py-2 rounded bg-purple-600/80 text-white hover:bg-purple-700/80 transition"
              >
                Retry
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      
      {/* Message container - Optimizado para rendimiento */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent"
        style={{ height: 'calc(100% - 76px)' }}
      >
        {/* Reduced backdrop blur in low performance mode */}
        <div className={`p-4 sm:p-6 pt-16 h-full ${isLowPerformance ? 'backdrop-blur-none' : ''}`}> 
          <AnimatePresence mode="wait">
            {isInitializing ? (
              <m.div 
                key="initializing"
                {...animationVariants.fadeIn}
                className="flex flex-col items-center justify-center h-full"
              >
                <FaSpinner className="animate-spin text-4xl text-purple-400 mb-4" />
                <p className="text-gray-300">Starting chat...</p>
              </m.div>
            ) : messages.length === 0 ? (
              <m.div
                key="welcome"
                {...animationVariants.fadeInScale}
                className="flex flex-col items-center justify-center h-full text-center mt-8"
              >
                <div className="mb-4">
                  <m.div 
                    className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600/80 to-indigo-700/80 backdrop-blur-sm shadow-lg mb-4 sm:mb-6"
                    animate={reduceAnimation ? {} : { 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, 0, -2, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    <AnimatedAILogo animated={!reduceAnimation} />
                  </m.div>
                  <m.h3 
                    className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-2 sm:mb-4"
                    animate={reduceAnimation ? {} : {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    style={{ backgroundSize: '200% auto' }}
                  >
                    Nuvos AI Assistant
                  </m.h3>
                  <p className="text-gray-300 text-sm sm:text-lg max-w-xl mx-auto mb-4 sm:mb-6">
                    Interact with our AI assistant for answers about blockchain, cryptocurrencies, NFTs, and more.
                  </p>
                </div>
                
                <div className="w-full max-w-2xl px-2">
                  <p className="text-gray-400 font-medium mb-2 sm:mb-3">Try these questions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {/* Botón de sugerencia */}
                    { [
                      "What is an NFT?",
                      "Explain blockchain technology",
                      "How does staking work?",
                      "What is DeFi?"
                    ].map((suggestion, index) => (
                      <m.button 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left text-sm text-gray-300 bg-gray-800/30 hover:bg-gray-700/40 backdrop-blur-sm p-3 rounded-lg border border-gray-700/30 transition"
                        whileHover={reduceAnimation ? {} : { scale: 1.02, borderColor: "rgba(168, 85, 247, 0.5)" }}
                        whileTap={reduceAnimation ? {} : { scale: 0.98 }}
                      >
                        {suggestion}
                      </m.button>
                    ))}
                  </div>
                </div>
              </m.div>
            ) : (
              <m.div 
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5 pb-3 mt-6"
              >
                {messages.map((msg, index) => (
                  <m.div 
                    key={index}
                    {...animationVariants.messageIn}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 
                        ${msg.sender === 'user' ? 'bg-indigo-600/80 backdrop-blur-sm ml-2' : 'bg-purple-800/80 backdrop-blur-sm mr-2'} 
                        ${msg.text.includes('Error:') ? 'bg-red-700/80 backdrop-blur-sm' : ''}`}
                      >
                        {msg.sender === 'user' ? 
                          <FaUser className="text-white text-xs" /> : 
                          <div className="w-7 h-7 flex items-center justify-center">
                            <AnimatedAILogo animated={!reduceAnimation} />
                          </div>
                        }
                      </div>
                      <div className={`py-3 px-4 rounded-2xl 
                        ${msg.sender === 'user' 
                          ? 'bg-indigo-600/60 backdrop-blur-sm text-white rounded-tr-none' 
                          : 'bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none'}
                        ${msg.text.includes('Error:') ? 'bg-red-900/40 backdrop-blur-sm border-l-2 border-red-500' : ''}`}
                      >
                        {msg.sender === 'user' ? 
                          <UserMessage message={msg} /> : 
                          <BotMessage message={msg} shouldReduceAnimation={reduceAnimation} />
                        }
                      </div>
                    </div>
                  </m.div>
                ))}
                
                {/* Muestra la respuesta que está llegando en streaming */}
                {isLoading && streamedResponse ? (
                  <m.div 
                    {...animationVariants.messageIn}
                    className="flex justify-start"
                  >
                    <div className="flex flex-row">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-800/80 backdrop-blur-sm mr-2">
                        <div className="w-7 h-7 flex items-center justify-center">
                          <AnimatedAILogo animated={!reduceAnimation} />
                        </div>
                      </div>
                      <div className="py-3 px-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none">
                        <Suspense fallback={<p className="text-sm text-gray-300">Loading response...</p>}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]} // Use the imported remarkGfm directly
                            skipHtml={isLowPerformance}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold text-purple-300 mt-2 mb-1" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-purple-200 mt-2 mb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-purple-100 mt-2 mb-1" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 text-sm" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 text-sm" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 text-sm leading-relaxed" {...props} />,
                              code: ({node, inline, className, children, ...props}) =>
                                inline
                                  ? <code className="bg-gray-700/80 px-1 rounded text-xs font-mono" {...props}>{children}</code>
                                  : <pre className="bg-gray-800/80 p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-pre mb-2" {...props}><code>{children}</code></pre>,
                            }}
                          >
                            {streamedResponse}
                          </ReactMarkdown>
                        </Suspense>
                      </div>
                    </div>
                  </m.div>
                ) : isLoading && (
                  <m.div 
                    {...animationVariants.messageIn}
                    className="flex justify-start"
                  >
                    <div className="flex flex-row">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-800/80 backdrop-blur-sm mr-2">
                        <div className="w-7 h-7 flex items-center justify-center">
                          <AnimatedAILogo animated={!reduceAnimation} />
                        </div>
                      </div>
                      <div className="py-3 px-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none">
                        <div className="flex space-x-2">
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={reduceAnimation ? {} : { scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          />
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={reduceAnimation ? {} : { scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          />
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={reduceAnimation ? {} : { scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                          />
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Input Form - Optimizado */}
      <div className={`border-t border-gray-800/50 ${isLowPerformance ? 'bg-gray-900' : 'bg-gray-900/60 backdrop-blur-md'} p-4 z-10`}>
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you?"
            disabled={isLoading || isInitializing}
            className={`flex-1 ${isLowPerformance ? 'bg-gray-800' : 'bg-gray-800/30 backdrop-blur-sm'} border border-gray-700/50 focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 text-white rounded-lg py-3 px-4 outline-none`}
          />
          <m.button
            type="submit"
            disabled={isLoading || !input.trim() || isInitializing}
            className={`ml-3 p-3 rounded-lg ${
              isLoading || !input.trim() || isInitializing
                ? 'bg-gray-700/50 backdrop-blur-sm text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600/80 backdrop-blur-sm hover:bg-purple-700/70 text-white'
            } transition-colors`}
            whileHover={reduceAnimation ? {} : { scale: 1.05 }}
            whileTap={reduceAnimation ? {} : { scale: 0.95 }}
          >
            <FaPaperPlane className="text-sm" />
          </m.button>
        </form>
      </div>
    </div>
  );
};

export default memoWithName(GeminiChat);
