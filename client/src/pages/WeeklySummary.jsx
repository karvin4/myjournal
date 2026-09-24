import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Sparkles, Smile, Target, Lightbulb, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function WeeklySummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/weekly-summary');
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Error fetching weekly summary:", err);
      }
    }
    fetchSummary();
  }, []);

  if (!summary) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synthesizing weekly report...</div>;

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
          <BarChart2 size={14} />
          <span>Weekly Synthesis</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Weekly Analytical Report
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7, marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>
          A calm synthesis of your cognitive trends, growth, and focus areas over the past week.
        </p>
      </div>

      {/* Metric Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TrendingUp size={22} color="var(--success)" />
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Growth Score</div>
            <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--success)', lineHeight: 1.15 }}>{summary.growthScore}%</div>
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Sparkles size={22} color="var(--accent)" />
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Productivity</div>
            <div style={{ fontSize: '34px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--accent)', lineHeight: 1.15 }}>{summary.productivityScore}%</div>
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Smile size={22} color="var(--warning)" />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overall Mood</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{summary.overallMoodEmoji} {summary.overallMood}</div>
          </div>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Target size={22} color="var(--purple)" />
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Intentions Met</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{summary.goalsCompleted} / {summary.goalsTotal}</div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Key Lessons */}
        <div className="paper-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <ShieldCheck size={18} /> Lessons & Insights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary.lessonsLearned.map((l, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                🌱 {l}
              </div>
            ))}
          </div>
        </div>

        {/* Gemini Recommendations */}
        <div className="paper-card paper-texture" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
            <Lightbulb size={18} /> Gemini Guidance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary.aiSuggestions.map((sug, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
