import React, { memo, useState, Suspense, lazy } from 'react';
import { FaUser, FaCopy, FaCheck } from 'react-icons/fa';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ReactMarkdown = lazy(() => import('react-markdown'));
const AnimatedAILogo = lazy(() => import('../../effects/AnimatedAILogo'));

const BlinkingCursor = () => <span className="ml-1 animate-pulse select-none">|</span>;

const CopyButton = memo(({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 bg-gray-700/50 hover:bg-gray-600/80 rounded-md text-gray-300 hover:text-white transition-all"
      aria-label={isCopied ? 'Copied' : 'Copy code'}
    >
      {isCopied ? <FaCheck size={12} /> : <FaCopy size={12} />}
    </button>
  );
});

// New component for rendering code blocks with syntax highlighting
const CustomParagraph = memo(({ children }) => {
  const text = React.Children.toArray(children).join('');
  if (text.toLowerCase().includes('ingredientes:') || text.toLowerCase().includes('instrucciones:')) {
    return <p className="recipe-section">{children}</p>;
  }
  return <p>{children}</p>;
});

const CodeBlock = memo(({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const codeText = String(children).replace(/\n$/, '');

  return !inline ? (
    <div className="my-4 rounded-lg bg-gray-900/70 border border-purple-900/50 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-800/50 text-xs text-gray-400">
        <span>{language}</span>
        <CopyButton text={codeText} />
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          fontSize: '0.875rem', // text-sm
        }}
        {...props}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-purple-900/50 text-purple-200 rounded-md px-1.5 py-0.5 text-sm font-mono" {...props}>
      {children}
    </code>
  );
});

const MessageItem = memo(
  ({
    message,
    isLastMessage,
    isGrouped,
    groupPosition,
    onRegenerate,
    isMobile,
    isTyping,
    showRegenerateButton,
  }) => {
    const isUser = message.sender === 'user';
    const timestamp = message.timestamp
      ? new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : '';

    // Refined bubble styles
    const messageBubbleClasses = isUser
      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
      : 'bg-gray-800/95 backdrop-blur-sm text-gray-100';

    // Refined group border radius
    const groupClasses = message.isLastInGroup
      ? ''
      : (isUser ? 'rounded-br-xl' : 'rounded-bl-xl');

    return (
      <div
        className={`group flex w-full px-2 md:px-4 ${isUser ? 'justify-end' : ''} ${message.isLastInGroup ? 'mb-2' : 'mb-0.5'}`}
      >
        <div className={`flex max-w-[92%] md:max-w-[78%] gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className="flex-shrink-0 self-end w-8 h-8 md:w-9 md:h-9">
            {message.isLastInGroup && (
              isUser ? (
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-purple-500/80 via-pink-500/80 to-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow border border-white/10">
                  <FaUser size={13} className="text-white/90" />
                </div>
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow border border-white/10">
                  <Suspense fallback={<div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" />}>
                    <AnimatedAILogo reduced={true} isThinking={message.isStreaming} size="xs" />
                  </Suspense>
                </div>
              )
            )}
          </div>
          
          <div className={`
            relative
            px-3 py-2 md:px-4 md:py-2.5
            shadow border border-purple-500/15
            rounded-2xl
            ${messageBubbleClasses}
            ${groupClasses}
            transition-all
            text-[0.97rem] md:text-base
            leading-snug
            whitespace-pre-line
            break-words
            max-w-full
            min-w-[32px]
          `}>
            {isUser ? (
              <>
                <p className="text-[0.97rem] md:text-base leading-snug break-words">{message.text}</p>
                {message.image && (
                  <img
                    src={message.image}
                    alt="user-upload"
                    className="mt-1 rounded-lg max-w-[180px] max-h-[120px] border border-purple-500/20 shadow"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </>
            ) : (
              <Suspense fallback={<p className="text-[0.97rem] leading-snug text-gray-100">{message.text}</p>}>
                <div className="prose prose-sm md:prose-base prose-invert max-w-none 
                                prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 
                                prose-strong:text-purple-300 prose-a:text-pink-400 hover:prose-a:text-pink-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      p: CustomParagraph,
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                  {message.isStreaming && <BlinkingCursor />}
                </div>
              </Suspense>
            )}
            {message.isLastInGroup && timestamp && (
              <div className="text-xs text-gray-400/70 text-right mt-0.5 -mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {timestamp}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default MessageItem;
