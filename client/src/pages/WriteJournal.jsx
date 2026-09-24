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
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  Github,
  GitCommit,
  RefreshCw,
  Feather,
  ArrowRight
} from 'lucide-react';

export default function WriteJournal() {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Selected mood, date, and day of week
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState('🌿');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  });

  // GitHub Integration States
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [commits, setCommits] = useState([]);
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [githubError, setGithubError] = useState('');

  useEffect(() => {
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
        setContent(prev => {
          const separator = prev ? "\n\n" : "";
          return `${prev}${separator}${data.reflection}`;
        });
        setIsSaved(false);
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

  const moodOptions = [
    { mood: 'Calm', emoji: '🌿' },
    { mood: 'Fulfilled', emoji: '✨' },
    { mood: 'Reflective', emoji: '💭' },
    { mood: 'Happy', emoji: '😊' },
    { mood: 'Excited', emoji: '🤩' },
    { mood: 'Focused', emoji: '🎯' },
    { mood: 'Stressed', emoji: '😫' },
    { mood: 'Quiet', emoji: '🌙' }
  ];

  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr);
    setIsSaved(false);
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        setSelectedDay(dateObj.toLocaleDateString('en-US', { weekday: 'long' }));
      }
    } else {
      setSelectedDay('');
    }
  };

  const handleClear = () => {
    setContent('');
    setAiResult(null);
    setSuccessMessage('');
    setIsSaved(false);
    setSelectedMood('Calm');
    setSelectedMoodEmoji('🌿');
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    setSuccessMessage('');
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          mood: selectedMood,
          moodEmoji: selectedMoodEmoji,
          date: selectedDate,
          day: selectedDay
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data.analysis);
        setSuccessMessage('Entry saved and memory context extracted gracefully.');
        setIsSaved(true);
      } else {
        alert(data.error || 'Failed to save journal');
      }
    } catch (err) {
      console.error('Error saving journal:', err);
      alert('Error connecting to server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="animate-fade-in reading-width" style={{
      padding: '2.5rem 1.5rem 4rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      
      {/* 1. Header Stationery Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
            <Feather size={14} />
            <span>Personal Stationery</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {selectedDay}, {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleClear}
            className="btn-ghost"
            style={{ fontSize: '0.85rem' }}
          >
            <Trash2 size={15} /> Clear Page
          </button>

          <button
            onClick={handleSave}
            disabled={isAnalyzing || !content.trim()}
            className="btn-primary"
            style={{ opacity: (!content.trim() || isAnalyzing) ? 0.6 : 1 }}
          >
            <Save size={16} />
            <span>{isAnalyzing ? "Extracting Memory..." : (isSaved ? "Saved & Extracted" : "Save Entry")}</span>
          </button>
        </div>
      </div>

      {/* 2. Mood & Date Toolbar */}
      <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Mood Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>Mood:</span>
            {moodOptions.map((opt) => {
              const isSelected = selectedMood === opt.mood;
              return (
                <button
                  key={opt.mood}
                  onClick={() => {
                    setSelectedMood(opt.mood);
                    setSelectedMoodEmoji(opt.emoji);
                    setIsSaved(false);
                  }}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--accent-light)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.mood}</span>
                </button>
              );
            })}
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              width: 'auto'
            }}
          />
        </div>
      </div>

      {/* 3. GitHub Activity Import Drawer (If Connected) */}
      {githubConnected && (
        <div className="paper-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Github size={16} color="var(--accent)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Import GitHub Memory ({githubUsername})</span>
            </div>
            <button onClick={fetchGitHubActivity} className="btn-ghost" style={{ padding: '0.2rem 0.5rem' }}>
              <RefreshCw size={13} className={isLoadingCommits ? "animate-spin" : ""} />
            </button>
          </div>

          {commits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {commits.slice(0, 4).map(c => {
                  const isSel = selectedCommits.some(sc => sc.id === c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleToggleCommit(c)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSel ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                        background: isSel ? 'var(--accent-light)' : 'var(--bg-main)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <GitCommit size={12} inline style={{ marginRight: '0.35rem' }} />
                      {c.message.slice(0, 35)}...
                    </button>
                  );
                })}
              </div>

              {selectedCommits.length > 0 && (
                <button
                  onClick={handleGenerateReflection}
                  disabled={isGeneratingReflection}
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.82rem', padding: '0.4rem 1rem' }}
                >
                  <Sparkles size={14} />
                  <span>{isGeneratingReflection ? "Synthesizing..." : `Generate Reflection (${selectedCommits.length})`}</span>
                </button>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent GitHub activity found for today.</p>
          )}
        </div>
      )}

      {/* 4. MAIN PAPER NOTEBOOK CANVAS */}
      <div className="notebook-page paper-texture" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
        <div className="notebook-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Dear Journal, today I reflected on..."
            style={{
              width: '100%',
              flex: 1,
              minHeight: '440px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0.5rem 0',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--text-main)',
              resize: 'none',
              fontFamily: "var(--font-sans)"
            }}
          />

          {/* Footer Stats & Notification */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            color: 'var(--text-subtle)'
          }}>
            <div>
              {wordCount} words • ~{readingTimeMinutes} min reading time
            </div>

            {successMessage && (
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} /> {successMessage}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. GEMINI AI MEMORY EXTRACTION SIDE NOTE */}
      {aiResult && (
        <div className="paper-card animate-fade-in" style={{
          padding: '1.75rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sparkles size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gemini Memory Analysis</h3>
            </div>
            <span className="badge badge-accent">Extracted</span>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            "{aiResult.summary}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {aiResult.goals?.length > 0 && (
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>🎯 Goals Identified:</span>
                {aiResult.goals.map((g, i) => (
                  <span key={i} className="badge badge-success" style={{ marginRight: '0.35rem', marginBottom: '0.35rem' }}>{g}</span>
                ))}
              </div>
            )}

            {aiResult.tags?.length > 0 && (
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>🏷️ Memory Tags:</span>
                {aiResult.tags.map((t, i) => (
                  <span key={i} className="badge badge-purple" style={{ marginRight: '0.35rem', marginBottom: '0.35rem' }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
