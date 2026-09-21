import React from 'react';
import StudyShellLogo from '../assets/StudyShellLogo';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, setIsModalOpen, setEditingNote, searchQuery, setSearchQuery } = useNotes();

  const navItems = [
    { id: 'generator', label: '⚡ URL Generator', badge: 'AI' },
    { id: 'dashboard', label: '📊 Dashboard & History' },
    { id: 'features', label: '✨ Key Features' },
    { id: 'notes', label: '📝 Notes & Bookmarks' },
    { id: 'mindmap', label: '🧠 Mindmap Studio' },
    { id: 'flowchart', label: '🔀 Flow Diagrams' },
  ];

  return (
    <header
      style={{
        height: '72px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        gap: '16px'
      }}
    >
      {/* Brand Logo */}
      <div onClick={() => setActiveTab('generator')}>
        <StudyShellLogo size={38} />
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--brand-primary)',
                    color: '#ffffff'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Search, Theme Toggle, New Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes / URLs..."
            style={{
              width: '100%',
              height: '38px',
              padding: '0 32px 0 34px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Create Note Button */}
        <button
          className="btn-primary"
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
