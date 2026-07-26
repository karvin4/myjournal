import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Target,
  Trophy,
  Smile,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resJ, resG, resA] = await Promise.all([
          fetch('/api/journal'),
          fetch('/api/goals'),
          fetch('/api/achievements')
        ]);
        const dataJ = await resJ.json();
        const dataG = await resG.json();
        const dataA = await resA.json();

        setJournals(Array.isArray(dataJ) ? dataJ : []);
        setGoals(Array.isArray(dataG) ? dataG : []);
        setAchievements(Array.isArray(dataA) ? dataA : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const latestJournal = journals[0];
  const currentMood = latestJournal ? `${latestJournal.moodEmoji} ${latestJournal.mood}` : "😊 Happy";

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Calendar size={16} color="#6366F1" />
            <span>{todayStr}</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Alex'}! ✨
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', lineHeight: 1.5 }}>
            "Your personal AI journal that remembers, understands, and grows with you."
          </p>
        </div>

        <button
          onClick={() => navigate('/write')}
          className="btn-primary"
          style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', borderRadius: '16px' }}
        >
          <Sparkles size={20} />
          <span>Write Today's Entry</span>
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Total Journal Entries */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Journals</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{journals.length}</div>
          </div>
        </div>

        {/* Goals Extracted */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tracked Goals</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{goals.length}</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Achievements</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{achievements.length}</div>
          </div>
        </div>

        {/* Current Mood */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smile size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Mood</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{currentMood}</div>
          </div>
        </div>

      </div>

      {/* Main Grid: AI Reflection + Weekly Progress + Recent Memories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Today's AI Reflection Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Today's AI Reflection</h3>
            </div>
            <span className="badge badge-indigo">Gemini Insight</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {latestJournal
              ? `"${latestJournal.summary || latestJournal.content.slice(0, 140) + '...'}"`
              : "No reflections written for today yet. Take a moment to record your thoughts!"}
          </p>

          {latestJournal && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {latestJournal.tags?.map(tag => (
                <span key={tag} className="badge badge-emerald">#{tag}</span>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/chat')}
            className="btn-secondary"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <span>Ask AI about this memory</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Weekly Progress Card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <TrendingUp size={22} color="#22C55E" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Weekly Growth Score</h3>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E' }}>92%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                <span>Journal Consistency</span>
                <span>5 / 7 Days</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '71%', height: '100%', background: '#6366F1', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                <span>Goal Progression</span>
                <span>75% Achieved</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#22C55E', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#6366F1', fontWeight: 500 }}>
            💡 You're on track to complete 2 major goals this week!
          </div>
        </div>

      </div>

      {/* Recent Memories & Activity Feed */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Clock size={20} color="#6366F1" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Journal Memories</h3>
          </div>
          <button
            onClick={() => navigate('/timeline')}
            style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {journals.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/timeline')}
              style={{
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{item.moodEmoji || '😊'}</span>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {item.summary || item.content.slice(0, 90) + '...'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                    <span>😊 Mood: {item.mood}</span>
                    {item.goals?.length > 0 && <span>🎯 Goal: {item.goals[0]}</span>}
                  </div>
                </div>
              </div>
              <span className="badge badge-indigo" style={{ whiteSpace: 'nowrap' }}>
                {item.tags?.[0] ? `#${item.tags[0]}` : 'Journal'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
