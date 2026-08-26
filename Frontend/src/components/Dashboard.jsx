import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { NotesService } from '../services/notesService';

export default function Dashboard() {
  const { notes, setActiveTab, setActiveNoteForViewer, deleteNote, showToast } = useNotes();
  const [stats, setStats] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    NotesService.getDashboardStats().then(s => setStats(s));
  }, [notes]);

  const filteredHistory = notes.filter(note => {
    if (note.isTrash) return false;
    if (historyFilter === 'youtube') return note.sourceType === 'youtube' || (note.url && note.url.includes('youtube'));
    if (historyFilter === 'web') return note.sourceType === 'web_doc' || (note.url && !note.url.includes('youtube'));
    if (historyFilter === 'tasks') return note.type === 'checklist' || note.checklist?.length > 0;
    if (historyFilter === 'visuals') return !!note.mindmapData || !!note.flowchartData;

    if (historySearch) {
      const q = historySearch.toLowerCase();
      return (note.title || '').toLowerCase().includes(q) || (note.content || '').toLowerCase().includes(q);
    }
    return true;
  });

  const exportBackup = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tubeshell-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Notes backup exported successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
            📊 Productivity Dashboard & History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Monitor your AI generation activity, synthesis progress, and past note history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={exportBackup}>
            <span>📦</span>
            <span>Export JSON Backup</span>
          </button>
          <button className="btn-primary" onClick={() => setActiveTab('generator')}>
            <span>⚡</span>
            <span>Generate New Note</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        <div className="stagger-1" style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Notes</span>
            <span style={{ fontSize: '1.2rem' }}>📝</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.totalNotes || notes.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>↑ +3 this week</span>
        </div>

        <div className="stagger-2" style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>URLs Processed</span>
            <span style={{ fontSize: '1.2rem' }}>🌐</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>
            {stats?.urlsProcessed || 14}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YouTube & Web Docs</span>
        </div>

        <div className="stagger-3" style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mindmaps Built</span>
            <span style={{ fontSize: '1.2rem' }}>🧠</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--brand-purple)' }}>
            {stats?.mindmapsCreated || 5}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-purple)', fontWeight: 600 }}>Interactive Nodes</span>
        </div>

        <div className="stagger-4" style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks Completed</span>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--brand-emerald)' }}>
            {stats?.tasksCompletedRate || 78}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', fontWeight: 600 }}>High Productivity</span>
        </div>
      </div>

      {/* Generation History Timeline Table */}
      <div
        style={{
          background: 'var(--bg-glass-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
              📜 Generation History & Past Notes
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing {filteredHistory.length} generated items
            </span>
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'youtube', label: '🎥 YouTube' },
              { id: 'web', label: '🌐 Web Docs' },
              { id: 'tasks', label: '✅ Checklists' },
              { id: 'visuals', label: '🧠 Visuals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setHistoryFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: historyFilter === tab.id ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                  color: historyFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No history found matching your filter.
            </div>
          ) : (
            filteredHistory.map(note => (
              <div
                key={note.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.3rem' }}>
                    {note.sourceType === 'youtube' ? '🎥' : (note.type === 'checklist' ? '✅' : '📝')}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.title}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{note.domain || 'TubeShell Notes'}</span>
                      <span>•</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      {note.tags?.map(t => (
                        <span key={t} className="badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setActiveNoteForViewer(note);
                      setActiveTab('notes');
                    }}
                    style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
                  >
                    View Note ↗
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setActiveNoteForViewer(note);
                      setActiveTab('mindmap');
                    }}
                    style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
                  >
                    🧠 Mindmap
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setActiveNoteForViewer(note);
                      setActiveTab('flowchart');
                    }}
                    style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
                  >
                    🔀 Flow
                  </button>

                  <button
                    className="btn-ghost"
                    onClick={() => deleteNote(note.id, false)}
                    title="Move to trash"
                    style={{ color: 'var(--brand-rose)', padding: '6px' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
