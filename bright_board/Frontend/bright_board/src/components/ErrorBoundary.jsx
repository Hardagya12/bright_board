import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center p-6 font-body">
          <div className="max-w-lg w-full bg-white border border-[#e8ebe6] rounded-[30px] p-10 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-[#ffeaea] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💥</span>
            </div>
            <h1 className="font-display text-3xl text-[#0e0f0c] mb-3">Something went wrong</h1>
            <p className="text-[#868685] mb-6 text-sm leading-relaxed">
              The page crashed unexpectedly. Don't worry — your data is safe. Try reloading the page.
            </p>
            <pre className="text-[#d03238] text-xs bg-[#ffeaea] rounded-[16px] p-4 overflow-auto max-h-32 whitespace-pre-wrap mb-6 text-left border border-[#d03238]/10">
              {String(this.state.error)}
            </pre>
            <button
              type="button"
              className="btn-wise px-8 py-3"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;