import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Download, Trash2, Shield, Bell, Lock, Sparkles, CheckCircle2, Github, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  // GitHub integration states
  const [githubConn, setGithubConn] = useState({ connected: false });
  const [githubUser, setGithubUser] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    fetch('/api/github/connection')
      .then(res => res.json())
      .then(data => {
        setGithubConn(data);
        if (data.connected) {
          setGithubUser(data.username);
          setIsSandbox(data.isMock);
        }
      })
      .catch(err => console.error("Error loading github connection:", err));
  }, []);

  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!githubUser.trim() && !isSandbox) {
      setGithubError('GitHub username is required');
      return;
    }

    setIsConnecting(true);
    setGithubError('');
    try {
      const res = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: githubUser.trim(),
          token: githubToken.trim(),
          isMock: isSandbox
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGithubConn(data);
        setDownloadSuccess('GitHub account connected successfully!');
        setTimeout(() => setDownloadSuccess(''), 4000);
      } else {
        setGithubError(data.error || 'Failed to connect. Please check credentials.');
      }
    } catch (err) {
      setGithubError('Network error connecting to GitHub service.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/github/disconnect', { method: 'POST' });
      if (res.ok) {
        setGithubConn({ connected: false });
        setGithubUser('');
        setGithubToken('');
        setDownloadSuccess('GitHub account disconnected.');
        setTimeout(() => setDownloadSuccess(''), 4000);
      } else {
        alert('Failed to disconnect GitHub account.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `myjournal_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess('Journals exported as JSON format successfully!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      alert('Error exporting journals');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      let mdContent = `# MyJournal Memory Backup\nExported: ${new Date().toLocaleString()}\n\n---\n\n`;
      data.forEach(entry => {
        mdContent += `## Entry Date: ${new Date(entry.date).toLocaleDateString()}\n`;
        mdContent += `**Mood**: ${entry.moodEmoji} ${entry.mood}\n\n`;
        mdContent += `${entry.content}\n\n`;
        if (entry.goals?.length) mdContent += `*Goals*: ${entry.goals.join(', ')}\n`;
        if (entry.achievements?.length) mdContent += `*Achievements*: ${entry.achievements.join(', ')}\n`;
        mdContent += `\n---\n\n`;
      });

      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myjournal_entries_${new Date().toISOString().slice(0,10)}.md`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess('Journals exported as Markdown (.md) successfully!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      alert('Error exporting markdown');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Settings & Preferences
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Customize your appearance, data exports, privacy, and notifications.
        </p>
      </div>

      {downloadSuccess && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22C55E', borderRadius: '14px', color: '#22C55E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <Moon size={20} color="#6366F1" /> : <Sun size={20} color="#F59E0B" />}
            <span>Appearance Theme</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Current mode: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-secondary"
        >
          <span>Switch to {theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}</span>
        </button>
      </div>
      
      {/* GitHub Account Connection */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Github size={22} color={githubConn.connected ? "#22C55E" : "var(--text-main)"} />
              <span>GitHub Account Connection</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {githubConn.connected 
                ? `Successfully linked to GitHub as @${githubConn.username}`
                : "Connect your GitHub profile to import commit logs and auto-draft developer journal entries."
              }
            </p>
          </div>
          {githubConn.connected && (
            <span className={`badge ${githubConn.isMock ? 'badge-indigo' : 'badge-emerald'}`}>
              {githubConn.isMock ? 'Simulated Sandbox' : 'Live Sync Connected'}
            </span>
          )}
        </div>

        {githubError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid #F43F5E', padding: '0.85rem', borderRadius: '12px', color: '#F43F5E', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertTriangle size={16} />
            <span>{githubError}</span>
          </div>
        )}

        {githubConn.connected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={githubConn.avatarUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=150&q=80"}
                alt="GitHub Avatar"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366F1' }}
              />
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{githubConn.name || githubConn.username}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <a href={githubConn.htmlUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>
                    @{githubConn.username}
                  </a>
                  {githubConn.connectedAt && ` • Linked ${new Date(githubConn.connectedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleDisconnectGitHub} 
                className="btn-secondary" 
                style={{ border: '1px solid #F43F5E', color: '#F43F5E', padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectGitHub} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>GitHub Username</label>
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  disabled={isConnecting}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Personal Access Token <span style={{ fontWeight: 500, fontSize: '0.78rem' }}>(Optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  disabled={isConnecting}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="sandboxMode"
                checked={isSandbox}
                onChange={(e) => setIsSandbox(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366F1' }}
                disabled={isConnecting}
              />
              <label htmlFor="sandboxMode" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                Simulate account flow (Sandbox mode for testing without token/network)
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', padding: '0.65rem 1.35rem', fontSize: '0.9rem' }}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Github size={16} />
                  <span>Link GitHub Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Export Journals */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={20} color="#22C55E" />
            <span>Export Journal Data</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Download a full archive of your raw journal entries, extracted memories, and AI metadata.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportJSON} className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            <Download size={16} />
            <span>Export JSON Archive</span>
          </button>
          <button onClick={handleExportMarkdown} className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            <Download size={16} />
            <span>Export Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Privacy & Notifications */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="#6366F1" />
          <span>Privacy & Security</span>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Local Encrypted Vault Mode</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Journals stored securely on your local instance</div>
          </div>
          <input
            type="checkbox"
            checked={privacyMode}
            onChange={() => setPrivacyMode(!privacyMode)}
            style={{ width: '20px', height: '20px', accentColor: '#6366F1', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Daily Journal Reminders</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Get notified at 8:00 PM to reflect on your day</div>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            style={{ width: '20px', height: '20px', accentColor: '#22C55E', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ padding: '1.75rem', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={20} />
            <span>Delete Account & Erase Data</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Permanently delete all journal entries, goals, and AI memory embeddings.
          </p>
        </div>
        <button
          onClick={() => { if (confirm("Are you sure you want to reset data?")) alert("Data reset requested."); }}
          style={{ background: '#F43F5E', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Delete Account
        </button>
      </div>

    </div>
  );
}
