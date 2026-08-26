import React from 'react';
import { useNotes } from '../context/NotesContext';

export default function Toast() {
  const { toasts } = useNotes();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => {
        const icon = toast.type === 'success' ? '✅' : (toast.type === 'warn' ? '⚠️' : '💡');
        const borderColor = toast.type === 'success' ? '#10b981' : (toast.type === 'warn' ? '#f59e0b' : '#6366f1');

        return (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: `1px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-primary)',
              padding: '12px 22px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'toastDescent 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              pointerEvents: 'auto'
            }}
          >
            <span>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
