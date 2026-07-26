import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Sparkles, X, Tag } from 'lucide-react';

export default function Timeline() {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/journal');
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch timeline:', err);
      }
    }
    fetchTimeline();
  }, []);

  const moodsList = ['All', 'Happy', 'Productive', 'Energetic', 'Reflective', 'Thoughtful', 'Fulfilled'];

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.summary && e.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (e.tags && e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesMood = selectedMood === 'All' || e.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Journal Timeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            A chronological memory stream of your experiences, reflections, and AI highlights.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', width: '300px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', width: '100%' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mood:</span>
          {moodsList.map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: selectedMood === mood ? '#6366F1' : 'var(--bg-card)',
                color: selectedMood === mood ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {filteredEntries.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No journal entries found matching your search.
          </div>
        ) : (
          filteredEntries.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              
              {/* Timeline Bullet Dot */}
              <div style={{
                position: 'absolute',
                left: '-2.15rem',
                top: '1.25rem',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#6366F1',
                border: '4px solid var(--bg-main)',
                boxShadow: '0 0 0 2px #6366F1'
              }} />

              {/* Card Content */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.moodEmoji || '😊'}</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>Mood: {item.mood}</span>
                    <span className="badge badge-indigo">
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedEntry(item)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    <Eye size={14} />
                    <span>View Full Entry</span>
                  </button>
                </div>

                {/* AI Summary */}
                <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.6, fontWeight: 500 }}>
                  "{item.summary || item.content.slice(0, 150) + '...'}"
                </p>

                {/* Tags & Extracted Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  {item.tags?.map((t, idx) => (
                    <span key={idx} className="badge badge-emerald">#{t}</span>
                  ))}
                  {item.goals?.map((g, idx) => (
                    <span key={idx} className="badge badge-amber">🎯 Goal: {g}</span>
                  ))}
                  {item.achievements?.map((a, idx) => (
                    <span key={idx} className="badge badge-purple">🏆 {a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Entry View Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{selectedEntry.moodEmoji}</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Journal Entry Detail</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(selectedEntry.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              {selectedEntry.content}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366F1' }}>
                <Sparkles size={18} />
                <span>Extracted Memory Context</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {selectedEntry.goals?.length > 0 && (
                  <div className="card" style={{ padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#22C55E' }}>🎯 Goals:</strong>
                    <div style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{selectedEntry.goals.join(', ')}</div>
                  </div>
                )}

                {selectedEntry.achievements?.length > 0 && (
                  <div className="card" style={{ padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#F59E0B' }}>🏆 Achievements:</strong>
                    <div style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{selectedEntry.achievements.join(', ')}</div>
                  </div>
                )}

                {selectedEntry.skills?.length > 0 && (
                  <div className="card" style={{ padding: '0.85rem' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#0EA5E9' }}>📚 Skills:</strong>
                    <div style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{selectedEntry.skills.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
