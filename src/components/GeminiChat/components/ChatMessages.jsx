import React, { memo, useRef, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
import AnimatedAILogo from '../../effects/AnimatedAILogo';
import remarkGfm from 'remark-gfm';

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import('react-markdown'));

// User message component
const UserMessage = memo(({ message }) => (
  <div className="flex w-full mb-4 justify-end">
    <div className="flex max-w-[85%] md:max-w-[70%]">
      <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 shadow-lg">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
      <div className="flex-shrink-0 ml-2">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <FaUser size={12} className="text-white" />
        </div>
      </div>
    </div>
  </div>
));

// AI message component
const BotMessage = memo(({ message, isThinking = false }) => (
  <div className="flex w-full mb-4">
    <div className="flex max-w-[85%] md:max-w-[70%]">
      <div className="flex-shrink-0 mr-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <AnimatedAILogo reduced={true} isThinking={isThinking} size="xs" />
        </div>
      </div>
      <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3 shadow-lg border border-purple-500/20">
        <Suspense fallback={<p className="text-sm leading-relaxed text-gray-100">{message.text}</p>}>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          </div>
        </Suspense>
      </div>
    </div>
  </div>
));

// Typing indicator
const TypingIndicator = () => (
  <div className="flex w-full mb-4">
    <div className="flex max-w-[85%] md:max-w-[70%]">
      <div className="flex-shrink-0 mr-2">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <AnimatedAILogo reduced={true} isThinking={true} size="xs" />
        </div>
      </div>
      <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-purple-500/20">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Main messages container
const ChatMessages = ({ 
  messages = [], 
  isLoading = false, 
  error = null, 
  shouldReduceMotion = false 
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: shouldReduceMotion ? 'auto' : 'smooth' 
      });
    }
  }, [messages, isLoading, shouldReduceMotion]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 bg-gray-900 pb-4 md:pb-0">
      <div className="max-w-4xl mx-auto py-4">
        {messages.map((message, index) => (
          <div key={index}>
            {message.sender === 'user' ? (
              <UserMessage message={message} />
            ) : (
              <BotMessage message={message} />
            )}
          </div>
        ))}
        
        {isLoading && <TypingIndicator />}
        
        {error && (
          <div className="flex w-full mb-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Mobile spacing for input */}
      <div className="md:hidden h-32"></div>
    </div>
  );
};

export default ChatMessages;
