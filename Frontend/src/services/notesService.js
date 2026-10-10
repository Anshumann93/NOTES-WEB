import { apiRequest } from './api';

export const NotesService = {
  async getNotes() {
    const data = await apiRequest('/notes');
    if (data.notes) {
      data.notes = data.notes.map(n => ({ ...n, id: n._id || n.id }));
    }
    return data;
  },

  async saveNote(note) {
    const noteId = note.id || note._id;
    if (noteId) {
      // Update existing note via PUT
      const updated = await apiRequest(`/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(note)
      });
      return { ...updated, id: updated._id || updated.id };
    }
    // Create new note via POST
    const created = await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(note)
    });
    return { ...created, id: created._id || created.id };
  },

  async deleteNote(noteId, permanent = false) {
    await apiRequest(`/notes/${noteId}?permanent=${permanent}`, { method: 'DELETE' });
    return true;
  },

  async getDashboardStats() {
    const stats = await apiRequest('/dashboard/stats');
    // Ensure history uses id instead of _id
    if (stats.recentNotes) {
      stats.recentNotes = stats.recentNotes.map(n => ({ ...n, id: n._id || n.id }));
    }
    return stats;
  },

  async getNoteStatus(noteId) {
    const result = await apiRequest(`/notes/${noteId}/status`);
    return result;
  }
};
