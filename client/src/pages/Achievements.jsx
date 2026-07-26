import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Sparkles, Award, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/achievements');
        const data = await res.json();
        setAchievements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      }
    }
    fetchAchievements();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>
          <Trophy size={18} />
          <span>AI TROPHY CABINET</span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Achievements & Milestones
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Milestones, victories, and breakthrough moments automatically captured from your journals.
        </p>
      </div>

      {/* Hero Achievement Highlight Banner */}
      <div className="glass-card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
          }}>
            <Award size={34} />
          </div>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '0.35rem' }}>Master Milestone</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{achievements.length} Total Milestones Unlocked</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Keep writing entries to auto-detect new accomplishments!</p>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {achievements.map((item) => (
          <div
            key={item.id}
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderTop: '4px solid #F59E0B'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-amber">
                <Star size={14} />
                {item.category || 'Milestone'}
              </span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} />
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {item.description || 'Extracted directly from your daily journal reflections.'}
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#6366F1', fontWeight: 600 }}>Linked to Memory</span>
              <button
                onClick={() => navigate('/timeline')}
                style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>View Journal</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
