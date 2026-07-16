import React, { createContext, useContext } from 'react';
import './AlertDialog.css';

const AlertDialogContext = createContext({
  open: false,
  setOpen: () => {},
});

export function AlertDialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <AlertDialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      <div className="alert-dialog-overlay" onClick={() => onOpenChange(false)}>
        <div className="alert-dialog-wrapper" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogContent({ children }) {
  return <div className="alert-dialog-content">{children}</div>;
}

export function AlertDialogHeader({ children }) {
  return <div className="alert-dialog-header">{children}</div>;
}

export function AlertDialogTitle({ children }) {
  return <h2 className="alert-dialog-title">{children}</h2>;
}

export function AlertDialogDescription({ children }) {
  return <p className="alert-dialog-description">{children}</p>;
}

export function AlertDialogFooter({ children }) {
  return <div className="alert-dialog-footer">{children}</div>;
}

export function AlertDialogCancel({ onClick, children }) {
  const { setOpen } = useContext(AlertDialogContext);
  const handleCancel = (e) => {
    if (onClick) onClick(e);
    setOpen(false);
  };
  return (
    <button type="button" className="pet-btn-outline alert-dialog-btn-cancel" onClick={handleCancel}>
      {children || 'Cancel'}
    </button>
  );
}

export function AlertDialogAction({ onClick, children, variant = 'primary' }) {
  const { setOpen } = useContext(AlertDialogContext);
  const handleAction = async (e) => {
    if (onClick) await onClick(e);
    setOpen(false);
  };
  const btnClass = variant === 'danger' ? 'pet-btn alert-dialog-btn-action-danger' : 'pet-btn alert-dialog-btn-action';
  return (
    <button type="button" className={btnClass} onClick={handleAction}>
      {children || 'Continue'}
    </button>
  );
}
