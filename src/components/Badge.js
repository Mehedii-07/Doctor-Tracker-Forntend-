'use client';

import React from 'react';

export default function Badge({ type = 'condition', value = '' }) {
  if (!value) return null;

  const valLower = value.toLowerCase();

  let badgeClass = 'badge-primary';
  let dotColor = '#64748b';

  if (valLower.includes('crit')) {
    badgeClass = 'badge-critical';
    dotColor = '#dc2626';
  } else if (valLower.includes('seri')) {
    badgeClass = 'badge-serious';
    dotColor = '#d97706';
  } else if (valLower.includes('stab') || valLower.includes('act')) {
    badgeClass = 'badge-stable';
    dotColor = '#16a34a';
  } else if (valLower.includes('chron')) {
    badgeClass = 'badge-chronic';
    dotColor = '#9333ea';
  } else if (valLower.includes('recov') || valLower.includes('disch')) {
    badgeClass = 'badge-recovering';
    dotColor = '#2563eb';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span>{value}</span>
    </span>
  );
}
