const youtubeService = require('./youtube.service.js');
const aiService = require('./ai.service.js');
const Note = require('../models/note.model.js');
const ApiError = require('../utils/ApiError');

class GeneratorService {
  /**
   * Strip timestamp patterns and normalize whitespace
   */
  cleanTranscript(transcript) {
    if (!transcript) return '';
    return transcript
      .replace(/\[\d+:\d+(?::\d+)?\]/g, '') // Handles [00:12] and [01:02:15]
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Safe chunking at word boundaries rather than arbitrary character cuts
   */
  chunkTranscript(transcript, maxChunkChars = 8000) {
    if (!transcript) return [];
    if (transcript.length <= maxChunkChars) return [transcript];

    const chunks = [];
    let currentChunk = '';
    const words = transcript.split(' ');

    for (const word of words) {
      if ((currentChunk + ' ' + word).length > maxChunkChars) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + word;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Combines chunks safely while managing length
   */
  async processChunks(chunks) {
    if (!chunks || chunks.length === 0) {
      throw new ApiError(400, 'Transcript is empty');
    }

    if (chunks.length === 1) {
      return chunks[0];
    }

    // For multi-chunk transcripts, format segments clearly
    return chunks
      .map((chunk, idx) => `--- Segment ${idx + 1} ---\n${chunk}`)
      .join('\n\n');
  }

  /**
   * Creates initial record and fires background execution
   */
  async generateFromUrl(url, userId, options = {}) {
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

    // Option A: Execute directly and wait (for short requests / serverless)
    return this.executeGenerationJob(note._id, url, userId, options);

    // Option B: For heavy workloads, trigger in background and return pending note immediately:
    // this.executeGenerationJob(note._id, url, userId, options).catch(err => {
    //   console.error(`Background job failed for note ${note._id}:`, err);
    // });
    // return note;
  }

  /**
   * Pipeline execution step
   */
  async executeGenerationJob(noteId, url, userId, options = {}) {
    const videoId = youtubeService.extractVideoId(url);

    let note = await Note.findByIdAndUpdate(
      noteId,
      { status: 'processing', progressStep: 2, progressText: 'Extracting video transcript' },
      { returnDocument: 'after' }
    );
    if (!note) throw new ApiError(404, `Note ${noteId} not found`);

    try {
      // Step 1: Fetch metadata & transcript concurrently to save time
      const [videoInfo, rawTranscript] = await Promise.all([
        youtubeService.getVideoInfo(videoId),
        youtubeService.getTranscript(videoId)
      ]);

      // Step 2: Clean & Chunk Transcript
      const cleanedTranscript = this.cleanTranscript(rawTranscript);
      const chunks = this.chunkTranscript(cleanedTranscript);
      const combinedContext = await this.processChunks(chunks);

      // Step 3: AI Generation
      await Note.findByIdAndUpdate(note._id, {
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        domain: videoInfo.domain,
        progressStep: 4,
        progressText: 'Generating structured notes via AI'
      });

      const aiMaterials = await aiService.generateStudyMaterials(combinedContext, videoInfo.title, options);

      // Step 4: Formatting and Final Database Save
      const frontendContent = `## ${videoInfo.title}\n\n### Executive Summary\n${aiMaterials.summary}\n\n${aiMaterials.notes}`;
      const noteStyle = options.noteStyle || 'standard';

      note = await Note.findByIdAndUpdate(
        note._id,
        {
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          domain: videoInfo.domain,
          transcript: cleanedTranscript,
          summary: aiMaterials.summary,
          notes: aiMaterials.notes,
          content: frontendContent,
          flashcards: aiMaterials.flashcards,
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
        { returnDocument: 'after' }
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



























// const youtubeService = require('./youtube.service');
// const aiService = require('./ai.service');
// const Note = require('../models/note.model');
// const ApiError = require('../utils/ApiError');

// class GeneratorService {
  
//   cleanTranscript(transcript) {
//     if (!transcript) return '';
//     return transcript
//       .replace(/\[\d+:\d+\]/g, '')
//       .replace(/\s+/g, ' ')
//       .trim();
//   }

//   chunkTranscript(transcript, maxChunkSize = 8000) {
//     if (!transcript) return [];
//     const chunks = [];
//     for (let i = 0; i < transcript.length; i += maxChunkSize) {
//       chunks.push(transcript.substring(i, i + maxChunkSize));
//     }
//     return chunks;
//   }

//   async processChunks(chunks, title = '', options = {}) {
//     if (chunks.length === 0) {
//       throw new ApiError(400, 'Transcript is empty');
//     }
//     if (chunks.length === 1) {
//       return chunks[0];
//     }
//     // If transcript is multi-chunk, join them cleanly with segment headers
//     return chunks.map((chunk, idx) => `[Transcript Segment ${idx + 1}]\n${chunk}`).join('\n\n');
//   }

//   async generateFromUrl(url, userId, options = {}) {
//     const videoId = youtubeService.extractVideoId(url);
//     if (!videoId) {
//       throw new ApiError(400, 'Invalid YouTube URL provided. Please enter a valid YouTube link.');
//     }

//     const noteStyle = options.noteStyle || 'standard';

//     // 1. Initial record creation (status: pending)
//     const note = await Note.create({
//       user: userId,
//       title: 'Validating video & transcript...',
//       youtubeUrl: url,
//       videoId,
//       status: 'pending',
//       progressStep: 1,
//       progressText: 'Validating YouTube URL & transcript',
//       sourceType: 'youtube',
//       noteStyle,
//       generationOptions: options
//     });

//     return this.executeGenerationJob(note._id, url, userId, options);
//   }

//   async executeGenerationJob(noteId, url, userId, options = {}) {
//     const videoId = youtubeService.extractVideoId(url);

//     let note = await Note.findByIdAndUpdate(
//       noteId,
//       { status: 'processing', progressStep: 2, progressText: 'Extracting video transcript' },
//       { returnDocument: 'after' }
//     );
//     if (!note) throw new Error(`Note ${noteId} not found`);

//     try {
//       // 1. Fetch metadata & transcript
//       const videoInfo = await youtubeService.getVideoInfo(videoId);
      
//       await Note.findByIdAndUpdate(note._id, {
//         title: videoInfo.title,
//         thumbnail: videoInfo.thumbnail,
//         image: videoInfo.thumbnail,
//         domain: videoInfo.domain,
//         progressStep: 2,
//         progressText: 'Retrieving transcript content'
//       });

//       const rawTranscript = await youtubeService.getTranscript(videoId);

//       // 2. Clean & Chunk
//       await Note.findByIdAndUpdate(note._id, {
//         progressStep: 3,
//         progressText: 'Cleaning and chunking transcript text'
//       });

//       const cleanedTranscript = this.cleanTranscript(rawTranscript);
//       const chunks = this.chunkTranscript(cleanedTranscript);
//       const combinedContext = await this.processChunks(chunks, videoInfo.title, options);

//       // 3. AI Generation
//       await Note.findByIdAndUpdate(note._id, {
//         progressStep: 4,
//         progressText: 'Generating structured notes via AI'
//       });

//       const aiMaterials = await aiService.generateStudyMaterials(combinedContext, videoInfo.title, options);

//       // 4. Formatting output
//       await Note.findByIdAndUpdate(note._id, {
//         progressStep: 5,
//         progressText: 'Formatting notebook pages and interactive diagrams'
//       });

//       const frontendContent = `## ${videoInfo.title}\n\n### Executive Summary\n${aiMaterials.summary}\n\n${aiMaterials.notes}`;

//       const noteStyle = options.noteStyle || 'standard';

//       // 5. Finalize Database Save
//       note = await Note.findByIdAndUpdate(
//         note._id,
//         {
//           title: videoInfo.title,
//           thumbnail: videoInfo.thumbnail,
//           image: videoInfo.thumbnail,
//           domain: videoInfo.domain,
//           transcript: cleanedTranscript,
//           summary: aiMaterials.summary,
//           notes: aiMaterials.notes,
//           content: frontendContent,
//           flashcards: aiMaterials.flashcards,
//           mindMap: aiMaterials.mindMap,
//           mindmapData: aiMaterials.mindMap,
//           flowchartData: aiMaterials.flowchart,
//           checklist: aiMaterials.checklist,
//           handwrittenData: aiMaterials.handwrittenData,
//           noteStyle,
//           status: 'completed',
//           progressStep: 6,
//           progressText: 'Completed',
//           type: 'url_bookmark',
//           category: 'work',
//           color: noteStyle === 'handwritten' ? 'amber' : 'indigo',
//           tags: ['YouTube', noteStyle === 'handwritten' ? 'Handwritten' : 'Standard']
//         },
//         { returnDocument: 'after' }
//       );

//       return note;
//     } catch (error) {
//       console.error('[GeneratorService] Pipeline Error for Note', noteId, ':', error.message);
      
//       const errorMessage = error.message || 'Failed to generate notes from transcript';
      
//       await Note.findByIdAndUpdate(noteId, {
//         status: 'failed',
//         error: errorMessage,
//         progressText: `Error: ${errorMessage}`
//       });
      
//       throw error;
//     }
//   }
// }

// module.exports = new GeneratorService();

