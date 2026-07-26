import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Alex Morgan');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setMessage('Password reset link sent to your email!');
      return;
    }

    login({
      id: "u-101",
      name: name || "Alex Morgan",
      email: email || "alex.morgan@example.com",
      memberSince: "July 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    });
    navigate('/');
  };

  const handleGoogleSignIn = () => {
    login({
      id: "u-101",
      name: "Alex Morgan",
      email: "alex.morgan@gmail.com",
      memberSince: "July 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    });
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #22C55E 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>MyJournal AI</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Your personal AI journal that remembers, understands, and grows with you.
          </p>
        </div>

        {/* Message alert */}
        {message && (
          <div style={{ padding: '0.85rem', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.65rem 0.85rem' }}>
                <User size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.92rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.65rem 0.85rem' }}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                required
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.92rem' }}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.65rem 0.85rem' }}>
                <Lock size={18} color="var(--text-muted)" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.92rem' }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.85rem', borderRadius: '14px', marginTop: '0.5rem' }}>
            <span>{mode === 'login' ? 'Sign In to MyJournal' : mode === 'register' ? 'Create Account' : 'Reset Password'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.0 10.04.0 12s.46 3.8 1.28 5.42l4-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Mode Switcher */}
        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 700, cursor: 'pointer' }}>
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 700, cursor: 'pointer' }}>
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
