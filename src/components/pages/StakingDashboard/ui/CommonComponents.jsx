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

export const FriendlyAlert = ({ type = 'error', title, message, onClose, className = "" }) => {
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const getAlertStyles = (alertType) => {
    switch (alertType) {
      case 'error':
        return {
          container: 'bg-red-900/10 border-red-800/30 backdrop-blur-sm',
          icon: 'text-red-400',
          title: 'text-red-300',
          message: 'text-red-200/80'
        };
      case 'warning':
        return {
          container: 'bg-yellow-900/10 border-yellow-800/30 backdrop-blur-sm',
          icon: 'text-yellow-400',
          title: 'text-yellow-300',
          message: 'text-yellow-200/80'
        };
      case 'info':
        return {
          container: 'bg-blue-900/10 border-blue-800/30 backdrop-blur-sm',
          icon: 'text-blue-400',
          title: 'text-blue-300',
          message: 'text-blue-200/80'
        };
      default:
        return {
          container: 'bg-slate-900/20 border-slate-800/30 backdrop-blur-sm',
          icon: 'text-slate-400',
          title: 'text-slate-300',
          message: 'text-slate-200/80'
        };
    }
  };

  const styles = getAlertStyles(type);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 sm:p-5 border rounded-xl mb-4 ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-grow min-w-0">
          <h4 className={`text-sm sm:text-base font-medium mb-1 ${styles.title}`}>
            {title}
          </h4>
          <p className={`text-xs sm:text-sm leading-relaxed ${styles.message}`}>
            {message}
          </p>
        </div>
        <div className="flex-shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors duration-200 ${styles.icon}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
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
        return potentiallyStuck ? 'bg-yellow-900/10 border-yellow-800/30 text-yellow-300 backdrop-blur-sm' : 'bg-blue-900/10 border-blue-800/30 text-blue-300 backdrop-blur-sm';
      case 'confirmed':
        return 'bg-green-900/10 border-green-800/30 text-green-300 backdrop-blur-sm';
      case 'failed':
        return 'bg-red-900/10 border-red-800/30 text-red-300 backdrop-blur-sm';
      default:
        return 'bg-slate-900/10 border-slate-700/30 text-slate-300 backdrop-blur-sm';
    }
  };
  
  const getStatusMessage = (status, type) => {
    switch (status) {
      case 'preparing':
        return potentiallyStuck ? 'Taking a bit longer than usual. Network might be busy right now.' : 'Preparing your transaction...';
      case 'awaiting_confirmation':
        return potentiallyStuck ? 'Still waiting for your confirmation. Please check your wallet.' : 'Please confirm the transaction in your wallet...';
      case 'pending':
        return potentiallyStuck ? 
          `Your ${type} is taking longer than expected due to network traffic. You can reset and try again if needed.` : 
          `Your ${type} is being processed. This usually takes a few moments...`;
      case 'confirmed':
        return `Perfect! Your ${type} was completed successfully.`;
      case 'failed':
        return `Oops! Something went wrong with your ${type}. This can happen due to network issues or insufficient gas fees. Don't worry, no funds were lost.`;
      default:
        return 'Processing your transaction...';
    }
  };
  
  return (
    <div className={`p-4 sm:p-5 border rounded-xl mb-4 ${getStatusColor(tx.status)} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {tx.status === 'confirmed' && (
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {tx.status === 'failed' && (
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          {(tx.status === 'pending' || tx.status === 'preparing' || tx.status === 'awaiting_confirmation') && (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="text-sm sm:text-base font-medium mb-1">
            {tx.status === 'confirmed' && 'Transaction Successful'}
            {tx.status === 'failed' && 'Transaction Unsuccessful'}
            {(tx.status === 'pending' || tx.status === 'preparing' || tx.status === 'awaiting_confirmation') && 
              (potentiallyStuck ? 'Taking Longer Than Usual' : 'Processing Transaction')}
          </div>
          <p className="text-xs sm:text-sm text-current/80 leading-relaxed mb-2">
            {getStatusMessage(tx.status, tx.type)}
          </p>
          {tx.hash && (
            <a
              href={`https://polygonscan.com/tx/${tx.hash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline text-current/60 hover:text-current/80 transition-colors"
            >
              <span>View on Explorer</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        
        {potentiallyStuck && onReset && (
          <div className="flex-shrink-0">
            <button 
              onClick={onReset}
              className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg 
                        bg-indigo-600/80 hover:bg-indigo-600 text-white
                        transition-colors duration-200 min-h-[36px] sm:min-h-[auto]"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
