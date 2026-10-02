class YouTubeService {
  /**
   * Extract video ID from URL
   */
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Mock fetching video info (Title, thumbnail)
   */
  async getVideoInfo(videoId) {
    return {
      title: `Generated Video Title for ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      domain: 'youtube.com',
      sourceType: 'youtube'
    };
  }

  /**
   * Mock fetching transcript
   */
  async getTranscript(videoId) {
    // In reality, use youtube-transcript or similar package
    return `This is a mock transcript for video ${videoId}. It contains the spoken text of the video. It can be quite long. We need to clean it and chunk it.`;
  }
}

module.exports = new YouTubeService();
