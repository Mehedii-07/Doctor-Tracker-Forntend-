'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: 'calc(100vw - 40px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isSuccess ? '#16a34a' : isError ? '#dc2626' : '#2563eb',
        color: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.84rem',
        fontWeight: 500,
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      {isSuccess && <CheckCircle2 size={18} />}
      {isError && <AlertCircle size={18} />}
      {!isSuccess && !isError && <Info size={18} />}
      
      <span style={{ flex: 1, wordBreak: 'break-word' }}>{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
