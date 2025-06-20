import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'gradient',
  className = '',
  text = '',
  showDots = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg'
  };

  // Gradient Spinner (default)
  if (variant === 'gradient') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="relative">
          <div 
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500 p-1 animate-spin`}
            style={{
              background: 'conic-gradient(from 0deg, #7c3aed, #a855f7, #ec4899, #7c3aed)',
              animation: 'spin 1.5s linear infinite'
            }}
          >
            <div className="w-full h-full rounded-full bg-gray-900" />
          </div>
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-600/20 to-pink-500/20 animate-ping`}
          />
        </div>
        {text && (
          <div className="flex items-center gap-1">
            <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
              {text}
            </span>
            {showDots && <LoadingDots />}
          </div>
        )}
      </div>
    );
  }

  // Pulse Spinner
  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-600 to-purple-400 animate-pulse`} />
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-purple-400 animate-ping`} />
          <div className={`absolute inset-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse`} style={{ animationDelay: '0.5s' }} />
        </div>
        {text && (
          <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Orbit Spinner
  if (variant === 'orbit') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 rounded-full border-2 border-purple-600/20" />
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 animate-spin"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <div 
            className="absolute inset-1 rounded-full border-2 border-transparent border-t-pink-500 animate-spin"
            style={{ animation: 'spin 1.5s linear infinite reverse' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full animate-pulse" />
          </div>
        </div>
        {text && (
          <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Dots Spinner
  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full bg-gradient-to-r from-purple-600 to-purple-400 animate-bounce`}
              style={{ 
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Ripple Spinner
  if (variant === 'ripple') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className={`relative ${sizeClasses[size]}`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-purple-600/40 animate-ping"
              style={{ 
                animationDelay: `${i * 0.4}s`,
                animationDuration: '1.2s'
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" />
          </div>
        </div>
        {text && (
          <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Bars Spinner
  if (variant === 'bars') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="flex gap-1 items-end">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`${size === 'small' ? 'w-1 h-6' : size === 'large' ? 'w-2 h-12' : 'w-1.5 h-8'} bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-pulse`}
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={`text-purple-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Hexagon Spinner
  if (variant === 'hexagon') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className={`relative ${sizeClasses[size]}`}>
          <div 
            className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 animate-spin"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              animation: 'spin 2s linear infinite'
            }}
          />
          <div 
            className="absolute inset-2 bg-gray-900"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            }}
          />
        </div>
        {text && (
          <span className={`text-red-200 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }
};

// Loading dots component for text
const LoadingDots = () => {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
          style={{ 
            animationDelay: `${i * 0.2}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
