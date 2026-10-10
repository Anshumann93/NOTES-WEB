import React from 'react';
import { useNotes } from '../context/NotesContext';

export default function UrlBookmarkCard({ note, index }) {
  const { deleteNote, setEditingNote, setIsModalOpen, setActiveNoteForViewer, setActiveTab, showToast } = useNotes();

  const copyUrl = () => {
    navigator.clipboard.writeText(note.url || note.youtubeUrl || '');
    showToast('📋 Copied URL to clipboard!', 'success');
  };

  return (
    <div
      className={`stagger-${(index % 6) + 1}`}
      onClick={() => {
        if (note.noteStyle === 'handwritten' || note.handwrittenData) {
          // Handwritten notes -> open overlay
          setActiveNoteForViewer(note);
        } else if (note.notes || note.sourceType === 'youtube' || note.summary) {
          // AI-generated notes -> open NoteViewer tab
          setActiveNoteForViewer(note);
          setActiveTab('noteviewer');
        } else {
          // Plain bookmark -> edit modal
          setEditingNote(note);
          setIsModalOpen(true);
        }
      }}
      style={{
        background: 'var(--bg-glass-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
        cursor: 'pointer'
      }}
    >
      {/* Cover Image Banner */}
      <div
        style={{
          height: '140px',
          backgroundImage: `url(${note.image || note.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <span>{note.sourceType === 'youtube' ? '▶' : '🌐'}</span>
          <span>{note.domain || 'web'}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.35 }}>
          {note.title}
        </h3>

        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {note.summary || note.content?.slice(0, 180)}
        </p>

        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {note.tags.map(t => (
              <span key={t} className="badge" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 'auto'
          }}
        >
          <a
            href={note.url || note.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: 'var(--brand-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {note.sourceType === 'youtube' ? 'Watch Video' : 'Visit Link'} ↗
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* AI Notes button for non-handwritten AI-generated notes */}
            {(note.notes || note.summary) && !(note.handwrittenData || note.noteStyle === 'handwritten') && (
              <button
                className="btn-primary"
                title="Open AI generated notes"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNoteForViewer(note);
                  setActiveTab('noteviewer');
                }}
                style={{ fontSize: '0.76rem', padding: '4px 8px', height: '28px' }}
              >
                📝 Notes
              </button>
            )}
            {/* Handwritten notebook button */}
            {(note.handwrittenData || note.noteStyle === 'handwritten') && (
              <button
                className="btn-primary"
                title="Open handwritten notebook"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNoteForViewer(note);
                }}
                style={{ fontSize: '0.76rem', padding: '4px 8px', height: '28px', background: 'linear-gradient(135deg, #d97706, #b45309)' }}
              >
                ✍️ Notebook
              </button>
            )}
            {/* Mindmap button */}
            {(note.mindmapData || note.mindMap) && (
              <button
                className="btn-ghost"
                title="Mindmap"
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

            {/* Flowchart button */}
            {(note.flowchartData || note.flowchart) && (
              <button
                className="btn-ghost"
                title="Open Flow Diagram"
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
              title="Copy URL"
              onClick={(e) => {
                e.stopPropagation();
                copyUrl();
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
    </div>
  );
}
