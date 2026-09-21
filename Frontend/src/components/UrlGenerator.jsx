import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { PRELOADED_URL_EXAMPLES } from '../data/starterData';

export default function UrlGenerator() {
  const { generateFromUrl, isGenerating, generationProgress, setActiveTab, setActiveNoteForViewer, notes } = useNotes();
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e)   => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    generateFromUrl(inputUrl);
  };

  const handleUseExample = (example) => {
    setInputUrl(example.url);
    generateFromUrl(example.url);
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
        <div className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          ⚡ Next-Gen AI Transcriber & Visualizer
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2
          }}
        >
          Transform Any YouTube Video & Web URL <br />
          Into <span style={{ background: 'linear-gradient(120deg, #6366f1, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Structured Notes, Mindmaps & Flowcharts</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px' }}>
          Paste a link below or choose from our preloaded examples to generate comprehensive summaries, actionable checklists, and interactive diagrams in seconds.
        </p>
      </div>

      {/* URL Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '8px 10px 8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}
      >
        <span style={{ fontSize: '1.2rem', color: 'var(--brand-primary)' }}>🔗</span>
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste YouTube link (https://youtube.com/watch?v=...) or Web URL..."
          disabled={isGenerating}
          style={{
            flex: 1,
            height: '46px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isGenerating}
          style={{
            height: '46px',
            padding: '0 24px',
            opacity: isGenerating ? 0.7 : 1,
            cursor: isGenerating ? 'wait' : 'pointer'
          }}
        >
          {isGenerating ? (
            <span>Processing... ⏳</span>
          ) : (
            <>
              <span>⚡</span>
              <span>Generate Notes</span>
            </>
          )}
        </button>
      </form>

      {/* Animated Generation Status */}
      {isGenerating && (
        <div
          style={{
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--brand-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-glow)',
            animation: 'descentFadeIn 0.3s ease forwards'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {generationProgress.text || 'Processing link...'}
            </span>
            <span className="badge badge-primary">Step {generationProgress.step} of 3</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(generationProgress.step / 3) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* 2 Preloaded Examples Showcase Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🚀</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700 }}>
              Try 2 Preloaded Examples (Instant Demo)
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to auto-populate & explore output</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {PRELOADED_URL_EXAMPLES.map((example, idx) => (
            <div
              key={example.id}
              className={`stagger-${idx + 1}`}
              style={{
                background: 'var(--bg-glass-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-normal)'
              }}
            >
              {/* Cover Banner */}
              <div
                style={{
                  height: '140px',
                  backgroundImage: `url(${example.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px'
                }}
              >
                <span
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {example.label}
                </span>

                <span
                  style={{
                    background: example.tag === 'YouTube' ? '#ef4444' : '#06b6d4',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {example.tag === 'YouTube' ? '▶ YouTube 42m' : '📄 MDN Doc'}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>
                  {example.title}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {example.summary}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{example.domain}</span>
                  <button
                    className="btn-secondary"
                    onClick={() => handleUseExample(example)}
                    disabled={isGenerating}
                    style={{ fontSize: '0.8rem', height: '34px', padding: '0 12px' }}
                  >
                    <span>⚡ Load & Generate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
