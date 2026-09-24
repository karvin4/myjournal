import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Feather,
  Clock,
  Compass,
  Award,
  Sparkles,
  BarChart2,
  User,
  Sliders
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Journal Hub', path: '/', icon: BookOpen },
    { name: 'Write Entry', path: '/write', icon: Feather },
    { name: 'Memories', path: '/timeline', icon: Clock },
    { name: 'Life Goals', path: '/goals', icon: Compass },
    { name: 'AI Companion', path: '/chat', icon: Sparkles },
    { name: 'Insights', path: '/summary', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Sliders },
    { name: 'Milestones', path: '/achievements', icon: Award },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'var(--transition-normal)'
    }}>
      {/* Bookshelf Brand Header */}
      <div style={{
        padding: '2rem 1.75rem 1.25rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'var(--accent-light)',
          border: '1px solid rgba(108, 99, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)'
        }}>
          <Feather size={20} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            MyJournal
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
            Personal Stationery
          </p>
        </div>
      </div>

      {/* Bookshelf Navigation Items */}
      <nav style={{
        flex: 1,
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                padding: '0.75rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                fontWeight: 500,
                fontSize: '17px',
                fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
                position: 'relative',
                transition: 'var(--transition-fast)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  {/* Left Accent Indicator Bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: '4px',
                      top: '20%',
                      bottom: '20%',
                      width: '3.5px',
                      borderRadius: '4px',
                      background: 'var(--accent)'
                    }} />
                  )}
                  <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Gemini Memory Engine Pill Card */}
      <div style={{ padding: '1.25rem 1rem' }}>
        <div style={{
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <Sparkles size={14} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="pulse-dot"></span>
              Gemini Memory Engine
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Context & Retrieval Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
