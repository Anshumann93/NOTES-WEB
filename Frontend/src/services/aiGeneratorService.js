import { apiRequest } from './api';

export const AiGeneratorService = {
  /**
   * Generates and returns the completed note.
   */
  async generateFromUrl(url, options = {}) {
    console.log('[StudyShell Generator] Processing URL via Backend:', url);
    const result = await apiRequest('/notes/generate', {
      method: 'POST',
      body: JSON.stringify({ url, options }),
      timeoutMs: 300000,
      timeoutMessage: 'Generation timed out. It may still finish; check your notes before trying again.'
    });
    return result;
  }
};
