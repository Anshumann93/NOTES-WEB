const { Worker } = require('bullmq');
const connection = require('../config/redis');
const generatorService = require('../services/generator.service');
const Note = require('../models/note.model');

const generatorWorker = new Worker(
  'generatorQueue',
  async (job) => {
    const { noteId, url, userId, options } = job.data;
    console.log(`[Worker] Starting job ${job.id} for Note ${noteId}`);
    
    // Process the generation pipeline
    await generatorService.executeGenerationJob(noteId, url, userId, options);
  },
  { connection }
);

generatorWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed successfully`);
});

generatorWorker.on('failed', async (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed:`, err);
  if (job.data && job.data.noteId) {
    try {
      await Note.findByIdAndUpdate(job.data.noteId, {
        status: 'failed',
        error: err.message || 'Worker processing failed'
      });
    } catch (dbErr) {
      console.error(`[Worker] Failed to update Note ${job.data.noteId} status to failed`, dbErr);
    }
  }
});

module.exports = generatorWorker;
