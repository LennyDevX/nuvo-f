import React, { useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const MainInput = React.forwardRef(({
    input,
    onInputChange,
    onKeyPress,
    onFocus,
    onBlur,
    status,
    isDisabled,
    isKeyboardOpen,
    onSubmit,
    selectedImage,
}, forwardedRef) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (forwardedRef) {
            forwardedRef.current = textareaRef.current;
        }
    }, [forwardedRef]);

    const handleInternalInputChange = (e) => {
        onInputChange(e);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    return (
        <div className="flex-1 relative min-w-0">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInternalInputChange}
                onKeyDown={onKeyPress}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={'Ask Nuvim...'}
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
                    px-3 py-3 pr-14
                    min-h-[48px] max-h-[120px] overflow-y-auto
                    ${isKeyboardOpen ? 'focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400' : ''}
                `}
                rows={1}
                style={{
                    height: '48px',
                    maxHeight: '140px',
                    WebkitAppearance: 'none',
                    fontSize: '16px',
                    outline: 'none',
                    lineHeight: '1.2'
                }}
                disabled={isDisabled}
                aria-label="Chat message input"
                aria-describedby="input-help"
            />
            
            {/* Send button inside input area */}
            <button
                type="button"
                onClick={onSubmit}
                disabled={(!input.trim() && !selectedImage) || isDisabled}
                className={`
                    absolute md:right-3 md:top-1.5  right-3 top-2.5 my-0.5
                    flex items-center justify-center content-center

                    w-8 h-8 rounded-xl md:w-8 md:h-8 md:rounded-xl
                    transition-all duration-200 ease-out
                    shadow-lg hover:shadow-xl
                    touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-transparent
                    ${(!input.trim() && !selectedImage) || isDisabled
                      ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 hover:scale-105 active:scale-95'
                    }
                `}
                aria-label="Send message"
            >
                <FaPaperPlane className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 ml-0.5" />

            </button>
        </div>
    );
});

export default MainInput;
