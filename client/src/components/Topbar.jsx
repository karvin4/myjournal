import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Plus, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      height: '70px',
      background: 'var(--bg-card-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      transition: 'var(--transition-normal)'
    }}>
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '320px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '0.5rem 1rem',
          width: '100%',
          color: 'var(--text-muted)'
        }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search entries or memories..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/timeline');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Journal CTA */}
        <button
          onClick={() => navigate('/write')}
          className="btn-primary"
          style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
        >
          <Plus size={18} />
          <span>Quick Journal</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
        </button>

        {/* User Profile */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            cursor: 'pointer'
          }}
        >
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
            alt="User avatar"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name || "Alex Morgan"}
          </span>
        </div>
      </div>
    </header>
  );
}
