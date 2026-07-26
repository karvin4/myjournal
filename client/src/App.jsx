import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Dashboard from './pages/Dashboard';
import WriteJournal from './pages/WriteJournal';
import Timeline from './pages/Timeline';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import AIChat from './pages/AIChat';
import WeeklySummary from './pages/WeeklySummary';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

function Layout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, background: 'var(--bg-main)', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/write" element={<WriteJournal />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/summary" element={<WeeklySummary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
