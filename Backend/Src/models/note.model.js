const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  id: String,
  text: String,
  completed: { type: Boolean, default: false }
}, { _id: false });

const flashcardSchema = new mongoose.Schema({
  front: String,
  back: String
}, { _id: false });

const noteSchema = new mongoose.Schema(
  {
    // Ownership (A user can only access their own notes)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Source Information
    youtubeUrl: { type: String, trim: true },
    videoId: { type: String, index: true },
    url: { type: String, trim: true }, // For general web URLs
    domain: { type: String, trim: true },
    sourceType: {
      type: String,
      enum: ['youtube', 'web_doc', 'custom'],
      default: 'custom'
    },

    // Note Metadata
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true
    },
    thumbnail: { type: String }, // Alias image
    image: { type: String }, // Frontend fallback
    type: {
      type: String,
      enum: ['url_bookmark', 'checklist', 'note'],
      default: 'note'
    },
    category: { type: String, default: 'work', index: true },
    color: { type: String, default: 'indigo' },
    tags: [{ type: String, index: true }],

    // Extracted / Generated Content
    transcript: { type: String }, // Raw transcript text
    summary: { type: String }, // Generated summary
    notes: { type: String }, // Specific generated notes
    content: { type: String }, // Primary markdown content (used heavily by frontend UI)
    
    // Interactive & Visual Elements
    flashcards: [flashcardSchema],
    checklist: [checklistItemSchema],
    mindMap: { type: mongoose.Schema.Types.Mixed }, // Standard requested mindmap format
    mindmapData: { type: mongoose.Schema.Types.Mixed }, // Frontend expected mindmap schema
    flowchartData: { type: mongoose.Schema.Types.Mixed }, // Frontend expected flowchart schema

    // Processing & State
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
      index: true
    },
    error: { type: String }, // Populated if status is 'failed'
    
    // UI states
    isPinned: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Compound Indexes for optimal querying by user
// e.g. "Get all non-trashed notes for a user sorted by creation date"
noteSchema.index({ user: 1, isTrash: 1, createdAt: -1 });

// e.g. "Get pending/processing notes for a user"
noteSchema.index({ user: 1, status: 1 });

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
