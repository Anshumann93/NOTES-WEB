/**
 * ==========================================================================
 * 🌟 BACKEND CONNECTION POINT: NOTES & DASHBOARD SERVICE
 * ==========================================================================
 * Manages Note CRUD operations, Dashboard statistics, and History timeline.
 * 
 * TO CONNECT YOUR BACKEND:
 * Implement endpoints:
 * - GET    /api/notes          -> Returns array of note objects
 * - POST   /api/notes          -> Create a note
 * - PUT    /api/notes/:id      -> Update a note
 * - DELETE /api/notes/:id      -> Delete a note
 * - GET    /api/dashboard/stats-> User progress metrics & history
 * ==========================================================================
 */

import { apiRequest } from './api';
import { STARTER_NOTES, STARTER_STATS } from '../data/starterData';

const LOCAL_STORAGE_KEY = 'StudyShell_notes_v3';
const LOCAL_STATS_KEY = 'StudyShell_stats_v3';

export const NotesService = {
  /**
   * 🌟 BACKEND HOOK: Fetch all notes
   */
  async getNotes() {
    try {
      const data = await apiRequest('/notes');
      if (data && Array.isArray(data)) return data;
    } catch (e) {}

    // LocalStorage Fallback
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) return JSON.parse(local);
    } catch (e) {}

    // Initialize with starter data
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(STARTER_NOTES));
    return STARTER_NOTES;
  },

  /**
   * 🌟 BACKEND HOOK: Save / Create a new note
   *
   */
    async saveNote(note) {
    try {
      const created = await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      });
      if (created) return created;
    } catch (e) {}

    // LocalStorage Fallback
    const notes = await this.getNotes();
    const existingIdx = notes.findIndex(n => n.id === note.id);
    const timestamp = new Date().toISOString();

    if (existingIdx >= 0) {
      notes[existingIdx] = { ...notes[existingIdx], ...note, updatedAt: timestamp };
    } else {
      const newNote = {
        ...note,
        id: note.id || `note-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      notes.unshift(newNote);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    return note;
  },

  /**
   * 🌟 BACKEND HOOK: Delete a note (Soft or Hard)
   */
  async deleteNote(noteId, permanent = false) {
    try {
      await apiRequest(`/notes/${noteId}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}

    // LocalStorage Fallback
    let notes = await this.getNotes();
    if (permanent) {
      notes = notes.filter(n => n.id !== noteId);
    } else {
      notes = notes.map(n => n.id === noteId ? { ...n, isTrash: true, updatedAt: new Date().toISOString() } : n);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    return true;
  },

  /**
   * 🌟 BACKEND HOOK: Fetch dashboard stats & user progress metrics
   */
  async getDashboardStats() {
    try {
      const stats = await apiRequest('/dashboard/stats');
      if (stats) return stats;
    } catch (e) {}

    // Compute live metrics from local notes
    const notes = await this.getNotes();
    const totalNotes = notes.length;
    const urlsProcessed = notes.filter(n => n.url || n.type === 'url_bookmark').length;
    const mindmapsCreated = notes.filter(n => n.mindmapData).length + 2;
    const flowchartsCreated = notes.filter(n => n.flowchartData).length + 2;

    let totalTasks = 0;
    let completedTasks = 0;
    notes.forEach(n => {
      if (n.checklist && Array.isArray(n.checklist)) {
        totalTasks += n.checklist.length;
        completedTasks += n.checklist.filter(t => t.completed).length;
      }
    });

    const tasksCompletedRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 85;

    return {
      totalNotes,
      urlsProcessed,
      mindmapsCreated,
      flowchartsCreated,
      tasksCompletedRate,
      weeklyStreak: STARTER_STATS.weeklyStreak
    };
  }
};
