import React, { useEffect, useState } from 'react';

export const StakingSection = ({ title, icon, children, className = "" }) => (
  <div className={`nuvos-card flex flex-col h-full ${className}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 bg-indigo-900/30 rounded-lg text-indigo-400">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-white">{title}</h3>
    </div>
    <div className="flex-grow">{children}</div>
  </div>
);

export const ValueDisplay = ({ label, value, suffix = "", className = "" }) => (
  <div className={`mb-3 ${className}`}>
    <div className="text-xs sm:text-sm text-slate-400 mb-1">{label}</div>
    <div className="text-lg sm:text-xl font-medium text-white">
      {value} <span className="text-sm sm:text-base text-slate-300">{suffix}</span>
    </div>
  </div>
);

export const ProgressBar = ({ value, max, label, className = "", barColor = "bg-indigo-500" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between text-xs sm:text-sm mb-2">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}/{max}</span>
      </div>
      <div className="h-3 sm:h-2.5 bg-slate-800/70 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-500`} 
          style={{width: `${percentage}%`}}
        ></div>
      </div>
    </div>
  );
};

export const ActionButton = ({ onClick, icon, label, isPrimary = false, disabled = false, type = "button", className = "" }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg font-medium transition-all duration-200 min-h-[48px] sm:min-h-[auto] touch-manipulation";
  const primaryClasses = isPrimary 
    ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-900/20" 
    : "bg-slate-800/70 hover:bg-slate-700/90 active:bg-slate-600/90 text-slate-200 border border-slate-700/50";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]";
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${primaryClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      type={type}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
};

export const TransactionStatus = ({ tx, className = "", onReset = null }) => {
  if (!tx) return null;
  
  // Add timeout detection - a transaction is likely stuck if it's been pending for over 45 seconds
  const [potentiallyStuck, setPotentiallyStuck] = useState(false);
  
  useEffect(() => {
    let timer;
    if (tx.status === 'pending' || tx.status === 'awaiting_confirmation' || tx.status === 'preparing') {
      // Set a timer to detect potentially stuck transactions after 45 seconds
      timer = setTimeout(() => setPotentiallyStuck(true), 45000);
    } else {
      setPotentiallyStuck(false);
    }
    
    return () => clearTimeout(timer);
  }, [tx.status]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
      case 'awaiting_confirmation':
      case 'pending':
        return potentiallyStuck ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-300' : 'bg-blue-900/20 border-blue-800/30 text-blue-300';
      case 'confirmed':
        return 'bg-green-900/20 border-green-800/30 text-green-300';
      case 'failed':
        return 'bg-red-900/20 border-red-800/30 text-red-300';
      default:
        return 'bg-slate-800/30 border-slate-700/30 text-slate-300';
    }
  };
  
  const getStatusMessage = (status, type) => {
    switch (status) {
      case 'preparing':
        return potentiallyStuck ? 'Transaction preparation taking longer than expected...' : 'Preparing transaction...';
      case 'awaiting_confirmation':
        return potentiallyStuck ? 'Waiting for wallet confirmation. Did you confirm in your wallet?' : 'Please confirm in your wallet...';
      case 'pending':
        return potentiallyStuck ? 
          `Transaction might be stuck: ${type}. Try resetting.` : 
          `Transaction in progress: ${type}`;
      case 'confirmed':
        return `${type.charAt(0).toUpperCase() + type.slice(1)} successful!`;
      case 'failed':
        return `Transaction failed: ${tx.error || 'Unknown error'}`;
      default:
        return 'Processing...';
    }
  };
  
  return (
    <div className={`p-3 sm:p-4 border rounded-lg mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:justify-between ${getStatusColor(tx.status)} ${className}`}>
      <div className="flex items-start sm:items-center w-full sm:w-auto">
        <div className="flex-shrink-0 mr-3 mt-0.5 sm:mt-0">
          {tx.status === 'confirmed' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {tx.status === 'failed' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {(tx.status === 'pending' || tx.status === 'preparing' || tx.status === 'awaiting_confirmation') && (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="text-sm break-words">
            {getStatusMessage(tx.status, tx.type)}
          </div>
          {tx.hash && (
            <a
              href={`https://polygonscan.com/tx/${tx.hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs hover:underline break-all"
            >
              View on Explorer
            </a>
          )}
        </div>
      </div>
      
      {(potentiallyStuck || tx.status === 'failed') && onReset && (
        <button 
          onClick={onReset}
          className="w-full sm:w-auto sm:ml-2 px-3 py-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white transition-colors min-h-[44px] sm:min-h-[auto]"
        >
          Reset
        </button>
      )}
    </div>
  );
};
