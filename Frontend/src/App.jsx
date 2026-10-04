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

  const isMindmapOrFlowchart = activeTab === 'mindmap' || activeTab === 'flowchart';

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
        {activeTab === 'mindmap' && <MindmapViewer />}
        {activeTab === 'flowchart' && <FlowchartViewer />}
      </main>

      {/* Handwritten Notebook Overlay Modal */}
      {activeNoteForViewer && !isMindmapOrFlowchart && (
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
          <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>🌟 Ready for Backend API Integration</span>
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
