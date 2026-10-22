'use client';

import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick, title = 'Dashboard', subtitle = 'Overview & Statistics' }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuClick}
          className="btn-icon mobile-menu-toggle"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text-main)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
              display: subtitle ? 'block' : 'none',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* System Status Indicator - Hidden on smaller mobile */}
        <div
          className="header-meta-group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0fdf4',
            padding: '4px 10px',
            borderRadius: '999px',
            border: '1px solid #bbf7d0',
            fontSize: '0.74rem',
            color: '#16a34a',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              display: 'inline-block',
            }}
          />
          <span>Online</span>
        </div>

        {/* Current Date - Hidden on mobile */}
        <div
          className="header-meta-group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <Calendar size={14} />
          <span>{today}</span>
        </div>

        {/* User profile with Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor:
                user?.role === 'admin'
                  ? 'rgba(13, 148, 136, 0.12)'
                  : user?.role === 'manager'
                  ? 'rgba(2, 132, 199, 0.12)'
                  : 'rgba(100, 116, 139, 0.12)',
              color:
                user?.role === 'admin'
                  ? 'var(--primary)'
                  : user?.role === 'manager'
                  ? '#0284c7'
                  : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.84rem',
              border: `1px solid ${
                user?.role === 'admin'
                  ? 'var(--primary-border)'
                  : user?.role === 'manager'
                  ? '#bae6fd'
                  : '#e2e8f0'
              }`,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                lineHeight: 1.2,
              }}
            >
              {user?.name || 'User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor:
                    user?.role === 'admin'
                      ? '#ecfdf5'
                      : user?.role === 'manager'
                      ? '#f0f9ff'
                      : '#f8fafc',
                  color:
                    user?.role === 'admin'
                      ? '#059669'
                      : user?.role === 'manager'
                      ? '#0284c7'
                      : '#64748b',
                  border: `1px solid ${
                    user?.role === 'admin'
                      ? '#a7f3d0'
                      : user?.role === 'manager'
                      ? '#bae6fd'
                      : '#e2e8f0'
                  }`,
                }}
              >
                {user?.role === 'admin'
                  ? 'Admin'
                  : user?.role === 'manager'
                  ? 'Manager'
                  : user?.role === 'visitor'
                  ? 'Visitor (View Only)'
                  : 'Viewer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mobile-menu-toggle {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .header-meta-group {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
