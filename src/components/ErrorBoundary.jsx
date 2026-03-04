import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught React error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ff3366', background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h2>
                    <p style={{ color: 'var(--text-muted)' }}>The application encountered an unexpected error.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn"
                        style={{ marginTop: '2rem', clipPath: 'none', borderRadius: '8px' }}
                    >
                        Reload Application
                    </button>
                    <details style={{ marginTop: '2rem', color: '#ff3366', opacity: 0.7, textAlign: 'left', background: 'rgba(255,51,102,0.1)', padding: '1rem', borderRadius: '8px', maxWidth: '80vw', overflow: 'auto' }}>
                        <summary>Error Details</summary>
                        <pre style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{this.state.error?.toString()}</pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
