import React, { useState } from 'react';

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute z-[100] px-4 py-2 text-sm text-white bg-gray-900/95 backdrop-blur-sm 
          rounded-lg shadow-xl -top-2 -translate-y-full left-1/2 -translate-x-1/2 
          min-w-[200px] max-w-[250px] whitespace-pre-wrap text-center">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900/95 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
