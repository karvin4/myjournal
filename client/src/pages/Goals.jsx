import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Compass, Plus, CheckCircle2, Trash2, X, Clock, CalendarDays, Check } from 'lucide-react';

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateTargetDate = (startDateStr, days) => {
  if (!startDateStr) return '';
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + (Number(days) || 30));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newCategory, setNewCategory] = useState('Personal Growth');
  const [durationOption, setDurationOption] = useState('30');
  const [customDays, setCustomDays] = useState(30);
  const [startDate, setStartDate] = useState(getTodayStr());

  useEffect(() => {
    fetchGoals();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalDocOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalDocOverflow;
      };
    }
  }, [showAddModal]);

  async function fetchGoals() {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  }

  const handleMarkTodayDone = async (goal) => {
    const todayStr = getTodayStr();
    const currentDates = Array.isArray(goal.completedDates) ? goal.completedDates : [];
    const isAlreadyDoneToday = currentDates.includes(todayStr);

    const updatedDates = isAlreadyDoneToday
      ? currentDates.filter(d => d !== todayStr)
      : [...currentDates, todayStr];

    const targetDays = parseInt(goal.targetDays, 10) || 30;
    const newCompletedCount = updatedDates.length;

    let newStatus = goal.status;
    let newProgress = Math.min(100, Math.round((newCompletedCount / targetDays) * 100 * 100) / 100);

    if (newCompletedCount >= targetDays) {
      newStatus = 'Completed';
      newProgress = 100;
    } else if (newStatus === 'Completed' && newCompletedCount < targetDays) {
      newStatus = 'In Progress';
    }

    setGoals(prev => prev.map(g => g.id === goal.id ? {
      ...g,
      completedDates: updatedDates,
      progress: newProgress,
      status: newStatus
    } : g));

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedDates: updatedDates,
          progress: newProgress,
          status: newStatus
        })
      });
      if (!res.ok) fetchGoals();
    } catch (err) {
      console.error("Error updating goal daily progress:", err);
      fetchGoals();
    }
  };

  const handleToggleComplete = async (goal) => {
    const isCurrentlyCompleted = goal.status === 'Completed';
    const updatedStatus = isCurrentlyCompleted ? 'In Progress' : 'Completed';
    const targetDays = parseInt(goal.targetDays, 10) || 30;
    const completedCount = (goal.completedDates || []).length;
    const updatedProgress = isCurrentlyCompleted 
      ? Math.min(99, Math.round((completedCount / targetDays) * 100 * 10) / 10) 
      : 100;

    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: updatedStatus, progress: updatedProgress } : g));

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus, progress: updatedProgress })
      });
      if (!res.ok) fetchGoals();
    } catch (err) {
      console.error("Error updating goal status:", err);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;

    const targetDays = durationOption === 'custom' ? Math.max(1, Number(customDays) || 30) : Number(durationOption);
    const targetDate = calculateTargetDate(startDate, targetDays);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          category: newCategory,
          targetDays: targetDays,
          startDate: startDate,
          targetDate: targetDate
        })
      });
      if (res.ok) {
        setNewTitle('');
        setDurationOption('30');
        setCustomDays(30);
        setStartDate(getTodayStr());
        setShowAddModal(false);
        fetchGoals();
      }
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

  const activeGoals = goals.filter(g => g.status !== 'Completed');
  const completedGoals = goals.filter(g => g.status === 'Completed');
  const activeTargetDays = durationOption === 'custom' ? (Number(customDays) || 1) : Number(durationOption);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Compass size={14} />
            <span>Life Intentions</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.15rem' }}>
            Goals & Aspirations
          </h2>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}>
          <Plus size={16} /> <span>New Intention</span>
        </button>
      </div>

      {/* Active Goals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Active Intentions ({activeGoals.length})
        </h3>

        {activeGoals.length === 0 ? (
          <div className="paper-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active intentions. Take a quiet moment to define what matters most to you.
          </div>
        ) : (
          activeGoals.map(goal => {
            const targetDays = parseInt(goal.targetDays, 10) || 30;
            const completedDates = Array.isArray(goal.completedDates) ? goal.completedDates : [];
            const completedCount = completedDates.length > 0 
              ? completedDates.length 
              : (goal.progress ? Math.round(((goal.progress) / 100) * targetDays) : 0);
            
            const todayStr = getTodayStr();
            const isTodayDone = completedDates.includes(todayStr);

            const displayProgress = goal.status === 'Completed'
              ? 100
              : (Math.round((completedCount / targetDays) * 100 * 10) / 10);

            const startDateFormatted = formatDate(goal.startDate || goal.createdDate);
            const targetDateFormatted = formatDate(goal.targetDate || calculateTargetDate(goal.startDate || goal.createdDate, targetDays));

            return (
              <div key={goal.id} className="paper-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                  
                  {/* Left section: Circular ring & title info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '260px' }}>
                    {/* Circular Progress Ring */}
                    <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                      <svg width="60" height="60" viewBox="0 0 36 36">
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
                          strokeDasharray={`${displayProgress}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-main)'
                      }}>
                        {displayProgress}%
                      </span>
                    </div>

                    {/* Title & Badges */}
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        {goal.title || goal.text}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                          {goal.category || 'Personal Growth'}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                          {goal.priority || 'High'} Priority
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {targetDays} Days Target
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleMarkTodayDone(goal)}
                      className={isTodayDone ? "btn-secondary" : "btn-primary"}
                      style={{
                        padding: '0.45rem 0.9rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        borderColor: isTodayDone ? 'var(--success)' : undefined,
                        color: isTodayDone ? 'var(--success)' : undefined
                      }}
                    >
                      {isTodayDone ? <Check size={16} /> : <CheckCircle2 size={16} />}
                      <span>{isTodayDone ? "Today Done ✓" : "Mark Today Done"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleComplete(goal)}
                      className="btn-ghost"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}
                      title="Manually finish goal"
                    >
                      Complete Goal
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="btn-ghost"
                      style={{ padding: '0.45rem', color: 'var(--rose)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Status Banner */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                        <span>{completedCount} / {targetDays} days completed</span>
                        <span>{(100 / targetDays).toFixed(2)}% / day</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${displayProgress}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          borderRadius: '3px',
                          transition: 'var(--transition-normal)'
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CalendarDays size={13} /> {startDateFormatted} → {targetDateFormatted}
                    </span>

                    <span style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      background: isTodayDone ? 'var(--success-light)' : 'var(--bg-surface)',
                      color: isTodayDone ? 'var(--success)' : 'var(--text-muted)',
                      border: `1px solid ${isTodayDone ? 'rgba(47, 167, 114, 0.25)' : 'var(--border-color)'}`
                    }}>
                      Today's activity: {isTodayDone ? 'Completed ✓' : 'Not completed'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fulfilled Intentions ({completedGoals.length})
          </h3>
          {completedGoals.map(goal => (
            <div key={goal.id} className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, textDecoration: 'line-through' }}>{goal.title || goal.text}</span>
              </div>
              <button onClick={() => handleDeleteGoal(goal.id)} className="btn-ghost" style={{ padding: '0.3rem', color: 'var(--rose)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Fixed Viewport Modal Overlay rendered directly via Portal */}
      {showAddModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="paper-card animate-fade-in"
            style={{
              width: 'min(540px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 32px)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-lg)',
              padding: 0,
              overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Modal Fixed Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: 'var(--bg-card)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>New Life Intention</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Set your goal and daily activity duration.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: '0.35rem', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Learn Editing, Daily Reading, 30 Min Exercise"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Career & Learning">Career & Learning</option>
                    <option value="Mindfulness">Mindfulness</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Goal Duration</label>
                  <select value={durationOption} onChange={(e) => setDurationOption(e.target.value)}>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="custom">Custom Days...</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              {durationOption === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Custom Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="e.g. 21"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                  />
                </div>
              )}

              {/* Live Target Preview */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  🎯 Target Finish: {formatDate(calculateTargetDate(startDate, activeTargetDays))}
                </div>
                <div>
                  Daily Progress Rate: +{(100 / activeTargetDays).toFixed(2)}% per completed day
                </div>
              </div>

              <button onClick={handleAddGoal} className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Create Goal Intention
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
