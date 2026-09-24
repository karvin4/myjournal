import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BookOpen, Award, Compass, Github, Edit3, Save, X, Camera } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [stats, setStats] = useState({ journals: 0, goals: 0, achievements: 0 });
  const [githubConn, setGithubConn] = useState({ connected: false });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editTitle, setEditTitle] = useState(user?.title || 'Journal Scholar');

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

  return (
    <div className="animate-fade-in reading-width" style={{
      padding: '2.5rem 1.5rem 4rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <User size={14} />
          <span>Stationery Identity</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Author Profile
        </h2>
      </div>

      {/* Main Profile Card */}
      <div className="paper-card" style={{ padding: '2rem 2.25rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={isEditing ? editAvatar || user?.avatar : user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt="Profile"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
              />
              {isEditing && (
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Camera size={13} />
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '24px', fontWeight: 600, lineHeight: 1.25, color: 'var(--text-main)' }}>{user?.name || "Alex Morgan"}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{user?.email || "alex@example.com"}</p>
              <span className="badge badge-accent" style={{ marginTop: '0.35rem' }}>
                {user?.title || "Journal Scholar"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "btn-secondary" : "btn-primary"}
            style={{ fontSize: '16px' }}
          >
            {isEditing ? <X size={15} /> : <Edit3 size={15} />}
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Display Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Title / Tagline</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <button onClick={handleSave} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={20} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Journals</div>
              <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', lineHeight: 1.15 }}>{stats.journals}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={20} color="var(--success)" />
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Goals</div>
              <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', lineHeight: 1.15 }}>{stats.goals}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={20} color="var(--warning)" />
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Milestones</div>
              <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', lineHeight: 1.15 }}>{stats.achievements}</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
