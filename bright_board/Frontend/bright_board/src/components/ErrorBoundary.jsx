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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-xl w-full border border-bw-37 rounded-lg p-6 shadow-lg">
            <h1 className="font-comic text-2xl mb-2">Something went wrong</h1>
            <p className="font-gill-sans text-bw-75 mb-4">The UI crashed unexpectedly. Please try again.</p>
            <pre className="text-bw-62 text-sm overflow-auto max-h-48 whitespace-pre-wrap">{String(this.state.error)}</pre>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-bw-12 text-white border border-bw-37 rounded hover:bg-bw-25 transition-colors"
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;