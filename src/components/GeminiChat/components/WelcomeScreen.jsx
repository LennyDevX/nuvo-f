import React from 'react';
import AnimatedAILogo from '../../effects/AnimatedAILogo';

const WelcomeScreen = ({ onSuggestionClick }) => {
  const suggestions = [
    "What is Nuvos Cloud?",
    "Explain how Staking works", 
    "How the marketplace works?",
    "Tell me about Nuvos NFTs "
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6">
     
      <div className="text-center mb-6">
        
        <div className="w-32 h-32 md:w-36 md:h-36 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/20">
          <AnimatedAILogo size="md" />
        </div>
        
        <p className="text-gray-300 text-xs md:text-base max-w-md px-2">
          Your intelligent guide to blockchain, crypto, and the Nuvos ecosystem
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-2xl mb-6">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-3 md:p-4 text-left bg-gray-800/90 backdrop-blur-sm border border-purple-500/30 rounded-lg md:rounded-xl hover:border-purple-500/50 hover:bg-gray-700/90 transition-all shadow-lg"
          >
            <span className="text-white text-xs md:text-sm font-medium leading-tight">
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
