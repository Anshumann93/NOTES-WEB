import React, { useState, useRef } from 'react';
import HandwrittenNotePage from './HandwrittenNotePage';
import HandwrittenNotesToolbar from './HandwrittenNotesToolbar';
import './handwritten-notes.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function HandwrittenNotesViewer({ note, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paperStyle, setPaperStyle] = useState('ruled'); // 'ruled' | 'grid' | 'blank'
  const [fontSize, setFontSize] = useState('1.15rem');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printContainerRef = useRef(null);

  if (!note) return null;

  // Normalize handwritten data
  let pages = [];
  if (note.handwrittenData && Array.isArray(note.handwrittenData.pages)) {
    pages = note.handwrittenData.pages;
  } else {
    // Convert standard markdown content into structured pages
    const rawContent = note.content || note.notes || note.summary || 'No content available';
    const lines = rawContent.split('\n');
    let page1Sections = [];

    lines.forEach(line => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        page1Sections.push({ type: 'heading', title: line.replace(/^#{2,3}\s?/, '') });
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        page1Sections.push({ type: 'bullets', items: [line.replace(/^[-*]\s?/, '')] });
      } else if (line.trim().length > 0) {
        page1Sections.push({ type: 'paragraph', content: line.trim() });
      }
    });

    pages = [
      {
        pageNumber: 1,
        header: note.title || 'Handwritten Notes',
        sections: page1Sections.length > 0 ? page1Sections : [{ type: 'paragraph', content: rawContent }]
      }
    ];
  }

  const totalPages = pages.length || 1;
  const activePageData = pages[currentPage - 1] || pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const renderContainer = printContainerRef.current;
      if (!renderContainer) {
        throw new Error('Export target container not found');
      }

      const pageNodes = renderContainer.querySelectorAll('.notebook-page');

      for (let i = 0; i < pageNodes.length; i++) {
        const pageEl = pageNodes[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#faf6ee'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      }

      const safeTitle = (note.title || 'Handwritten_Notes').replace(/[^a-z0-9]/gi, '_');
      pdf.save(`${safeTitle}_Notebook.pdf`);
    } catch (err) {
      console.error('[HandwrittenNotesViewer] PDF Export Failed:', err);
      alert(`PDF Export Failed: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="notebook-overlay">
      <div className="notebook-container">
        {/* Top Control Bar */}
        <HandwrittenNotesToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          paperStyle={paperStyle}
          onPaperStyleChange={setPaperStyle}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onExportPdf={handleExportPdf}
          isExportingPdf={isExportingPdf}
          onClose={onClose}
        />

        {/* Currently Visible Notebook Page */}
        <HandwrittenNotePage
          pageData={activePageData}
          totalPages={totalPages}
          paperStyle={paperStyle}
          fontSize={fontSize}
          noteTitle={note.title}
        />
      </div>

      {/* Hidden Offscreen Container for PDF Export of ALL Pages */}
      <div
        ref={printContainerRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px'
        }}
      >
        {pages.map((pData, idx) => (
          <HandwrittenNotePage
            key={idx}
            pageData={pData}
            totalPages={totalPages}
            paperStyle={paperStyle}
            fontSize={fontSize}
            noteTitle={note.title}
          />
        ))}
      </div>
    </div>
  );
}
