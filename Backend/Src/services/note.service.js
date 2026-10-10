const Note = require('../models/note.model');
const ApiError = require('../utils/ApiError');

class NoteService {
  async getAllNotes(userId, { page = 1, limit = 50, category, isTrash, sort = '-createdAt' }) {
    const query = { user: userId };
    
    if (category) query.category = category;
    
    // By default, do not return trashed notes unless specifically requested
    if (isTrash !== undefined) {
      query.isTrash = isTrash === 'true';
    } else {
      query.isTrash = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notes = await Note.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Note.countDocuments(query);

    return {
      notes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async createNote(noteData, userId) {
    // Prevent overriding sensitive fields on creation
    delete noteData.user;
    delete noteData.status; 
    
    const note = await Note.create({ ...noteData, user: userId });
    return note;
  }

  async updateNote(noteId, noteData, userId) {
    // Prevent ownership tampering
    if (noteData.user) {
      delete noteData.user;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $set: noteData },
      { new: true }
    );
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }
    return note;
  }

  async getNoteById(noteId, userId) {
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }
    return note;
  }

  async deleteNote(noteId, userId, permanent = false) {
    const note = await Note.findOne({ _id: noteId, user: userId });
    
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }

    if (permanent) {
      await Note.findByIdAndDelete(noteId);
    } else {
      note.isTrash = true;
      await note.save();
    }

    return true;
  }

  async getNoteStatus(noteId, userId) {
    const note = await Note.findOne({ _id: noteId, user: userId }).select('status error title _id progressStep progressText');
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }
    return {
      id: note._id,
      status: note.status,
      error: note.error,
      title: note.title,
      progressStep: note.progressStep || 0,
      progressText: note.progressText || ''
    };
  }
}

module.exports = new NoteService();
