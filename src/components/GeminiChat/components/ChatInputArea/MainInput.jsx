import React, { useRef, useEffect } from 'react';

const MainInput = React.forwardRef(({
    input,
    onInputChange,
    onKeyPress,
    onFocus,
    onBlur,
    status,
    isDisabled,
    isKeyboardOpen,
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
                    px-3 py-3
                    min-h-[48px] max-h-[120px] overflow-y-auto
                    ${isKeyboardOpen ? 'focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400' : ''}
                `}
                rows={1}
                style={{
                    height: '48px',
                    maxHeight: '120px',
                    WebkitAppearance: 'none',
                    fontSize: '16px',
                    outline: 'none',
                    lineHeight: '1.2'
                }}
                disabled={isDisabled}
                aria-label="Chat message input"
                aria-describedby="input-help"
            />
        </div>
    );
});

export default MainInput;
