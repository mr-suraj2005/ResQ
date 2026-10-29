import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = FileQuestion, 
  title = "No records found", 
  description = "No items match your active filters or query. Try adjusting your search criteria.",
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

