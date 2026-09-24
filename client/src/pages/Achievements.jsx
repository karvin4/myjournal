import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Calendar, Star, Feather, ExternalLink } from 'lucide-react';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/achievements');
        const data = await res.json();
        setAchievements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  return (
    <div className="animate-fade-in" style={{
      width: '100%',
      maxWidth: '1150px',
      margin: '0 auto',
      padding: '1.5rem 2rem 3.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem'
    }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Award size={14} />
          <span>Personal Cabinet</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.15rem' }}>
          Milestones & Breakthroughs
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginTop: '0.25rem' }}>
          Meaningful achievements and personal victories extracted directly from your daily reflections.
        </p>
      </div>

      {/* Hero Metric Tile */}
      <div className="paper-card" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--warning-light)',
          color: 'var(--warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Award size={26} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {achievements.length} Total Milestones Recognized
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Your personal milestone collection is built automatically from your journal entries.
          </p>
        </div>
      </div>

      {/* Empty State vs Achievements Grid */}
      {loading ? (
        <div className="paper-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your milestones...
        </div>
      ) : achievements.length === 0 ? (
        <div className="paper-card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--warning-light)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={32} />
          </div>
          <div style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              0 Total Milestones Recognized
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Your meaningful achievements will appear here as you record them in your journal. Start writing your journal to build your personal milestone collection.
            </p>
          </div>
          <button onClick={() => navigate('/write')} className="btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <Feather size={16} /> <span>Write a Journal Entry</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {achievements.map((item) => {
            const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

            return (
              <div key={item.id} className="paper-card" style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                      <Star size={12} /> {item.category || 'Milestone'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> {dateStr}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
                    {item.title}
                  </h3>

                  {item.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Source Link */}
                {item.relatedJournalId && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => navigate('/timeline', { state: { highlightId: item.relatedJournalId } })}
                      className="btn-ghost"
                      style={{
                        padding: 0,
                        fontSize: '0.8rem',
                        color: 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Open source journal entry"
                    >
                      <span>Extracted from journal entry on {dateStr}</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
