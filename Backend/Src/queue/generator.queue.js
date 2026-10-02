const { Queue } = require('bullmq');
const connection = require('../config/redis');

const generatorQueue = new Queue('generatorQueue', { connection });

/**
 * Enqueues a note generation job
 */
const addGenerationJob = async (noteId, url, userId) => {
  return await generatorQueue.add(
    'generate-study-material',
    { noteId, url, userId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000 // 5s, 25s, 125s
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  );
};

module.exports = { generatorQueue, addGenerationJob };
