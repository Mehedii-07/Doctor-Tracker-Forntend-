'use client';

import React from 'react';
import { Menu, Activity, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick, title = 'Dashboard', subtitle = 'Overview & Statistics' }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* System Health Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.78rem',
            color: '#34d399',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              display: 'inline-block',
            }}
          />
          <span>API Connected</span>
        </div>

        {/* Current Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <Calendar size={14} />
          <span>{today}</span>
        </div>

        {/* Admin profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '14px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a86ff 100%)',
              color: '#050b17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Authorized Admin</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
