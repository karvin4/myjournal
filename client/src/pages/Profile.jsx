import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BookOpen, Trophy, Target, Shield, Sparkles, Github, ExternalLink, Edit3, Save, X, Camera, Upload } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [stats, setStats] = useState({ journals: 0, goals: 0, achievements: 0 });
  const [githubConn, setGithubConn] = useState({ connected: false });

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editTitle, setEditTitle] = useState(user?.title || 'Pro AI Scholar');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file is too large! Please choose a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
            
            <input
              type="file"
              accept="image/*"
              id="avatar-file-input"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div 
                onClick={() => document.getElementById('avatar-file-input').click()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', position: 'relative' }}
              >
                <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                  <img
                    src={editAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                    alt="Avatar Preview"
                    style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #6366F1', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)' }}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s'
                  }}>
                    <Camera size={20} />
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 700 }}>Upload Image</span>
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
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Profile Avatar Source</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-file-input').click()}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 0.85rem', width: '100%', justifyContent: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                  >
                    <Upload size={16} />
                    <span>Choose from File Manager</span>
                  </button>
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

    </div>
  );
}
