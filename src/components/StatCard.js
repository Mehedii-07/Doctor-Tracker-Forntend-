'use client';

import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'cyan', subtitle, trend }) {
  const colorMap = {
    cyan: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#2563eb',
    },
    emerald: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#16a34a',
    },
    purple: {
      bg: '#faf5ff',
      border: '#e9d5ff',
      text: '#9333ea',
    },
    rose: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className="stat-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {value !== undefined && value !== null ? value : '...'}
          </span>
          {trend && (
            <span
              style={{
                fontSize: '0.74rem',
                color: color === 'rose' ? '#dc2626' : '#16a34a',
                fontWeight: 600,
                backgroundColor: color === 'rose' ? '#fef2f2' : '#f0fdf4',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={22} strokeWidth={2} />}
      </div>
    </div>
  );
}
