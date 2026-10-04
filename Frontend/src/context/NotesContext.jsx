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
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Modular background polling for processing notes (easy to swap with WebSockets/SSE later)
  useEffect(() => {
    const processingNotes = notes.filter(n => n.status === 'pending' || n.status === 'processing');
    if (processingNotes.length === 0) return;

    const timer = setInterval(async () => {
      let stateChanged = false;
      for (const pNote of processingNotes) {
        try {
          const statusResult = await NotesService.getNoteStatus(pNote.id);
          if (statusResult.status === 'completed' || statusResult.status === 'failed') {
            stateChanged = true;
            if (statusResult.status === 'completed') {
              showToast(`Generation completed for: ${statusResult.title || 'Note'}`, 'success');
            } else {
              showToast(`Generation failed for: ${statusResult.title || 'Note'}`, 'warn');
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }
      
      // If any note finished processing, seamlessly refresh the full list without reloading the page
      if (stateChanged) {
        loadNotes();
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [notes]);

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
  const generateFromUrl = async (url, options = {}) => {
    if (!url || !url.trim()) {
      showToast('Please enter or paste a valid YouTube URL', 'warn');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ step: 1, text: 'Validating YouTube URL & transcript...' });

    try {
      // 1. Trigger the job on backend
      const result = await AiGeneratorService.generateFromUrl(url, options);
      const pendingNoteId = result._id || result.id;
      
      // 2. Refresh notes list to show pending note card
      await loadNotes();
      
      showToast('Extracting transcript and generating notes...', 'info');

      // 3. Poll for progress and completion
      if (pendingNoteId) {
        const completedNote = await AiGeneratorService.pollGenerationStatus(
          pendingNoteId,
          2000,
          90,
          (statusUpdate) => {
            if (statusUpdate?.progressText) {
              setGenerationProgress({
                step: statusUpdate.progressStep || 2,
                text: statusUpdate.progressText
              });
            }
          }
        );

        await loadNotes();
        showToast(`Notes generated successfully: ${completedNote.title}`, 'success');

        // Automatically open handwritten notebook viewer if generated in handwritten style
        if (completedNote.noteStyle === 'handwritten' || options.noteStyle === 'handwritten') {
          setActiveNoteForViewer(completedNote);
        }
      }
    } catch (err) {
      console.error('[NotesContext] Generation error:', err);
      showToast(err.message || 'Generation failed to start.', 'warn');
      await loadNotes();
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
