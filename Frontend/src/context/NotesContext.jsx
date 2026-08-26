import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotesService } from '../services/notesService';
import { AiGeneratorService } from '../services/aiGeneratorService';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'dashboard', 'features', 'notes', 'mindmap', 'flowchart'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Generation & Active View State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ step: 0, text: '' });
  const [activeNoteForViewer, setActiveNoteForViewer] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await NotesService.getNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const saveNote = async (noteData) => {
    try {
      await NotesService.saveNote(noteData);
      await loadNotes();
      showToast(noteData.id ? 'Note updated successfully!' : 'New note created!', 'success');
    } catch (err) {
      showToast('Error saving note', 'warn');
    }
  };

  const deleteNote = async (id, permanent = false) => {
    try {
      await NotesService.deleteNote(id, permanent);
      await loadNotes();
      showToast(permanent ? 'Note permanently deleted' : 'Note moved to trash', 'warn');
    } catch (err) {
      showToast('Error deleting note', 'warn');
    }
  };

  const togglePin = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await saveNote({ ...note, isPinned: !note.isPinned });
    showToast(note.isPinned ? 'Note unpinned' : 'Note pinned to top 📌', 'info');
  };

  const toggleTask = async (noteId, taskId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.checklist) return;
    const updatedChecklist = note.checklist.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    await saveNote({ ...note, checklist: updatedChecklist });
  };

  // Trigger AI generation from a URL
  const generateFromUrl = async (url) => {
    if (!url || !url.trim()) {
      showToast('Please enter or paste a valid URL', 'warn');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ step: 1, text: 'Fetching transcript & metadata...' });

    try {
      await new Promise(r => setTimeout(r, 600));
      setGenerationProgress({ step: 2, text: 'Analyzing key concepts & structuring markdown...' });

      await new Promise(r => setTimeout(r, 700));
      setGenerationProgress({ step: 3, text: 'Generating interactive Mindmap and Flowchart nodes...' });

      const generatedNote = await AiGeneratorService.generateFromUrl(url);
      await saveNote(generatedNote);
      setActiveNoteForViewer(generatedNote);
      showToast('⚡ Note, Mindmap & Flowchart generated successfully!', 'success');
      setActiveTab('notes');
    } catch (err) {
      showToast('Generation failed. Please check URL.', 'warn');
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ step: 0, text: '' });
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedTag,
        setSelectedTag,
        viewMode,
        setViewMode,
        isGenerating,
        generationProgress,
        generateFromUrl,
        activeNoteForViewer,
        setActiveNoteForViewer,
        saveNote,
        deleteNote,
        togglePin,
        toggleTask,
        isModalOpen,
        setIsModalOpen,
        editingNote,
        setEditingNote,
        toasts,
        showToast
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within NotesProvider');
  return context;
}
