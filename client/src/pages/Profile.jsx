import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BookOpen, Trophy, Target, Shield, Sparkles, Github, ExternalLink, Edit3, Save, X, Camera } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [stats, setStats] = useState({ journals: 0, goals: 0, achievements: 0 });
  const [githubConn, setGithubConn] = useState({ connected: false });

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editTitle, setEditTitle] = useState(user?.title || 'Pro AI Scholar');

  useEffect(() => {
    async function fetchData() {
      try {
        const [resJ, resG, resA, resGh] = await Promise.all([
          fetch('/api/journal'),
          fetch('/api/goals'),
          fetch('/api/achievements'),
          fetch('/api/github/connection')
        ]);
        const dataJ = await resJ.json();
        const dataG = await resG.json();
        const dataA = await resA.json();
        const dataGh = await resGh.json();

        setStats({
          journals: Array.isArray(dataJ) ? dataJ.length : 0,
          goals: Array.isArray(dataG) ? dataG.length : 0,
          achievements: Array.isArray(dataA) ? dataA.length : 0
        });
        setGithubConn(dataGh);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    }
    fetchData();
  }, []);

  const handleSave = () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert("Name and Email are required");
      return;
    }
    const updated = {
      ...user,
      name: editName.trim(),
      email: editEmail.trim(),
      avatar: editAvatar.trim(),
      title: editTitle.trim()
    };
    login(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditAvatar(user?.avatar || '');
    setEditTitle(user?.title || 'Pro AI Scholar');
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          User Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Manage your personal details and view your account statistics.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        )}

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Edit Profile Details
            </h3>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={editAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                  alt="Avatar Preview"
                  style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #6366F1', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)' }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avatar Preview</span>
              </div>

              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Professional Title / Role</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Pro AI Scholar, Software Engineer"
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Avatar Image URL</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.65rem 0.85rem', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button onClick={handleCancel} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}>
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button onClick={handleSave} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}>
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', width: '100%' }}>
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
              alt="Profile Avatar"
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #6366F1', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name || "Alex Morgan"}</h3>
                <span className="badge badge-emerald">
                  <Shield size={14} /> {user?.title || "Pro AI Scholar"}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={16} color="#6366F1" />
                  <span>{user?.email || "alex.morgan@example.com"}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="#22C55E" />
                  <span>Member Since {user?.memberSince || "July 2026"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.journals}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Journal Entries</div>
        </div>

        <div className="card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={28} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.goals}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Goals</div>
        </div>

        <div className="card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={28} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.achievements}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unlocked Achievements</div>
        </div>

      </div>

      {/* Connected Integrations */}
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Connected Integrations
        </h3>
        
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.08)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Github size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>GitHub Developer Connection</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {githubConn.connected 
                    ? `Linked as @${githubConn.username} (${githubConn.isMock ? 'Sandbox Mode' : 'Live Sync'})`
                    : "Not connected yet. Connect your account in Settings to sync commits."
                  }
                </p>
              </div>
            </div>

            {githubConn.connected ? (
              <a
                href={githubConn.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <span>View GitHub Profile</span>
                <ExternalLink size={14} />
              </a>
            ) : (
              <a
                href="/settings"
                className="btn-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem', textDecoration: 'none' }}
              >
                Connect GitHub
              </a>
            )}
          </div>

          {githubConn.connected && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Public Repositories</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>{githubConn.publicRepos || 0}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Connection Mode</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366F1', marginTop: '0.25rem' }}>
                  {githubConn.isMock ? 'Offline Simulator' : 'GitHub Live Sync API'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Linked Date</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {githubConn.connectedAt ? new Date(githubConn.connectedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
