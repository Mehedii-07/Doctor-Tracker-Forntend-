'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  LogOut, 
  Activity, 
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      name: 'Doctors',
      href: '/doctors',
      icon: Stethoscope,
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 35,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand / Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a86ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050b17',
                boxShadow: '0 4px 14px rgba(0, 210, 255, 0.4)',
              }}
            >
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                Doctor<span style={{ color: 'var(--primary)' }}>Tracker</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                HOSPITAL ADMIN PORTAL
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ display: isOpen ? 'flex' : 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              padding: '6px 12px 10px',
            }}
          >
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#00d2ff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 210, 255, 0.2)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} color={isActive ? '#00d2ff' : 'currentColor'} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {!item.badge && isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            margin: '12px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3a86ff, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'Administrator'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldCheck size={12} color="#10b981" />
                <span>{user?.role || 'Admin'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#fb7185',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
