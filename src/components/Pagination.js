'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange, onLimitChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    if (!pagination || pagination.totalRecords === 0) return null;
  }

  const { page, totalPages, totalRecords, limit } = pagination;
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: '#fff' }}>{totalRecords > 0 ? startRecord : 0}</strong> to{' '}
        <strong style={{ color: '#fff' }}>{endRecord}</strong> of{' '}
        <strong style={{ color: '#fff' }}>{totalRecords}</strong> records
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="form-select"
              style={{ width: '70px', padding: '4px 8px', fontSize: '0.8rem' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-icon"
            style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: p === page ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: p === page ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
                color: p === page ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: p === page ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-icon"
            style={{ opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
