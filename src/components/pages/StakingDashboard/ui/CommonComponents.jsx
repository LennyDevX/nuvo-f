import React from 'react';

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
    <div className="text-sm text-slate-400 mb-1">{label}</div>
    <div className="text-xl font-medium text-white">{value} <span className="text-base text-slate-300">{suffix}</span></div>
  </div>
);

export const ProgressBar = ({ value, max, label, className = "", barColor = "bg-indigo-500" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-slate-800/70 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-500`} 
          style={{width: `${percentage}%`}}
        ></div>
      </div>
    </div>
  );
};

export const ActionButton = ({ onClick, icon, label, isPrimary = false, disabled = false, type = "button", className = "" }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200";
  const primaryClasses = isPrimary 
    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20" 
    : "bg-slate-800/70 hover:bg-slate-700/90 text-slate-200 border border-slate-700/50";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]";
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${primaryClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      type={type}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export const TransactionStatus = ({ tx, className = "" }) => {
  if (!tx) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
      case 'awaiting_confirmation':
      case 'pending':
        return 'bg-blue-900/20 border-blue-800/30 text-blue-300';
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
        return 'Preparing transaction...';
      case 'awaiting_confirmation':
        return 'Please confirm in your wallet...';
      case 'pending':
        return `Transaction in progress: ${type}`;
      case 'confirmed':
        return `${type.charAt(0).toUpperCase() + type.slice(1)} successful!`;
      case 'failed':
        return `Transaction failed: ${tx.error || 'Unknown error'}`;
      default:
        return 'Processing...';
    }
  };
  
  return (
    <div className={`p-3 border rounded-lg mb-4 flex items-center space-x-3 ${getStatusColor(tx.status)} ${className}`}>
      <div className="flex-shrink-0">
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
      <div className="flex-grow">
        <div className="text-sm">
          {getStatusMessage(tx.status, tx.type)}
        </div>
        {tx.hash && (
          <a
            href={`https://polygonscan.com/tx/${tx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs hover:underline"
          >
            View on Explorer
          </a>
        )}
      </div>
    </div>
  );
};
