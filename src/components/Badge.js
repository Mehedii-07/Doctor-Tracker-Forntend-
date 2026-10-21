'use client';

import React from 'react';

export default function Badge({ type = 'condition', value = '' }) {
  if (!value) return null;

  const valLower = value.toLowerCase();

  let badgeClass = 'badge-primary';
  let dotColor = '#3a86ff';

  if (valLower.includes('crit')) {
    badgeClass = 'badge-critical';
    dotColor = '#f43f5e';
  } else if (valLower.includes('seri')) {
    badgeClass = 'badge-serious';
    dotColor = '#f59e0b';
  } else if (valLower.includes('stab') || valLower.includes('act')) {
    badgeClass = 'badge-stable';
    dotColor = '#10b981';
  } else if (valLower.includes('chron')) {
    badgeClass = 'badge-chronic';
    dotColor = '#8b5cf6';
  } else if (valLower.includes('recov') || valLower.includes('disch')) {
    badgeClass = 'badge-recovering';
    dotColor = '#00d2ff';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      {value}
    </span>
  );
}
