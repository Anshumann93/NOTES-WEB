import React from 'react';
import { useNotes } from '../context/NotesContext';
import NoteCard from './NoteCard';
import UrlBookmarkCard from './UrlBookmarkCard';

export default function NotesGrid() {
  const { notes, selectedCategory, setSelectedCategory, selectedTag, setSelectedTag, searchQuery, viewMode, setViewMode, setIsModalOpen, setEditingNote } = useNotes();

  const categories = [
    { id: 'all', label: 'All Notes' },
    { id: 'work', label: '💼 Work' },
    { id: 'personal', label: '🌿 Personal' },
    { id: 'ideas', label: '💡 Ideas' },
    { id: 'tasks', label: '✅ Checklists' },
    { id: 'urls', label: '🌐 URLs' },
    { id: 'trash', label: '🗑️ Trash' }
  ];

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (selectedCategory === 'trash') return n.isTrash;
    if (n.isTrash) return false;

    if (selectedCategory === 'tasks') {
      if (n.type !== 'checklist' && !n.checklist?.length) return false;
    } else if (selectedCategory === 'urls') {
      if (n.type !== 'url_bookmark' && !n.url) return false;
    } else if (selectedCategory !== 'all') {
      if (n.category !== selectedCategory) return false;
    }

    if (selectedTag && (!n.tags || !n.tags.includes(selectedTag))) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (n.title || '').toLowerCase().includes(q);
      const contentMatch = (n.content || '').toLowerCase().includes(q);
      const tagMatch = n.tags && n.tags.some(t => t.toLowerCase().includes(q));
      return titleMatch || contentMatch || tagMatch;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned && selectedCategory === 'all');
  const regularNotes = selectedCategory === 'all' ? filteredNotes.filter(n => !n.isPinned) : filteredNotes;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Category Bar & View Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat.id ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
          <button
            onClick={() => setViewMode('grid')}
            title="Grid View"
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'var(--brand-primary)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ⊞
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'var(--brand-primary)' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Tag Filter Active Badge */}
      {selectedTag && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtering by Tag:</span>
          <span className="badge badge-primary">
            #{selectedTag}
            <button onClick={() => setSelectedTag(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '4px' }}>✕</button>
          </span>
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '3rem' }}>📝</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>No notes found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {searchQuery ? `No results matching "${searchQuery}"` : 'Create a note or generate from a URL!'}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          >
            + Create New Note
          </button>
        </div>
      ) : (
        <>
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                📌 Pinned Notes
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                  gap: '20px'
                }}
              >
                {pinnedNotes.map((note, idx) => (
                  note.type === 'url_bookmark' ? (
                    <UrlBookmarkCard key={note.id} note={note} index={idx} />
                  ) : (
                    <NoteCard key={note.id} note={note} index={idx} />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Regular Section */}
          <div>
            {pinnedNotes.length > 0 && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 12px' }}>
                📝 Other Notes
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                gap: '20px'
              }}
            >
              {regularNotes.map((note, idx) => (
                note.type === 'url_bookmark' ? (
                  <UrlBookmarkCard key={note.id} note={note} index={idx} />
                ) : (
                  <NoteCard key={note.id} note={note} index={idx} />
                )
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
