'use client';

import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'cyan', subtitle, trend }) {
  const colorMap = {
    cyan: {
      bg: 'rgba(0, 210, 255, 0.1)',
      border: 'rgba(0, 210, 255, 0.25)',
      text: '#00d2ff',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#34d399',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.25)',
      text: '#a78bfa',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(244, 63, 94, 0.25)',
      text: '#fb7185',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className="stat-card">
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            {value !== undefined && value !== null ? value : '...'}
          </span>
          {trend && (
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
          zIndex: 1,
        }}
      >
        {Icon && <Icon size={26} strokeWidth={2.2} />}
      </div>
    </div>
  );
}
