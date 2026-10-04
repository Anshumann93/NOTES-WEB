import React from 'react';

export default function HandwrittenNotesToolbar({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  paperStyle,
  onPaperStyleChange,
  fontSize,
  onFontSizeChange,
  onExportPdf,
  isExportingPdf,
  onClose
}) {
  return (
    <div className="notebook-toolbar">
      {/* Page Navigation */}
      <div className="notebook-toolbar-group">
        <button
          className="notebook-btn"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          title="Previous Page"
        >
          ◀ Prev
        </button>
        <span style={{ fontWeight: 600, fontSize: '0.92rem', padding: '0 8px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="notebook-btn"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          title="Next Page"
        >
          Next ▶
        </button>
      </div>

      {/* Paper & Text Options */}
      <div className="notebook-toolbar-group">
        <select
          value={paperStyle}
          onChange={(e) => onPaperStyleChange(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ruled" style={{ background: '#1e293b', color: '#fff' }}>📝 Ruled Paper</option>
          <option value="grid" style={{ background: '#1e293b', color: '#fff' }}>📐 Grid Paper</option>
          <option value="blank" style={{ background: '#1e293b', color: '#fff' }}>📄 Blank Paper</option>
        </select>

        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="1.05rem" style={{ background: '#1e293b', color: '#fff' }}>Compact Font</option>
          <option value="1.15rem" style={{ background: '#1e293b', color: '#fff' }}>Normal Font</option>
          <option value="1.3rem" style={{ background: '#1e293b', color: '#fff' }}>Large Font</option>
        </select>
      </div>

      {/* Export & Close Actions */}
      <div className="notebook-toolbar-group">
        <button
          className="notebook-btn notebook-btn-primary"
          onClick={onExportPdf}
          disabled={isExportingPdf}
        >
          {isExportingPdf ? '⏳ Exporting PDF...' : '📥 Export PDF'}
        </button>
        <button
          className="notebook-btn"
          onClick={onClose}
          style={{ color: '#fca5a5' }}
          title="Close Notebook"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
