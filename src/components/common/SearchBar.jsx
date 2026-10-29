import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search by keyword, address, or ID...', 
  onClear,
  className = ''
}) => {
  return (
    <div className={`search-wrapper ${className}`}>
      <Search size={16} className="search-icon" aria-hidden="true" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          aria-label="Clear search query"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

