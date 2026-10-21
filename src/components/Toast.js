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
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: isSuccess
          ? 'rgba(16, 185, 129, 0.95)'
          : isError
          ? 'rgba(244, 63, 94, 0.95)'
          : 'rgba(58, 134, 255, 0.95)',
        color: '#fff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.88rem',
        fontWeight: 600,
        maxWidth: '420px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {isSuccess && <CheckCircle2 size={20} />}
      {isError && <AlertCircle size={20} />}
      {!isSuccess && !isError && <Info size={20} />}
      
      <span style={{ flex: 1 }}>{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.8,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
