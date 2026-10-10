import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotesProvider, useNotes } from './context/NotesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import UrlGenerator from './components/UrlGenerator';
import Dashboard from './components/Dashboard';
import KeyFeatures from './components/KeyFeatures';
import NotesGrid from './components/NotesGrid';
import MindmapViewer from './components/MindmapViewer';
import FlowchartViewer from './components/FlowchartViewer';
import NoteEditorModal from './components/NoteEditorModal';
import NoteViewer from './components/NoteViewer';
import Toast from './components/Toast';
import HandwrittenNotesViewer from './components/HandwrittenNotesViewer';
import StudyShellLogo from './assets/StudyShellLogo';

function AppContent() {
  const { activeTab, activeNoteForViewer, setActiveNoteForViewer } = useNotes();
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  // Show handwritten overlay only when viewing a handwritten note AND not on diagram/viewer tabs
  const isMindmapOrFlowchart = activeTab === 'mindmap' || activeTab === 'flowchart';
  const isHandwrittenNote = activeNoteForViewer && (activeNoteForViewer.noteStyle === 'handwritten' || activeNoteForViewer.handwrittenData);

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'generator' && <UrlGenerator />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'features' && <KeyFeatures />}
        {activeTab === 'notes' && <NotesGrid />}
        {activeTab === 'noteviewer' && <NoteViewer />}
        {activeTab === 'mindmap' && <MindmapViewer />}
        {activeTab === 'flowchart' && <FlowchartViewer />}
      </main>

      {/* Handwritten Notebook Overlay — only for handwritten notes not on diagram/viewer tabs */}
      {activeNoteForViewer && isHandwrittenNote && !isMindmapOrFlowchart && activeTab !== 'noteviewer' && (
        <HandwrittenNotesViewer
          note={activeNoteForViewer}
          onClose={() => setActiveNoteForViewer(null)}
        />
      )}

      {/* Modal Dialog & Toast */}
      <NoteEditorModal />
      <Toast />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 32px',
          background: 'var(--bg-surface)',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <StudyShellLogo size={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>StudyShell Notes Generator v1.0.0</span>
          <span>•</span>
          <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>🌟 AI-Powered Study Materials</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>
          <AppContent />
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
