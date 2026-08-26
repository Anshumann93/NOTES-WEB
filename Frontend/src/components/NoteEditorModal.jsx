import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';

export default function NoteEditorModal() {
  const { isModalOpen, setIsModalOpen, editingNote, saveNote } = useNotes();

  const [modalType, setModalType] = useState('note'); // 'note' | 'checklist' | 'url'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('work');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setUrl(editingNote.url || '');
      setCategory(editingNote.category || 'work');
      setTags((editingNote.tags || []).join(', '));
      setColor(editingNote.color || 'indigo');
      setModalType(editingNote.type === 'url_bookmark' ? 'url' : (editingNote.type === 'checklist' ? 'checklist' : 'note'));
    } else {
      setTitle('');
      setContent('');
      setUrl('');
      setCategory('work');
      setTags('');
      setColor('indigo');
      setModalType('note');
    }
  }, [editingNote, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    let checklist = [];
    if (modalType === 'checklist') {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const clean = line.replace(/^-\s*\[[ xX]\]\s*/, '').trim();
        if (clean) {
          checklist.push({
            id: `task-${idx + 1}`,
            text: clean,
            completed: /^-\s*\[[xX]\]/.test(line.trim())
          });
        }
      });
    }

    const payload = {
      ...(editingNote || {}),
      type: modalType === 'url' ? 'url_bookmark' : (modalType === 'checklist' ? 'checklist' : 'note'),
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      url: url.trim(),
      domain: url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '') : '',
      category,
      tags: tagArray,
      color,
      checklist
    };

    saveNote(payload);
    setIsModalOpen(false);
  };

  const insertMarkdown = (syntax) => {
    setContent(prev => `${prev}\n${syntax}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        animation: 'descentFadeIn 0.25s ease forwards'
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
          animation: 'modalDropIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
            {editingNote ? '✏️ Edit Note' : '✨ Create New Note'}
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Note Type Selector */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            {[
              { id: 'note', label: '📝 Markdown Note' },
              { id: 'checklist', label: '✅ Checklist' },
              { id: 'url', label: '🌐 URL Bookmark' }
            ].map(tab => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setModalType(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: modalType === tab.id ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                  color: modalType === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {modalType === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Target URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/resource"
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title or heading..."
              required
              style={{
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Helper Toolbar for Markdown */}
          {modalType !== 'url' && (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('**bold text**')} title="Bold"><b>B</b></button>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('*italic text*')} title="Italic"><i>I</i></button>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('### Heading')} title="H3">H3</button>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('```javascript\n// code\n```')} title="Code">&lt;/&gt;</button>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('> Quote text')} title="Quote">”</button>
              <button type="button" className="btn-ghost" onClick={() => insertMarkdown('- [ ] New task')} title="Task">☑</button>
            </div>
          )}

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              {modalType === 'checklist' ? 'Checklist Items (use - [ ] for tasks)' : 'Note Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder={modalType === 'checklist' ? "- [ ] Review requirements\n- [ ] Deploy release" : "Write your structured notes or thoughts..."}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Category & Tags Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                <option value="work">💼 Work & Tech</option>
                <option value="personal">🌿 Personal</option>
                <option value="ideas">💡 Ideas</option>
                <option value="tasks">✅ Checklists</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, Architecture, Todo"
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Color Accent</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'indigo', hex: '#6366f1' },
                { id: 'purple', hex: '#8b5cf6' },
                { id: 'cyan', hex: '#06b6d4' },
                { id: 'emerald', hex: '#10b981' },
                { id: 'amber', hex: '#f59e0b' },
                { id: 'rose', hex: '#f43f5e' }
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    background: c.hex,
                    cursor: 'pointer',
                    transform: color === c.id ? 'scale(1.2)' : 'scale(1)',
                    border: color === c.id ? '2px solid #ffffff' : 'none',
                    boxShadow: color === c.id ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Note</button>
          </div>
        </form>
      </div>
    </div>
  );
}
