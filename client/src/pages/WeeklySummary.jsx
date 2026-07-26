import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Sparkles, Smile, Trophy, Target, Lightbulb, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

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

  if (!summary) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading weekly report...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366F1', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>
            <BarChart3 size={18} />
            <span>AI WEEKLY INSIGHTS REPORT</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Weekly Analytical Report
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            A comprehensive synthesis of your cognitive trends, accomplishments, and focus areas.
          </p>
        </div>
      </div>

      {/* Top Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Growth Score */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Growth Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22C55E' }}>{summary.growthScore}%</div>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Productivity Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366F1' }}>{summary.productivityScore}%</div>
          </div>
        </div>

        {/* Overall Mood */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smile size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Mood</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary.overallMoodEmoji} {summary.overallMood}
            </div>
          </div>
        </div>

        {/* Goals Completed */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Goals Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {summary.goalsCompleted} / {summary.goalsTotal} Completed
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Challenges & Lessons Learned + AI Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Challenges & Lessons Learned */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} />
              <span>Key Challenges Identified</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {summary.challenges.map((c, idx) => (
                <li key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>⚠️</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#22C55E', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={20} />
              <span>Lessons Learned</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {summary.lessonsLearned.map((l, idx) => (
                <li key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>🌱</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* AI Recommendations */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #22C55E)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Gemini AI Recommendations</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summary.aiSuggestions.map((sug, idx) => (
              <div key={idx} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={20} color="#6366F1" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-main)' }}>{sug}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(99, 102, 241, 0.12)', borderRadius: '16px', fontSize: '0.85rem', color: '#6366F1', textAlign: 'center', fontWeight: 600 }}>
            🚀 Next summary auto-updates in 3 days!
          </div>
        </div>

      </div>

    </div>
  );
}
