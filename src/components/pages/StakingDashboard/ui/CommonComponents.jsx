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

export const ActionButton = ({ onClick, icon, label, isPrimary = false, disabled = false, type = "button" }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200";
  const primaryClasses = isPrimary 
    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20" 
    : "bg-slate-800/70 hover:bg-slate-700/90 text-slate-200 border border-slate-700/50";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]";
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${primaryClasses} ${disabledClasses}`}
      disabled={disabled}
      type={type}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
