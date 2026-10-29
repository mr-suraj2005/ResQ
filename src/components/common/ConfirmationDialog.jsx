import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const btnClass = confirmVariant === 'emergency' 
    ? 'btn-emergency' 
    : confirmVariant === 'navy' 
      ? 'btn-navy' 
      : 'btn-primary';

  return (
    <div 
      className="modal-backdrop" 
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-box" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="card-title">{title}</h3>
          <button
            type="button"
            className="btn-ghost btn-xs"
            onClick={onCancel}
            aria-label="Close dialog"
            style={{ padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {message && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', marginBottom: children ? '1rem' : 0 }}>{message}</p>}
          {children}
        </div>

        <div className="modal-footer">
          {cancelText && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          {confirmText && (
            <button
              type="button"
              className={`btn ${btnClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

