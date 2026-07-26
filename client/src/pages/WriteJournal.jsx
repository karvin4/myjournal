import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Trash2,
  Smile,
  Target,
  Trophy,
  Lightbulb,
  BookOpen,
  Users,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  Github,
  GitCommit,
  RefreshCw,
  Plus,
  Check
} from 'lucide-react';

export default function WriteJournal() {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // GitHub Integration States
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [commits, setCommits] = useState([]);
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [githubError, setGithubError] = useState('');

  useEffect(() => {
    // Check if GitHub is connected
    fetch('/api/github/connection')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setGithubConnected(true);
          setGithubUsername(data.username);
          fetchGitHubActivity();
        }
      })
      .catch(err => console.error("Error loading GitHub status:", err));
  }, []);

  const fetchGitHubActivity = async () => {
    setIsLoadingCommits(true);
    setGithubError('');
    try {
      const res = await fetch('/api/github/activity');
      const data = await res.json();
      if (res.ok) {
        setCommits(data.commits || []);
      } else {
        setGithubError(data.error || 'Failed to load GitHub activity');
      }
    } catch (err) {
      setGithubError('Error connecting to GitHub activity API');
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const handleToggleCommit = (commit) => {
    if (selectedCommits.some(c => c.id === commit.id)) {
      setSelectedCommits(prev => prev.filter(c => c.id !== commit.id));
    } else {
      setSelectedCommits(prev => [...prev, commit]);
    }
  };

  const handleGenerateReflection = async () => {
    if (selectedCommits.length === 0) return;
    setIsGeneratingReflection(true);
    try {
      const res = await fetch('/api/github/import-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commits: selectedCommits })
      });
      const data = await res.json();
      if (res.ok) {
        // Append or replace content with reflection
        setContent(prev => {
          const separator = prev ? "\n\n" : "";
          return `${prev}${separator}${data.reflection}`;
        });
        setSelectedCommits([]);
      } else {
        alert(data.error || 'Failed to generate reflection');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating reflection');
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const promptIdeas = [
    "What went really well today?",
    "Did you complete any major milestones or projects?",
    "What goals or skills are you aiming to work on next?",
    "Who did you meet or talk with today?",
    "Any new creative ideas on your mind?"
  ];

  const handlePromptClick = (prompt) => {
    setContent(prev => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
  };

  const handleClear = () => {
    setContent('');
    setAiResult(null);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setSuccessMessage('');
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data.analysis);
        setSuccessMessage('Journal entry saved and AI memory extracted successfully!');
      } else {
        alert(data.error || 'Failed to save journal');
      }
    } catch (err) {
      console.error('Error saving journal:', err);
      alert('Error connecting to backend server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#6366F1', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          <Sparkles size={18} />
          <span>AI MEMORY EXTRACTION ACTIVE</span>
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Write Journal Entry
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Express your daily experience. Gemini AI will automatically extract goals, achievements, skills, and memories.
        </p>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Prompts:</span>
        {promptIdeas.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(p)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            + {p}
          </button>
        ))}
      </div>

      {/* GitHub Sync Activity panel */}
      {githubConnected && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Github size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>GitHub Activity Integrator</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connected as @{githubUsername} • Select commits to generate your daily reflection</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={fetchGitHubActivity} 
                className="btn-secondary" 
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                disabled={isLoadingCommits}
              >
                <RefreshCw size={14} className={isLoadingCommits ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={handleGenerateReflection}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                disabled={selectedCommits.length === 0 || isGeneratingReflection}
              >
                {isGeneratingReflection ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Draft Reflection ({selectedCommits.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {githubError && (
            <div style={{ fontSize: '0.82rem', color: '#F43F5E', fontWeight: 600 }}>
              ⚠️ {githubError}
            </div>
          )}

          {isLoadingCommits ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>Fetching your recent commits...</span>
            </div>
          ) : commits.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
              No recent commits found. Push some code or verify your sync credentials in Settings!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-main)', padding: '0.75rem' }}>
              {commits.map((c) => {
                const isSelected = selectedCommits.some(item => item.id === c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleToggleCommit(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? '#6366F1' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <GitCommit size={16} color={isSelected ? "#6366F1" : "var(--text-light)"} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.message}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          repo: <strong style={{ color: '#6366F1' }}>{c.repo}</strong> • sha: <code>{c.id.slice(0,7)}</code> • {new Date(c.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#6366F1' : 'var(--border-color)'}`,
                      background: isSelected ? '#6366F1' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Editor Container */}
      <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your day today? Write anything that's on your mind..."
          rows={12}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        {/* Footer info & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <span>Words: <strong>{wordCount}</strong></span>
            <span>Est. Read: <strong>{Math.ceil(wordCount / 200)} min</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={handleClear}
              className="btn-secondary"
              disabled={isAnalyzing}
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>

            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={isAnalyzing || !content.trim()}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles size={18} className="animate-pulse-glow" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Journal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#22C55E',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* AI Analysis Card */}
      {aiResult && (
        <div className="glass-card animate-fade-in" style={{
          padding: '2rem',
          border: '1.5px solid rgba(99, 102, 241, 0.4)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1, #22C55E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>AI Extracted Memory Card</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Structured memory saved to MongoDB & context store</p>
              </div>
            </div>
            <span className="badge badge-indigo" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
              {aiResult.moodEmoji} Mood: {aiResult.mood}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Mood */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366F1', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Smile size={18} />
                <span>Detected Mood</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{aiResult.moodEmoji}</span>
                <span>{aiResult.mood}</span>
              </div>
            </div>

            {/* Goals Detected */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22C55E', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Target size={18} />
                <span>🎯 Goals Detected</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.goals?.length > 0 ? (
                  aiResult.goals.map((g, idx) => <span key={idx} className="badge badge-emerald">{g}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No explicit goals detected</span>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Trophy size={18} />
                <span>🏆 Achievements</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.achievements?.length > 0 ? (
                  aiResult.achievements.map((a, idx) => <span key={idx} className="badge badge-amber">{a}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No achievements recorded</span>
                )}
              </div>
            </div>

            {/* Ideas */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A855F7', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Lightbulb size={18} />
                <span>💡 Ideas & Innovations</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.ideas?.length > 0 ? (
                  aiResult.ideas.map((i, idx) => <span key={idx} className="badge badge-purple">{i}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No ideas logged</span>
                )}
              </div>
            </div>

            {/* Skills Mentioned */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0EA5E9', fontWeight: 700, marginBottom: '0.5rem' }}>
                <BookOpen size={18} />
                <span>📚 Skills Mentioned</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.skills?.length > 0 ? (
                  aiResult.skills.map((s, idx) => <span key={idx} className="badge badge-sky">{s}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None mentioned</span>
                )}
              </div>
            </div>

            {/* People Mentioned */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F43F5E', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Users size={18} />
                <span>👤 People Mentioned</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.people?.length > 0 ? (
                  aiResult.people.map((p, idx) => <span key={idx} className="badge badge-rose">{p}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No people tagged</span>
                )}
              </div>
            </div>

            {/* Important Events */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366F1', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Calendar size={18} />
                <span>📅 Important Events</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.events?.length > 0 ? (
                  aiResult.events.map((e, idx) => <span key={idx} className="badge badge-indigo">{e}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No key events</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22C55E', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Tag size={18} />
                <span>🏷 Tags</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiResult.tags?.length > 0 ? (
                  aiResult.tags.map((t, idx) => <span key={idx} className="badge badge-emerald">#{t}</span>)
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>#Journal</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
