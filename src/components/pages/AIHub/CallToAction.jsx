import React from 'react';

const CallToAction = () => {
  return (
    <div className="mt-16 p-8 rounded-xl nuvos-card border border-purple-500/30 transform hover:scale-[1.02] transition-transform duration-300 text-center">
      <h2 className="text-3xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
        Join the AI Revolution
      </h2>
      <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
        Become part of our growing community and experience the benefits of AI-powered solutions in the Nuvos ecosystem.
        Whether you're interested in optimizing rewards, getting personalized assistance, or accessing exclusive benefits, 
        our AI technologies are designed to enhance your journey.
      </p>
      <button className="px-8 py-4 nuvos-card rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
        Get Started with Nuvos AI
      </button>
    </div>
  );
};

export default CallToAction;
