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
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 bg-red-800/50 rounded-lg text-white m-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-sm mb-4">{String(this.state.error)}</p>
          <details className="border border-red-500/50 rounded p-2">
            <summary className="cursor-pointer mb-2">Component Stack</summary>
            <pre className="text-xs overflow-auto p-2 bg-black/30 rounded max-h-60">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
