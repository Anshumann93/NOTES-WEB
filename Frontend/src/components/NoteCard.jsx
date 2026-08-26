import React from 'react';
import { useNotes } from '../context/NotesContext';

export default function NoteCard({ note, index }) {
  const { togglePin, toggleTask, deleteNote, setEditingNote, setIsModalOpen, setActiveNoteForViewer, setActiveTab, showToast } = useNotes();

  const isChecklist = note.type === 'checklist' || (note.checklist && note.checklist.length > 0);
  const completedCount = note.checklist ? note.checklist.filter(t => t.completed).length : 0;
  const totalCount = note.checklist ? note.checklist.length : 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const copyText = () => {
    navigator.clipboard.writeText(note.content || note.title);
    showToast('📋 Copied note to clipboard!', 'success');
  };

  return (
    <div
      className={`stagger-${(index % 6) + 1}`}
      onClick={() => {
        setEditingNote(note);
        setIsModalOpen(true);
      }}
      style={{
        background: 'var(--bg-glass-card)',
        backdropFilter: 'blur(12px)',
        border: note.isPinned ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: note.isPinned ? '0 4px 18px rgba(99, 102, 241, 0.15)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Top Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--brand-primary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {note.category || 'General'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note.id);
            }}
            title={note.isPinned ? 'Unpin' : 'Pin to top'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              opacity: note.isPinned ? 1 : 0.4
            }}
          >
            📌
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.12rem', fontWeight: 700, lineHeight: 1.35 }}>
        {note.title}
      </h3>

      {/* Body / Checklist */}
      {isChecklist ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {note.checklist.slice(0, 4).map(task => (
            <div
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                toggleTask(note.id, task.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: task.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                textDecoration: task.completed ? 'line-through' : 'none'
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}}
                style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
              />
              <span>{task.text}</span>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{ flex: 1, height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-emerald)' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{completedCount}/{totalCount} ({pct}%)</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-line'
          }}
        >
          {note.content?.replace(/#{1,6}\s?/g, '').slice(0, 240)}
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {note.tags.map(t => (
            <span key={t} className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {note.mindmapData && (
            <button
              className="btn-ghost"
              title="Open Mindmap"
              onClick={(e) => {
                e.stopPropagation();
                setActiveNoteForViewer(note);
                setActiveTab('mindmap');
              }}
              style={{ fontSize: '0.8rem', padding: '4px 6px' }}
            >
              🧠
            </button>
          )}

          {note.flowchartData && (
            <button
              className="btn-ghost"
              title="Open Flowchart"
              onClick={(e) => {
                e.stopPropagation();
                setActiveNoteForViewer(note);
                setActiveTab('flowchart');
              }}
              style={{ fontSize: '0.8rem', padding: '4px 6px' }}
            >
              🔀
            </button>
          )}

          <button
            className="btn-ghost"
            title="Copy Text"
            onClick={(e) => {
              e.stopPropagation();
              copyText();
            }}
            style={{ fontSize: '0.8rem', padding: '4px 6px' }}
          >
            📋
          </button>

          <button
            className="btn-ghost"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              deleteNote(note.id);
            }}
            style={{ fontSize: '0.8rem', padding: '4px 6px', color: 'var(--brand-rose)' }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
