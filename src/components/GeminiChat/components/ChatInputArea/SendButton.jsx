import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const SendButton = ({
  onSubmit,
  input,
  selectedImage,
  isDisabled,
  status
}) => {
  const isButtonDisabled = (!input.trim() && !selectedImage) || isDisabled;
  
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={isButtonDisabled}
      className={`
        flex items-center justify-center
        w-12 h-12 rounded-xl transition-all duration-200 ease-out
        border-2 shadow-lg flex-shrink-0
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
        ${isButtonDisabled
          ? 'bg-gray-500/30 border-gray-500/40 text-gray-400 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 border-purple-500 text-white shadow-purple-500/30 hover:scale-105 active:scale-95'
        }
      `}
      aria-label="Send message"
      title={isButtonDisabled ? 'Enter a message to send' : 'Send message (Enter)'}
    >
      <FaPaperPlane className="w-4 h-4" />
    </button>
  );
};

export default SendButton;