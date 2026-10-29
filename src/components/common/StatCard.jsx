import React from 'react';

export const StatCard = ({ title, value, icon: Icon, meta, accent = 'blue', badge, onClick }) => {
  const accentClass = `stat-card-accent-${accent}`;

  return (
    <div 
      className={`stat-card ${accentClass}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        {Icon && (
          <div className="stat-card-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div>
        <div className="stat-card-value">{value}</div>
        {(meta || badge) && (
          <div className="stat-card-meta">
            {badge}
            {meta && <span>{meta}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

