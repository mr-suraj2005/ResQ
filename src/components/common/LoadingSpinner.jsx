import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading emergency telemetry...' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : '';

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2.5rem', 
        gap: '0.75rem',
        color: 'var(--color-neutral-600)' 
      }}
      role="status"
      aria-live="polite"
    >
      <div className={`spinner ${sizeClass}`}></div>
      {message && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{message}</span>}
    </div>
  );
};

