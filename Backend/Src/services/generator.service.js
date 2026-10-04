const youtubeService = require('./youtube.service');
const aiService = require('./ai.service');
const Note = require('../models/note.model');
const ApiError = require('../utils/ApiError');
const { addGenerationJob } = require('../queue/generator.queue');

class GeneratorService {
  
  cleanTranscript(transcript) {
    if (!transcript) return '';
    return transcript
      .replace(/\[\d+:\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  chunkTranscript(transcript, maxChunkSize = 8000) {
    if (!transcript) return [];
    const chunks = [];
    for (let i = 0; i < transcript.length; i += maxChunkSize) {
      chunks.push(transcript.substring(i, i + maxChunkSize));
    }
    return chunks;
  }

  async processChunks(chunks, title = '', options = {}) {
    if (chunks.length === 0) {
      throw new ApiError(400, 'Transcript is empty');
    }
    if (chunks.length === 1) {
      return chunks[0];
    }
    // If transcript is multi-chunk, join them cleanly with segment headers
    return chunks.map((chunk, idx) => `[Transcript Segment ${idx + 1}]\n${chunk}`).join('\n\n');
  }

  async createPendingNoteAndEnqueue(url, userId, options = {}) {
    const videoId = youtubeService.extractVideoId(url);
    if (!videoId) {
      throw new ApiError(400, 'Invalid YouTube URL provided. Please enter a valid YouTube link.');
    }

    const noteStyle = options.noteStyle || 'standard';

    // 1. Initial record creation (status: pending)
    const note = await Note.create({
      user: userId,
      title: 'Validating video & transcript...',
      youtubeUrl: url,
      videoId,
      status: 'pending',
      progressStep: 1,
      progressText: 'Validating YouTube URL & transcript',
      sourceType: 'youtube',
      noteStyle,
      generationOptions: options
    });

    // 2. Try enqueueing to Redis BullMQ; if Redis is unavailable, run async fallback
    try {
      await addGenerationJob(note._id, url, userId, options);
    } catch (redisErr) {
      console.warn('[GeneratorService] Redis queue unavailable, executing job directly:', redisErr.message);
      // Run in background without blocking response
      setImmediate(() => {
        this.executeGenerationJob(note._id, url, userId, options).catch(err => {
          console.error('[GeneratorService] Direct async job execution failed:', err);
        });
      });
    }

    return note;
  }

  // This method is called by the BullMQ worker or direct fallback
  async executeGenerationJob(noteId, url, userId, options = {}) {
    const videoId = youtubeService.extractVideoId(url);

    let note = await Note.findByIdAndUpdate(
      noteId,
      { status: 'processing', progressStep: 2, progressText: 'Extracting video transcript' },
      { new: true }
    );
    if (!note) throw new Error(`Note ${noteId} not found`);

    try {
      // 1. Fetch metadata & transcript
      const videoInfo = await youtubeService.getVideoInfo(videoId);
      
      await Note.findByIdAndUpdate(note._id, {
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        image: videoInfo.thumbnail,
        domain: videoInfo.domain,
        progressStep: 2,
        progressText: 'Retrieving transcript content'
      });

      const rawTranscript = await youtubeService.getTranscript(videoId);

      // 2. Clean & Chunk
      await Note.findByIdAndUpdate(note._id, {
        progressStep: 3,
        progressText: 'Cleaning and chunking transcript text'
      });

      const cleanedTranscript = this.cleanTranscript(rawTranscript);
      const chunks = this.chunkTranscript(cleanedTranscript);
      const combinedContext = await this.processChunks(chunks, videoInfo.title, options);

      // 3. AI Generation
      await Note.findByIdAndUpdate(note._id, {
        progressStep: 4,
        progressText: 'Generating structured notes via AI'
      });

      const aiMaterials = await aiService.generateStudyMaterials(combinedContext, videoInfo.title, options);

      // 4. Formatting output
      await Note.findByIdAndUpdate(note._id, {
        progressStep: 5,
        progressText: 'Formatting notebook pages and interactive diagrams'
      });

      const frontendContent = `## ${videoInfo.title}\n\n### Executive Summary\n${aiMaterials.summary}\n\n${aiMaterials.notes}`;

      const noteStyle = options.noteStyle || 'standard';

      // 5. Finalize Database Save
      note = await Note.findByIdAndUpdate(
        note._id,
        {
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          image: videoInfo.thumbnail,
          domain: videoInfo.domain,
          transcript: cleanedTranscript,
          summary: aiMaterials.summary,
          notes: aiMaterials.notes,
          content: frontendContent,
          flashcards: aiMaterials.flashcards,
          mindMap: aiMaterials.mindMap,
          mindmapData: aiMaterials.mindMap,
          flowchartData: aiMaterials.flowchart,
          checklist: aiMaterials.checklist,
          handwrittenData: aiMaterials.handwrittenData,
          noteStyle,
          status: 'completed',
          progressStep: 6,
          progressText: 'Completed',
          type: 'url_bookmark',
          category: 'work',
          color: noteStyle === 'handwritten' ? 'amber' : 'indigo',
          tags: ['YouTube', noteStyle === 'handwritten' ? 'Handwritten' : 'Standard']
        },
        { new: true }
      );

      return note;
    } catch (error) {
      console.error('[GeneratorService] Pipeline Error for Note', noteId, ':', error.message);
      
      const errorMessage = error.message || 'Failed to generate notes from transcript';
      
      await Note.findByIdAndUpdate(noteId, {
        status: 'failed',
        error: errorMessage,
        progressText: `Error: ${errorMessage}`
      });
      
      throw error;
    }
  }
}

module.exports = new GeneratorService();

