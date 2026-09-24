import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Feather,
  Clock,
  Compass,
  Award,
  Sparkles,
  ArrowRight,
  Calendar,
  Flame,
  BookOpen,
  Bookmark,
  Smile,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedId, setBookmarkedId] = useState(null);

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
  const currentMood = latestJournal ? `${latestJournal.moodEmoji || '🌿'} ${latestJournal.mood || 'Calm'}` : "🌿 Serene";

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const quotes = [
    "“Fill your paper with the breathings of your heart.” — William Wordsworth",
    "“Journaling is like paying attention to the small miracle of being alive.”",
    "“Write it on your heart that every day is the best day in the year.”",
    "“In the journal I do not just express myself more freely than I tend to do with any person; I create myself.”"
  ];
  const randomQuote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];

  return (
    <div className="animate-fade-in" style={{
      padding: '2.5rem 2rem 4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      
      {/* 1. HERO SECTION - Peaceful Stationery Greeting */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2, flex: 1, minWidth: '280px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--text-muted)',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-sans)'
          }}>
            <Calendar size={14} color="var(--accent)" />
            <span>{todayStr}</span>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--rose)',
              background: 'var(--rose-light)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              <Flame size={12} /> 7 Day Streak
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '48px',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--text-main)',
            marginBottom: '0.5rem'
          }}>
            Good day, {user?.name?.split(' ')[0] || 'Alex'}.
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.96rem',
            maxWidth: '620px',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            {randomQuote}
          </p>
        </div>

        <button
          onClick={() => navigate('/write')}
          className="btn-primary"
          style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
        >
          <Feather size={18} />
          <span>Open Today's Notebook</span>
        </button>
      </div>

      {/* 2. APPLE-WIDGET METRIC TILES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Metric 1 */}
        <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Total Entries</div>
            <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-main)', lineHeight: 1.15 }}>{journals.length}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--success-light)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Active Goals</div>
            <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-main)', lineHeight: 1.15 }}>{goals.length}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--warning-light)',
            color: 'var(--warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Milestones</div>
            <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-main)', lineHeight: 1.15 }}>{achievements.length}</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--purple-light)',
            color: 'var(--purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Smile size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>Current Mood</div>
            <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--text-main)' }}>{currentMood}</div>
          </div>
        </div>
      </div>

      {/* 3. CENTERPIECE: TODAY'S REFLECTION NOTEBOOK PAGE */}
      <div className="notebook-page paper-texture" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="notebook-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-accent">
                <Sparkles size={13} /> Gemini Reflection
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} /> 3 min read
              </span>
            </div>
            {latestJournal && (
              <span className="badge badge-success">
                {latestJournal.moodEmoji || '🌿'} {latestJournal.mood || 'Calm'}
              </span>
            )}
          </div>

          {/* Reflection Content */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              {latestJournal ? (latestJournal.title || "Today's Reflections & AI Insight") : "Today's Clean Page"}
            </h3>
            <p style={{
              color: 'var(--text-main)',
              fontSize: '16px',
              lineHeight: 1.7,
              opacity: 0.9,
              maxWidth: '820px',
              fontFamily: 'var(--font-sans)'
            }}>
              {latestJournal
                ? (latestJournal.summary || latestJournal.content.slice(0, 240) + "...")
                : "The notebook is open and waiting for your morning thoughts. Take a quiet breath, grab your cup of coffee, and write down whatever is on your mind."}
            </p>
          </div>

          {/* Tags & Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {latestJournal?.tags ? (
                latestJournal.tags.map(t => (
                  <span key={t} className="badge badge-purple">#{t}</span>
                ))
              ) : (
                <>
                  <span className="badge badge-accent">#gratitude</span>
                  <span className="badge badge-sky">#morning</span>
                </>
              )}
            </div>

            <button
              onClick={() => navigate('/write')}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <span>{latestJournal ? "Continue Writing" : "Start Writing Now"}</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* 4. LOWER SECTION: RECENT MEMORIES & GOALS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem'
      }}>
        
        {/* Recent Memories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--accent)" />
              Recent Memories
            </h3>
            <button
              onClick={() => navigate('/timeline')}
              className="btn-ghost"
              style={{ fontSize: '0.82rem' }}
            >
              View Timeline <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {journals.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/timeline')}
                className="paper-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookmarkedId(bookmarkedId === item.id ? null : item.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: bookmarkedId === item.id ? 'var(--accent)' : 'var(--text-subtle)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <Bookmark size={16} fill={bookmarkedId === item.id ? 'var(--accent)' : 'none'} />
                  </button>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {item.title || item.summary || item.content.slice(0, 85) + '...'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span className="badge badge-accent">
                    {item.moodEmoji || '🌿'} {item.mood || 'Calm'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    {item.tags?.[0] ? `#${item.tags[0]}` : 'journal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Life Goals & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} color="var(--success)" />
              Active Life Intentions
            </h3>
            <button
              onClick={() => navigate('/goals')}
              className="btn-ghost"
              style={{ fontSize: '0.82rem' }}
            >
              All Goals <ArrowRight size={14} />
            </button>
          </div>

          <div className="paper-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {goals.slice(0, 3).map((goal, idx) => (
              <div key={goal.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Circular Progress SVG */}
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                  <svg width="48" height="48" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--border-color)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeDasharray={`${goal.progress || 65}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-main)'
                  }}>
                    {goal.progress || 65}%
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {goal.title || goal.text}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {goal.category || 'Mindfulness & Growth'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
