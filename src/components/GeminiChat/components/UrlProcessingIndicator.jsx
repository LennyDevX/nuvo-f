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
        return 'border-blue-500 bg-blue-900/30';
      case 'completed':
        return 'border-green-500 bg-green-900/30';
      case 'failed':
        return 'border-red-500 bg-red-900/50';
      default:
        return 'border-gray-300 bg-gray-800/30';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-200';
      case 'completed':
        return 'text-green-200';
      case 'failed':
        return 'text-red-200';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex w-full mb-2 px-4 md:px-6">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {getStatusText()}
        </span>
        {status === 'completed' && content && content.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-2">
            {content.slice(0, 3).map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30"
                title={item.title}
              >
                {item.title?.substring(0, 20)}{item.title?.length > 20 ? '...' : ''}
              </span>
            ))}
            {content.length > 3 && (
              <span className="text-xs text-gray-400">+{content.length - 3} más</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

UrlProcessingIndicator.displayName = 'UrlProcessingIndicator';

export default UrlProcessingIndicator;