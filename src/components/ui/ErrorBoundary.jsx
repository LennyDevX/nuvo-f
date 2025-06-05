import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Report to external error tracking service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-800/50 rounded-lg text-white m-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-sm mb-4">{String(this.state.error)}</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="border border-red-500/50 rounded p-2 mb-4">
              <summary className="cursor-pointer mb-2">Component Stack (Dev Mode)</summary>
              <pre className="text-xs overflow-auto p-2 bg-black/30 rounded max-h-60 whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
            <button 
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            If this problem persists, please contact support or try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
