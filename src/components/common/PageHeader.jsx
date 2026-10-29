import React from 'react';

export const PageHeader = ({ title, subtitle, actions, breadcrumb }) => {
  return (
    <div className="page-header">
      <div>
        {breadcrumb && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            {breadcrumb}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {actions && (
        <div className="page-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

