'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@doctortracker.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(0, 210, 255, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 60%), #0a0f1d',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(17, 26, 46, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(0, 210, 255, 0.1)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a86ff 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050b17',
              boxShadow: '0 8px 24px rgba(0, 210, 255, 0.4)',
              marginBottom: '16px',
            }}
          >
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Doctor<span style={{ color: 'var(--primary)' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Administrative Portal Authentication
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="form-label" htmlFor="email-input">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@doctortracker.com"
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '6px' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'rgba(0, 210, 255, 0.08)',
              border: '1px dashed rgba(0, 210, 255, 0.4)',
              color: 'var(--primary)',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <ShieldCheck size={16} />
            <span>Fill Demo Credentials (admin@doctortracker.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
