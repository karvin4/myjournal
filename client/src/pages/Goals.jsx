import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Trash2, Edit3, Sparkles, Clock, AlertCircle } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newCategory, setNewCategory] = useState('Personal Growth');

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  }

  const handleToggleComplete = async (goal) => {
    const updatedStatus = goal.status === 'Completed' ? 'In Progress' : 'Completed';
    const updatedProgress = updatedStatus === 'Completed' ? 100 : 50;

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus, progress: updatedProgress })
      });
      if (res.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error("Error updating goal:", err);
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

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          category: newCategory
        })
      });
      if (res.ok) {
        setNewTitle('');
        setShowAddModal(false);
        fetchGoals();
      }
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22C55E', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} />
            <span>AI EXTRACTED & PERSONAL GOALS</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Goals Tracker
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-accent"
          style={{ borderRadius: '14px' }}
        >
          <Plus size={18} />
          <span>Add Custom Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {goals.map(goal => {
          const isCompleted = goal.status === 'Completed';

          return (
            <div
              key={goal.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                opacity: isCompleted ? 0.8 : 1,
                borderLeft: isCompleted ? '4px solid #22C55E' : '4px solid #6366F1'
              }}
            >
              {/* Header info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <span className={`badge ${isCompleted ? 'badge-emerald' : goal.priority === 'High' ? 'badge-rose' : 'badge-amber'}`} style={{ marginBottom: '0.5rem' }}>
                    {isCompleted ? 'Completed' : `${goal.priority} Priority`}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                    {goal.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleComplete(goal)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isCompleted ? '#22C55E' : 'var(--text-light)',
                    transition: 'var(--transition-fast)'
                  }}
                  title={isCompleted ? "Mark as In Progress" : "Mark as Completed"}
                >
                  <CheckCircle2 size={26} />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Progress</span>
                  <span>{goal.progress || 0}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${goal.progress || 0}%`, height: '100%', background: isCompleted ? '#22C55E' : '#6366F1', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} />
                  <span>Created {new Date(goal.createdDate).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{ background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
