import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Feather, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="glass-header" style={{
      height: '60px',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      transition: 'var(--transition-normal)'
    }}>
      {/* Floating Pill Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', width: '340px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '0.45rem 1.1rem',
          width: '100%',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-fast)'
        }}>
          <Search size={15} style={{ opacity: 0.7 }} />
          <input
            type="text"
            placeholder="Search entries, thoughts or goals..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/timeline');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              width: '100%',
              padding: 0
            }}
          />
          <kbd style={{
            fontSize: '0.68rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.1rem 0.4rem',
            color: 'var(--text-subtle)',
            fontWeight: 600
          }}>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Quick Journal CTA Button */}
        <button
          onClick={() => navigate('/write')}
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '16px' }}
        >
          <Feather size={15} />
          <span>Quick Journal</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-fast)'
          }}
        >
          {theme === 'dark' ? <Sun size={16} color="#E09F3E" /> : <Moon size={16} color="#6C63FF" />}
        </button>

        {/* Minimal User Profile Chip */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.28rem 0.65rem 0.28rem 0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-fast)'
          }}
        >
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
            alt="User avatar"
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name?.split(' ')[0] || "Alex"}
          </span>
        </div>
      </div>
    </header>
  );
}
