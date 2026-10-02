const youtubeService = require('./youtube.service');
const aiService = require('./ai.service');
const Note = require('../models/note.model');
const ApiError = require('../utils/ApiError');
const { addGenerationJob } = require('../queue/generator.queue');

class GeneratorService {
  
  cleanTranscript(transcript) {
    // Remove timestamps, filler words, etc.
    return transcript.replace(/\[\d+:\d+\]/g, '').trim();
  }

  chunkTranscript(transcript, maxChunkSize = 4000) {
    // Simple chunking for demonstration
    const chunks = [];
    for (let i = 0; i < transcript.length; i += maxChunkSize) {
      chunks.push(transcript.substring(i, i + maxChunkSize));
    }
    return chunks;
  }

  async processChunks(chunks) {
    // Process chunks to extract combined knowledge
    // For now, simply join them
    return chunks.join('\n\n');
  }

  async createPendingNoteAndEnqueue(url, userId) {
    const videoId = youtubeService.extractVideoId(url);
    if (!videoId) {
      throw new ApiError(400, 'Invalid YouTube URL');
    }

    // 1. Initial record creation (status: pending)
    const note = await Note.create({
      user: userId,
      title: 'Pending Generation...',
      youtubeUrl: url,
      videoId,
      status: 'pending',
      sourceType: 'youtube'
    });

    // 2. Add to Redis queue
    await addGenerationJob(note._id, url, userId);

    return note;
  }

  // This method is called by the BullMQ worker
  async executeGenerationJob(noteId, url, userId) {
    const videoId = youtubeService.extractVideoId(url);

    // Update status to processing
    let note = await Note.findByIdAndUpdate(noteId, { status: 'processing' }, { new: true });
    if (!note) throw new Error(`Note ${noteId} not found`);

    try {
      // 2. Extract Info & Transcript
      const videoInfo = await youtubeService.getVideoInfo(videoId);
      const rawTranscript = await youtubeService.getTranscript(videoId);

      // 3. Clean & Chunk
      const cleanedTranscript = this.cleanTranscript(rawTranscript);
      const chunks = this.chunkTranscript(cleanedTranscript);

      // 4. Process Chunks (Combine)
      const combinedContext = await this.processChunks(chunks);

      // 5. Generate Material (Can run in parallel for performance)
      const [summary, notes, flashcards, mindMap, checklist] = await Promise.all([
        aiService.generateSummary(combinedContext),
        aiService.generateNotes(combinedContext),
        aiService.generateFlashcards(combinedContext),
        aiService.generateMindMap(combinedContext),
        aiService.generateChecklist(combinedContext)
      ]);

      // Map frontend fields (content, mindmapData)
      const frontendContent = `## ${videoInfo.title}\n\n### Summary\n${summary}\n\n${notes}`;

      // 6. Save back to database
      note = await Note.findByIdAndUpdate(
        note._id,
        {
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          image: videoInfo.thumbnail,
          domain: videoInfo.domain,
          transcript: cleanedTranscript,
          summary,
          notes,
          content: frontendContent,
          flashcards,
          mindMap,
          mindmapData: mindMap, // specific to frontend mapping
          checklist,
          status: 'completed',
          type: 'url_bookmark', // For frontend compatibility
          category: 'ideas',
          color: 'rose',
          tags: ['YouTube', 'Generated']
        },
        { new: true }
      );

      return note;
    } catch (error) {
      console.error('Generation Pipeline Error:', error);
      
      // Update status to failed
      await Note.findByIdAndUpdate(note._id, {
        status: 'failed',
        error: error.message || 'Unknown error occurred during generation'
      });
      
      throw new ApiError(500, 'Failed to generate study material');
    }
  }
}

module.exports = new GeneratorService();
