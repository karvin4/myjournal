import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PenSquare,
  History,
  Target,
  Trophy,
  Bot,
  BarChart3,
  User,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Write Journal', path: '/write', icon: PenSquare },
    { name: 'Timeline', path: '/timeline', icon: History },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'AI Chat', path: '/chat', icon: Bot },
    { name: 'Weekly Summary', path: '/summary', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
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
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366F1 0%, #22C55E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, tracking: '-0.02em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            MyJournal <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Memory & Reflection Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#6366F1' : 'var(--text-muted)',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                textDecoration: 'none',
                transition: 'var(--transition-fast)'
              })}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Pro Banner */}
      <div style={{ padding: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            Gemini RAG Active ⚡
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Auto-extracting goals & memory context
          </p>
        </div>
      </div>
    </aside>
  );
}
