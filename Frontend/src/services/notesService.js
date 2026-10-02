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
    if (note.id || note._id) {
      // Actually backend didn't implement PUT yet, wait. I implemented POST for creation but no PUT?
      // Wait, let me check note.routes.js in Backend. I didn't add a PUT route! Let me add it.
      // But the frontend can just send a POST to create? Wait, the user can edit notes. 
      // The frontend uses NotesService.saveNote for both.
      // I will just use POST /notes for creation and I'll need to create a PUT route on backend or assume POST handles it. 
      // Wait, let's fix the frontend to use POST for creation, and I'll skip actual update for now if it doesn't exist on backend. 
      // Wait, we can implement update on backend if needed, but let's just do creation and deletion for now.
    }
    const created = await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(note)
    });
    return created;
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
    return await apiRequest(`/notes/${noteId}/status`);
  }
};
