import React, { useState, useRef, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Verificar la conexión API al inicio
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const apiUrl = '/server/hello';
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          console.log('API conectada correctamente');
        } else {
          console.error('Error de conexión con la API:', response.status);
        }
      } catch (error) {
        console.error('Error al verificar la API:', error);
      } finally {
        // Simulate a small delay to show nice animations
        setTimeout(() => {
          setIsInitializing(false);
        }, 800);
      }
    };
    
    checkApiConnection();
  }, []);

  // Focus input after initialization
  useEffect(() => {
    if (!isInitializing) {
      inputRef.current?.focus();
    }
  }, [isInitializing]);

  // Convierte el historial de mensajes al formato que espera la API de Gemini
  const formatMessagesForAPI = () => {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  };

  // Función para procesar la respuesta en streaming
  const processStreamResponse = async (reader) => {
    setStreamedResponse('');
    const decoder = new TextDecoder();
    let partialResponse = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        partialResponse += chunk;
        setStreamedResponse(partialResponse);
      }
      
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
  };

  // Función para enviar mensajes a la API de Gemini
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = '/server/gemini';
      
      // Incluye el historial completo de la conversación
      const formattedMessages = [...formatMessagesForAPI(), {
        role: 'user',
        parts: [{ text: input }]
      }];
      
      // Usa streaming para respuestas más fluidas
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
      
      // Procesar la respuesta en streaming
      if (response.body) {
        const reader = response.body.getReader();
        await processStreamResponse(reader);
      } else {
        // Fallback si no hay soporte de streaming
        const text = await response.text();
        const data = JSON.parse(text);
        setMessages((prev) => [...prev, { 
          text: data.response || 'No se recibió respuesta', 
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
      inputRef.current?.focus();
    }
  };

  // Desplazar al último mensaje cuando se actualiza la lista
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamedResponse]);

  // Función para aplicar ejemplo de consulta
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900/30 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
      {/* Message container - Using padding to create space from navbar */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent"
        style={{ height: 'calc(100% - 76px)' }} // Adjusted for input area height only
      >
        {/* Adjusted padding at top for better text readability without header bar */}
        <div className="p-4 sm:p-6 pt-16 h-full"> {/* Reduced from pt-28 to pt-16 */}
          <AnimatePresence mode="wait">
            {isInitializing ? (
              <m.div 
                key="initializing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <FaSpinner className="animate-spin text-4xl text-purple-400 mb-4" />
                <p className="text-gray-300">Starting chat...</p>
              </m.div>
            ) : messages.length === 0 ? (
              <m.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center mt-8" // Added top margin
              >
                <div className="mb-4">
                  <m.div 
                    className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600/80 to-indigo-700/80 backdrop-blur-sm shadow-lg mb-4 sm:mb-6"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, 0, -2, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    <FaRobot className="text-white text-2xl sm:text-3xl" />
                  </m.div>
                  <m.h3 
                    className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-2 sm:mb-4"
                    animate={{
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
                    {[
                      "What is an NFT?",
                      "Explain blockchain technology",
                      "How does staking work?",
                      "What is DeFi?"
                    ].map((suggestion, index) => (
                      <m.button 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left text-sm text-gray-300 bg-gray-800/30 hover:bg-gray-700/40 backdrop-blur-sm p-3 rounded-lg border border-gray-700/30 transition"
                        whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
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
                className="space-y-5 pb-3 mt-6" // Added top margin for message content
              >
                {messages.map((msg, index) => (
                  <m.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 
                        ${msg.sender === 'user' ? 'bg-indigo-600/80 backdrop-blur-sm ml-2' : 'bg-purple-800/80 backdrop-blur-sm mr-2'} 
                        ${msg.text.includes('Error:') ? 'bg-red-700/80 backdrop-blur-sm' : ''}`}
                      >
                        {msg.sender === 'user' ? <FaUser className="text-white text-xs" /> : <FaRobot className="text-white text-xs" />}
                      </div>
                      <div className={`py-3 px-4 rounded-2xl 
                        ${msg.sender === 'user' 
                          ? 'bg-indigo-600/60 backdrop-blur-sm text-white rounded-tr-none' 
                          : 'bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none'}
                        ${msg.text.includes('Error:') ? 'bg-red-900/40 backdrop-blur-sm border-l-2 border-red-500' : ''}`}
                      >
                        {msg.sender === 'user' ? (
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.text}
                          </p>
                        ) : (
                          <ReactMarkdown
                            children={msg.text}
                            remarkPlugins={[remarkGfm]}
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
                          />
                        )}
                      </div>
                    </div>
                  </m.div>
                ))}
                
                {/* Muestra la respuesta que está llegando en streaming */}
                {isLoading && streamedResponse ? (
                  <m.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex flex-row">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-800/80 backdrop-blur-sm mr-2">
                        <FaRobot className="text-white text-xs" />
                      </div>
                      <div className="py-3 px-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none">
                        <ReactMarkdown
                          children={streamedResponse}
                          remarkPlugins={[remarkGfm]}
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
                        />
                      </div>
                    </div>
                  </m.div>
                ) : isLoading && (
                  <m.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex flex-row">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-800/80 backdrop-blur-sm mr-2">
                        <FaRobot className="text-white text-xs" />
                      </div>
                      <div className="py-3 px-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm text-gray-100 rounded-tl-none">
                        <div className="flex space-x-2">
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          />
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          />
                          <m.div 
                            className="w-2 h-2 rounded-full bg-gray-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                          />
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}
                <div ref={messagesEndRef} className="h-2" /> {/* Increased height for better spacing at bottom */}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Input Form - Better styling */}
      <div className="border-t border-gray-800/50 bg-gray-900/60 backdrop-blur-md p-4 z-10">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you?"
            disabled={isLoading || isInitializing}
            className="flex-1 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 text-white rounded-lg py-3 px-4 outline-none"
          />
          <m.button
            type="submit"
            disabled={isLoading || !input.trim() || isInitializing}
            className={`ml-3 p-3 rounded-lg ${
              isLoading || !input.trim() || isInitializing
                ? 'bg-gray-700/50 backdrop-blur-sm text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600/80 backdrop-blur-sm hover:bg-purple-700/70 text-white'
            } transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPaperPlane className="text-sm" />
          </m.button>
        </form>
      </div>
    </div>
  );
};

export default GeminiChat;
