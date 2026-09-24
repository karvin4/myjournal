import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Sparkles,
  X,
  Tag,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  Undo2,
  Bookmark,
  Clock,
  Feather
} from 'lucide-react';

export default function Timeline() {
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedIds, setSelectedIds] = useState([]);
  const [undoToast, setUndoToast] = useState({ show: false, message: '', ids: [] });

  useEffect(() => {
    fetchTimeline();
  }, []);

  useEffect(() => {
    if (location.state?.highlightId && entries.length > 0) {
      const match = entries.find(e => e.id === location.state.highlightId);
      if (match) {
        setSelectedEntry(match);
      }
    }
  }, [location.state, entries]);

  async function fetchTimeline() {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  }

  const moodsList = ['All', 'Calm', 'Fulfilled', 'Reflective', 'Happy', 'Excited', 'Focused', 'Stressed'];

  const activeEntries = entries.filter(e => !e.isDeleted);
  const trashEntries = entries.filter(e => e.isDeleted);
  const currentTabEntries = activeTab === 'active' ? activeEntries : trashEntries;

  const filteredEntries = currentTabEntries.filter(e => {
    const matchesSearch = e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.summary && e.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (e.tags && e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesMood = selectedMood === 'All' || e.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredEntries.map(e => e.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const showToast = (message, ids) => {
    setUndoToast({ show: true, message, ids });
    setTimeout(() => {
      setUndoToast(prev => (prev.ids === ids ? { ...prev, show: false } : prev));
    }, 7000);
  };

  const handleUndo = async () => {
    if (!undoToast.ids || undoToast.ids.length === 0) return;
    try {
      const res = await fetch('/api/journal/bulk-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: undoToast.ids })
      });
      if (res.ok) {
        setEntries(prev => prev.map(item => undoToast.ids.includes(item.id) ? { ...item, isDeleted: false } : item));
        setUndoToast({ show: false, message: '', ids: [] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/journal/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        const deletedCount = selectedIds.length;
        const currentIds = [...selectedIds];
        setEntries(prev => prev.map(item => currentIds.includes(item.id) ? { ...item, isDeleted: true } : item));
        setSelectedIds([]);
        showToast(`${deletedCount} entry memory moved to trash.`, currentIds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/journal/bulk-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setEntries(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, isDeleted: false } : item));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Permanently delete selected journal entries? This action cannot be undone.")) return;
    try {
      const res = await fetch('/api/journal/bulk-permanent-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setEntries(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const allVisibleSelected = filteredEntries.length > 0 && filteredEntries.every(e => selectedIds.includes(e.id));

  return (
    <div className="animate-fade-in reading-width" style={{
      padding: '2.5rem 1.5rem 4rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      
      {/* Header Stationery */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
            <Clock size={14} />
            <span>Chronological Memories</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Journal Archive
          </h2>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => { setActiveTab('active'); setSelectedIds([]); }}
            style={{
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'active' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'active' ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'active' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Memories ({activeEntries.length})
          </button>
          <button
            onClick={() => { setActiveTab('trash'); setSelectedIds([]); }}
            style={{
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'trash' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'trash' ? 'var(--rose)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'trash' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Trash Bin ({trashEntries.length})
          </button>
        </div>
      </div>

      {/* Undo Floating Toast */}
      {undoToast.show && (
        <div className="paper-card animate-fade-in" style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-accent)'
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{undoToast.message}</span>
          <button onClick={handleUndo} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
            <Undo2 size={13} /> Undo
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="paper-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Search Pill Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem 1rem',
            flex: 1,
            minWidth: '220px'
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search thoughts, tags, or memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Mood Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {moodsList.map(mood => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedMood === mood ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  background: selectedMood === mood ? 'var(--accent-light)' : 'transparent',
                  color: selectedMood === mood ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: selectedMood === mood ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                {mood}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Batch Select Toolbar */}
      {filteredEntries.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
          <button
            onClick={toggleSelectAll}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            {allVisibleSelected ? <CheckSquare size={16} color="var(--accent)" /> : <Square size={16} />}
            <span>{allVisibleSelected ? "Deselect All" : "Select All"}</span>
          </button>

          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeTab === 'active' ? (
                <button onClick={handleBulkDelete} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', color: 'var(--rose)' }}>
                  <Trash2 size={13} /> Delete Selected ({selectedIds.length})
                </button>
              ) : (
                <>
                  <button onClick={handleBulkRestore} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                    <RotateCcw size={13} /> Restore Selected
                  </button>
                  <button onClick={handleBulkPermanentDelete} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', color: 'var(--rose)' }}>
                    <Trash2 size={13} /> Delete Permanently
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timeline Notebook Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredEntries.length === 0 ? (
          <div className="paper-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No journal memories found matching your search.
          </div>
        ) : (
          filteredEntries.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEntry(item)}
                className="paper-card"
                style={{
                  padding: '1.5rem 1.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {isSelected ? <CheckSquare size={16} color="var(--accent)" /> : <Square size={16} color="var(--text-subtle)" />}
                    </button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <span className="badge badge-accent">
                    {item.moodEmoji || '🌿'} {item.mood || 'Calm'}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {item.summary || item.content.slice(0, 140) + '...'}
                </div>

                {item.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {item.tags.map(t => (
                      <span key={t} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Memory Details Modal Drawer */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="notebook-page paper-texture animate-fade-in" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div className="notebook-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-accent">
                  {selectedEntry.moodEmoji || '🌿'} {selectedEntry.mood}
                </span>
                <button onClick={() => setSelectedEntry(null)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                  <X size={18} />
                </button>
              </div>

              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '22px', fontWeight: 600, lineHeight: 1.3, color: 'var(--text-main)' }}>
                {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              <div style={{ fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                {selectedEntry.content}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
