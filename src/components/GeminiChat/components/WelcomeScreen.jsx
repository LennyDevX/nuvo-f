import React from 'react';
import AnimatedAILogo from '../../effects/AnimatedAILogo';

const WelcomeScreen = ({ onSuggestionClick }) => {
  const suggestions = [
    "What is blockchain technology?",
    "Explain how NFTs work", 
    "How does crypto staking work?",
    "Tell me about DeFi protocols"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <AnimatedAILogo size="md" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          Nuvos AI Assistant
        </h1>
        <p className="text-gray-300 text-sm md:text-base max-w-md">
          Your intelligent guide to blockchain, crypto, and the Nuvos ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-4 text-left bg-gray-800 border border-purple-500/30 rounded-xl hover:border-purple-500/50 hover:bg-gray-700 transition-all shadow-lg"
          >
            <span className="text-white text-sm font-medium">
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
