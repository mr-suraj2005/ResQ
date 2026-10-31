import React from 'react';

/**
 * Global React Error Boundary
 * Catches any rendering error in its children tree and displays a clean
 * dark-themed diagnostic card instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console for development diagnostics
    console.error('[ResQ ErrorBoundary] Caught rendering error:', error);
    console.error('[ResQ ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReload() {
    window.location.reload();
  }

  handleReset() {
    // Clear localStorage and sessionStorage then reload — resolves corrupt state crashes
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore storage errors
    }
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo } = this.state;
    const message = error?.message || 'An unexpected error occurred.';
    const stack = error?.stack || '';
    const componentStack = errorInfo?.componentStack || '';

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A192F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '860px',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#1E1E2E',
              borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            {/* ResQ Logo Mark */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  RUNTIME ERROR
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                  ResQ Disaster Response Hub
                </span>
              </div>
              <h1
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#F1F5F9',
                  margin: '0.2rem 0 0',
                  letterSpacing: '-0.02em'
                }}
              >
                Application Rendering Error
              </h1>
            </div>
          </div>

          {/* Error Message */}
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#F87171',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.45rem'
                }}
              >
                Error Message
              </div>
              <pre
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#FCA5A5',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
                }}
              >
                {message}
              </pre>
            </div>

            {/* Stack Trace */}
            {stack && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.45rem'
                  }}
                >
                  JavaScript Stack Trace
                </div>
                <pre
                  style={{
                    backgroundColor: '#0A0F1E',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.72rem',
                    color: '#64748B',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                    lineHeight: 1.7,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {stack}
                </pre>
              </div>
            )}

            {/* Component Stack */}
            {componentStack && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.45rem'
                  }}
                >
                  React Component Stack
                </div>
                <pre
                  style={{
                    backgroundColor: '#0A0F1E',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.72rem',
                    color: '#475569',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                    lineHeight: 1.7,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    maxHeight: '160px',
                    overflowY: 'auto'
                  }}
                >
                  {componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload.bind(this)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleReset.bind(this)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '999px',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.color = '#E2E8F0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                Clear State &amp; Reload
              </button>

              <a
                href="/"
                style={{
                  color: '#60A5FA',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginLeft: 'auto'
                }}
              >
                ← Return to Homepage
              </a>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '0.75rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 600 }}>
              ResQ — National Unified Disaster Emergency Network • India Command
            </span>
            <span style={{ fontSize: '0.7rem', color: '#1E3A5F', fontFamily: 'monospace' }}>
              {new Date().toISOString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

