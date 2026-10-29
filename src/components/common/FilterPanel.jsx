import React from 'react';

export const FilterPanel = ({ 
  filters = {}, 
  activeFilters = {}, 
  onFilterChange,
  onReset
}) => {
  return (
    <div className="filter-panel" role="region" aria-label="Filters">
      {Object.entries(filters).map(([key, options]) => (
        <div key={key} className="filter-row">
          <span className="filter-title">{options.label || key}:</span>
          <div className="filter-pills" role="radiogroup">
            <button
              type="button"
              className={`filter-pill ${!activeFilters[key] || activeFilters[key] === 'ALL' ? 'active' : ''}`}
              onClick={() => onFilterChange(key, 'ALL')}
            >
              All
            </button>
            {options.items.map((item) => {
              const val = typeof item === 'object' ? item.value : item;
              const lbl = typeof item === 'object' ? item.label : item;
              const isActive = activeFilters[key] === val;
              return (
                <button
                  key={val}
                  type="button"
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onFilterChange(key, val)}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {onReset && Object.values(activeFilters).some(v => v && v !== 'ALL') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button 
            type="button" 
            className="btn btn-ghost btn-xs"
            onClick={onReset}
            style={{ color: 'var(--color-primary-600)' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

