const { YoutubeTranscript } = require('youtube-transcript');
const ApiError = require('../utils/ApiError');

class YouTubeService {
  /**
   * Extract video ID from URL
   */
  extractVideoId(url) {
    if (!url || typeof url !== 'string') return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Fetch real video info (Title, thumbnail, author) via YouTube oEmbed
   */
  async getVideoInfo(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

    try {
      const response = await fetch(oembedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch oEmbed metadata (HTTP ${response.status})`);
      }
      const data = await response.json();
      return {
        title: data.title || `YouTube Video (${videoId})`,
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        author: data.author_name || 'YouTube Channel',
        domain: 'youtube.com',
        sourceType: 'youtube'
      };
    } catch (err) {
      console.warn(`[YouTubeService] oEmbed fallback for video ${videoId}:`, err.message);
      return {
        title: `YouTube Video (${videoId})`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        author: 'YouTube',
        domain: 'youtube.com',
        sourceType: 'youtube'
      };
    }
  }

  /**
   * Fetch real transcript using youtube-transcript
   */
  async getTranscript(videoId) {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en'
      });

      if (!transcriptItems || transcriptItems.length === 0) {
        // Retry without language constraint if english specific fetch yielded nothing
        const fallbackItems = await YoutubeTranscript.fetchTranscript(videoId);
        if (!fallbackItems || fallbackItems.length === 0) {
          throw new ApiError(404, 'No transcript or closed captions found for this YouTube video.');
        }
        return this.formatTranscriptItems(fallbackItems);
      }

      return this.formatTranscriptItems(transcriptItems);
    } catch (error) {
      console.error(`[YouTubeService] Transcript extraction failed for ${videoId}:`, error.message);

      if (error instanceof ApiError) {
        throw error;
      }

      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('disabled') || msg.includes('captions disabled')) {
        throw new ApiError(400, 'Captions/Transcripts are disabled by the creator for this video.');
      }
      if (msg.includes('unavailable') || msg.includes('could not find transcript')) {
        throw new ApiError(404, 'No transcript available for this video. Please select a video with captions enabled.');
      }
      if (msg.includes('private') || msg.includes('404')) {
        throw new ApiError(404, 'Video is private, deleted, or invalid YouTube URL.');
      }

      throw new ApiError(400, `Transcript extraction failed: ${error.message || 'Captions not available'}`);
    }
  }

  formatTranscriptItems(items) {
    return items
      .map(item => item.text)
      .join(' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\[Music\]/gi, '')
      .replace(/\[Applause\]/gi, '')
      .replace(/\[Laughter\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new YouTubeService();

