import React from 'react';
import { useNotes } from '../context/NotesContext';

export default function KeyFeatures() {
  const { setActiveTab } = useNotes();

  const features = [
    {
      id: 'feat-yt',
      icon: '🎥',
      title: 'YouTube & URL Video Summarizer',
      desc: 'Converts full YouTube video lectures and tutorials into high-yield Markdown summaries with key timestamps and takeaways.',
      badge: 'Video AI',
      color: '#ef4444',
      actionTab: 'generator',
      actionLabel: 'Try URL Generator →'
    },
    {
      id: 'feat-mm',
      icon: '🧠',
      title: 'Interactive Mindmap Generator',
      desc: 'Transforms complex transcripts and articles into an interactive node hierarchy. Zoom, pan, and expand conceptual branches freely.',
      badge: 'Visual Graph',
      color: '#8b5cf6',
      actionTab: 'mindmap',
      actionLabel: 'Open Mindmap Studio →'
    },
    {
      id: 'feat-flow',
      icon: '🔀',
      title: 'Workflow Flowchart Synthesizer',
      desc: 'Automatically maps technical processes, decision trees, and system logic into step-by-step flowchart diagrams with animated signal paths.',
      badge: 'Diagrams',
      color: '#06b6d4',
      actionTab: 'flowchart',
      actionLabel: 'Open Flowchart Studio →'
    },
    {
      id: 'feat-tasks',
      icon: '✅',
      title: 'Actionable Checklist Extractor',
      desc: 'Scans content for action items and creates interactive task lists with completion tracking, progress bars, and reminders.',
      badge: 'Productivity',
      color: '#10b981',
      actionTab: 'notes',
      actionLabel: 'View Task Checklists →'
    },
    {
      id: 'feat-bookmark',
      icon: '🌐',
      title: 'Rich OpenGraph URL Previews',
      desc: 'Generates stylish web bookmark cards with live domain badges, high-resolution thumbnail banners, and instant site navigation.',
      badge: 'Bookmarks',
      color: '#3b82f6',
      actionTab: 'notes',
      actionLabel: 'Explore URL Cards →'
    },
    {
      id: 'feat-export',
      icon: '📦',
      title: 'Seamless Backend & Cloud Sync',
      desc: 'Built with clean, decoupled API services for effortless backend integration, JSON backup exports, and zero-latency local caching.',
      badge: 'Architecture',
      color: '#f59e0b',
      actionTab: 'dashboard',
      actionLabel: 'View Dashboard & Stats →'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="badge badge-purple" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          ✨ Platform Capabilities
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}
        >
          What StudyShell Notes Generator Can Do
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '620px' }}>
          Discover the complete suite of AI-driven synthesis, visual mapping, and productivity tools engineered to supercharge your learning and workflow.
        </p>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {features.map((feat, idx) => (
          <div
            key={feat.id}
            className={`stagger-${(idx % 6) + 1}`}
            style={{
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: `${feat.color}18`,
                  border: `1px solid ${feat.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}
              >
                {feat.icon}
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {feat.badge}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn-ghost"
                onClick={() => setActiveTab(feat.actionTab)}
                style={{
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '4px 0'
                }}
              >
                {feat.actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
