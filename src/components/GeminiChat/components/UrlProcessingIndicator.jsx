import React, { memo } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const UrlProcessingIndicator = memo(({ urlProcessing }) => {
  const { urls, status, content, error } = urlProcessing;

  if (!urls || urls.length === 0 || status === 'idle') {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return `Procesando ${urls.length} URL${urls.length > 1 ? 's' : ''}...`;
      case 'completed':
        return '';
      case 'failed':
        return error ? `Error: ${error}` : 'Error procesando URLs';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-400/40 bg-blue-500/10 shadow-blue-500/20';
      case 'completed':
        return 'border-green-400/40 bg-green-500/10 shadow-green-500/20';
      case 'failed':
        return 'border-red-400/40 bg-red-500/10 shadow-red-500/20';
      default:
        return 'border-gray-400/30 bg-gray-500/10 shadow-gray-500/10';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-300/90';
      case 'completed':
        return 'text-green-300/90';
      case 'failed':
        return 'text-red-300/90';
      default:
        return 'text-gray-300/80';
    }
  };

  return (
    <div className="flex w-full mb-2 px-3 md:px-4">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-md transition-all duration-300 ${getStatusColor()}`}>
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        {getStatusText() && (
          <span className={`text-xs font-medium ${getTextColor()} transition-colors duration-200`}>
            {getStatusText()}
          </span>
        )}
        {status === 'completed' && content && content.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-1">
            {content.slice(0, 2).map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
                title={item.title}
              >
                {item.title?.substring(0, 12)}{item.title?.length > 12 ? '...' : ''}
              </span>
            ))}
            {content.length > 2 && (
              <span className="text-xs text-white/60 px-1.5 py-0.5 rounded-full bg-white/5">+{content.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

UrlProcessingIndicator.displayName = 'UrlProcessingIndicator';

export default UrlProcessingIndicator;