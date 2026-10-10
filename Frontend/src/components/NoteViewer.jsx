import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#{3}\s(.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;margin:1.2em 0 0.4em;color:var(--brand-primary)">$1</h3>')
    .replace(/^#{2}\s(.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:800;margin:1.4em 0 0.5em;color:var(--text-primary)">$1</h2>')
    .replace(/^#{1}\s(.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:800;margin:1.5em 0 0.6em;color:var(--text-primary)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-surface-elevated);padding:2px 6px;border-radius:4px;font-size:0.9em;font-family:monospace">$1</code>')
    .replace(/^```[\w]*\n([\s\S]*?)```$/gm, '<pre style="background:var(--bg-surface-elevated);border:1px solid var(--border-subtle);padding:14px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:0.88rem;line-height:1.6;margin:1em 0"><code>$1</code></pre>')
    .replace(/^- \[x\] (.+)$/gm, '<div style="display:flex;gap:8px;align-items:center;padding:4px 0"><span style="color:var(--brand-emerald);font-size:1rem">✅</span><span style="text-decoration:line-through;color:var(--text-muted)">$1</span></div>')
    .replace(/^- \[ \] (.+)$/gm, '<div style="display:flex;gap:8px;align-items:center;padding:4px 0"><span style="color:var(--text-muted);font-size:1rem">☐</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--brand-primary);margin:0.8em 0;padding:8px 14px;background:rgba(99,102,241,0.06);border-radius:0 6px 6px 0;color:var(--text-secondary);font-style:italic">$1</blockquote>')
    .replace(/\n\n/g, '</p><p style="margin:0.8em 0;line-height:1.7;color:var(--text-secondary)">')
    .replace(/^(?!<[hlpbcd])(.+)$/gm, (m) => m.trim() ? m : '');
}

export default function NoteViewer() {
  const { activeNoteForViewer, setActiveNoteForViewer, setActiveTab, toggleTask } = useNotes();
  const [activeSection, setActiveSection] = useState('notes'); // 'notes' | 'flashcards' | 'checklist'
  const [flippedCard, setFlippedCard] = useState(null);

  if (!activeNoteForViewer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '3rem' }}>📄</span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>No Note Selected</h3>
        <p style={{ fontSize: '0.9rem' }}>Go to the Notes tab and click a note to view it here.</p>
        <button className="btn-primary" onClick={() => setActiveTab('notes')}>← Browse Notes</button>
      </div>
    );
  }

  const note = activeNoteForViewer;
  const hasNotes = !!(note.notes || note.content);
  const hasFlashcards = Array.isArray(note.flashcards) && note.flashcards.length > 0;
  const hasChecklist = Array.isArray(note.checklist) && note.checklist.length > 0;
  const hasMindmap = !!(note.mindmapData || note.mindMap);
  const hasFlowchart = !!(note.flowchartData || note.flowchart);

  const sections = [
    { id: 'notes', label: '📝 Notes', show: true },
    { id: 'flashcards', label: `🃏 Flashcards (${note.flashcards?.length || 0})`, show: hasFlashcards },
    { id: 'checklist', label: `✅ Checklist (${note.checklist?.length || 0})`, show: hasChecklist },
  ].filter(s => s.show);

  const noteContent = note.notes || note.content || note.summary || 'No content available.';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Note Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <button
            className="btn-ghost"
            onClick={() => { setActiveNoteForViewer(null); setActiveTab('notes'); }}
            style={{ fontSize: '0.82rem', marginBottom: '10px', padding: '4px 8px' }}
          >
            ← Back to Notes
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '8px' }}>
            {note.title}
          </h1>
          {note.summary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '720px' }}>
              {note.summary}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            {note.tags?.map(t => (
              <span key={t} className="badge" style={{ fontSize: '0.72rem' }}>#{t}</span>
            ))}
            {note.domain && <span className="badge" style={{ fontSize: '0.72rem' }}>🌐 {note.domain}</span>}
            {note.noteStyle && <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{note.noteStyle}</span>}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {hasMindmap && (
            <button className="btn-secondary" onClick={() => setActiveTab('mindmap')} style={{ fontSize: '0.82rem', height: '34px' }}>
              🧠 Mindmap
            </button>
          )}
          {hasFlowchart && (
            <button className="btn-secondary" onClick={() => setActiveTab('flowchart')} style={{ fontSize: '0.82rem', height: '34px' }}>
              🔀 Flowchart
            </button>
          )}
          {note.youtubeUrl && (
            <a
              href={note.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.82rem', height: '34px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              ▶ Source Video
            </a>
          )}
        </div>
      </div>

      {/* Section Tab Switcher */}
      {sections.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                background: activeSection === s.id ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                color: activeSection === s.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Notes Section */}
      {activeSection === 'notes' && (
        <div
          style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            boxShadow: 'var(--shadow-md)',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            fontSize: '0.95rem'
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `<p style="margin:0.8em 0;line-height:1.7;color:var(--text-secondary)">${renderMarkdown(noteContent)}</p>`
            }}
          />
        </div>
      )}

      {/* Flashcards Section */}
      {activeSection === 'flashcards' && hasFlashcards && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click a card to flip it and reveal the answer.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {note.flashcards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => setFlippedCard(flippedCard === idx ? null : idx)}
                style={{
                  background: flippedCard === idx ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' : 'var(--bg-glass-card)',
                  border: flippedCard === idx ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  cursor: 'pointer',
                  minHeight: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-normal)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  {flippedCard === idx ? 'Answer' : 'Question'}
                </span>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
                  {flippedCard === idx ? card.back : card.front}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  {flippedCard === idx ? '↩ Click to flip back' : '↩ Click to reveal answer'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Section */}
      {activeSection === 'checklist' && hasChecklist && (
        <div
          style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>Study Checklist</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {note.checklist.filter(t => t.completed).length} / {note.checklist.length} completed
            </span>
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              height: '100%',
              width: `${Math.round((note.checklist.filter(t => t.completed).length / note.checklist.length) * 100)}%`,
              background: 'linear-gradient(90deg, #6366f1, #10b981)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          {note.checklist.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(note.id, task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: task.completed ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface-elevated)',
                border: task.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}}
                style={{ accentColor: 'var(--brand-emerald)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '0.9rem',
                color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: task.completed ? 'line-through' : 'none',
                flex: 1
              }}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
