import { apiRequest } from './api';

export const AiGeneratorService = {
  /**
   * Triggers the generation process and returns the pending note ID
   */
  async generateFromUrl(url, options = {}) {
    console.log('[StudyShell Generator] Processing URL via Backend:', url);
    const result = await apiRequest('/notes/generate', {
      method: 'POST',
      body: JSON.stringify({ url, options })
    });
    return result; // Should contain { _id, status }
  },

  /**
   * Polls the backend for processing status
   */
  async pollGenerationStatus(noteId, interval = 2000, maxAttempts = 90, onProgress = null) {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        attempts++;
        try {
          const statusResult = await apiRequest(`/notes/${noteId}/status`);
          const status = statusResult?.status;

          if (onProgress && typeof onProgress === 'function') {
            onProgress(statusResult);
          }
          
          if (status === 'completed') {
            clearInterval(timer);
            const completeNote = await apiRequest(`/notes/${noteId}`);
            resolve(completeNote);
          } else if (status === 'failed') {
            clearInterval(timer);
            reject(new Error(statusResult?.error || 'Generation failed'));
          } else if (attempts >= maxAttempts) {
            clearInterval(timer);
            reject(new Error('Generation process timed out. Please try again.'));
          }
        } catch (err) {
          clearInterval(timer);
          reject(err);
        }
      }, interval);
    });
  }
};
