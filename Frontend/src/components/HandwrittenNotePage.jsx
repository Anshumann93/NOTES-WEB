import React from 'react';

export default function HandwrittenNotePage({ pageData, totalPages, paperStyle = 'ruled', fontSize = '1.15rem', noteTitle = '' }) {
  if (!pageData) return null;

  const pageNumber = pageData.pageNumber || 1;
  const header = pageData.header || pageData.title || noteTitle || 'Study Notes';
  const sections = pageData.sections || [];

  const paperClass = paperStyle === 'grid' ? 'grid-paper' : paperStyle === 'blank' ? 'blank-paper' : '';

  return (
    <div className={`notebook-page ${paperClass}`} style={{ fontSize }}>
      {/* Binding Hole punches */}
      <div className="notebook-holes">
        <div className="notebook-hole"></div>
        <div className="notebook-hole"></div>
        <div className="notebook-hole"></div>
      </div>

      {/* Page Header */}
      <div className="handwritten-header">
        <h2>{header}</h2>
        <span className="date-stamp">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Page Content Sections */}
      {sections.map((section, idx) => {
        const type = section.type || 'paragraph';

        if (type === 'heading') {
          return (
            <div key={idx} className="handwritten-section">
              <h3 className="handwritten-heading">📌 {section.title}</h3>
            </div>
          );
        }

        if (type === 'bullets' || Array.isArray(section.items)) {
          return (
            <div key={idx} className="handwritten-section">
              {section.title && <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{section.title}:</div>}
              <ul className="handwritten-bullets">
                {(section.items || []).map((item, bIdx) => (
                  <li key={bIdx}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (type === 'definition') {
          return (
            <div key={idx} className={`highlight-box ${section.highlight || 'yellow'}`}>
              <div className="highlight-title">📖 {section.term || section.title}</div>
              <div>{section.definition || section.content}</div>
            </div>
          );
        }

        if (type === 'formula') {
          return (
            <div key={idx} className={`highlight-box ${section.highlight || 'pink'}`}>
              <div className="highlight-title">🧪 {section.title || 'Formula / Theorem'}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1em' }}>
                {section.content || section.formula}
              </div>
            </div>
          );
        }

        if (type === 'example') {
          return (
            <div key={idx} className={`highlight-box ${section.highlight || 'green'}`}>
              <div className="highlight-title">💡 {section.title || 'Example'}</div>
              <div>{section.content}</div>
            </div>
          );
        }

        if (type === 'diagram') {
          const items = section.items || (typeof section.diagramData === 'string' ? section.diagramData.split('->') : []);
          return (
            <div key={idx} className="handwritten-diagram">
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1e3a8a' }}>
                🗺️ {section.title || 'Concept Diagram'}
              </div>
              <div className="diagram-flow">
                {items.map((node, nIdx) => (
                  <React.Fragment key={nIdx}>
                    <div className="diagram-node">{node.trim()}</div>
                    {nIdx < items.length - 1 && <span className="diagram-arrow">➔</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        }

        if (type === 'code') {
          return (
            <div key={idx} className="handwritten-code">
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0 }}>{section.content}</pre>
            </div>
          );
        }

        // Default paragraph
        return (
          <div key={idx} className="handwritten-section handwritten-paragraph">
            {section.content}
          </div>
        );
      })}

      {/* Page Footer */}
      <div className="handwritten-footer">
        Page {pageNumber} of {totalPages}
      </div>
    </div>
  );
}
