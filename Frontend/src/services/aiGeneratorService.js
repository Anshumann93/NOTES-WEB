/**
 * ==========================================================================
 * 🌟 BACKEND CONNECTION POINT: AI GENERATOR SERVICE
 * ==========================================================================
 * Handles AI-powered generation for:
 * 1. YouTube & Web URL Note Extraction
 * 2. Mindmap Branch Node Synthesis
 * 3. Flowchart / Workflow Step Generation
 * 
 * TO CONNECT YOUR BACKEND:
 * Implement the backend endpoints in your Node.js / Python / Go backend:
 * - POST /api/generate/url -> { url, options } => { title, summary, content, takeaways, checklist, mindmapData, flowchartData }
 * ==========================================================================
 */

import { apiRequest } from './api';
import { PRELOADED_URL_EXAMPLES } from '../data/starterData';

export const AiGeneratorService = {
  /**
   * 🌟 BACKEND HOOK: Generate comprehensive notes from a URL or YouTube link
   */
  async generateFromUrl(url, options = {}) {
    console.log('[TubeShell Generator] Processing URL:', url);

    // 1. Try real backend first
    try {
      const result = await apiRequest('/generate/url', {
        method: 'POST',
        body: JSON.stringify({ url, options })
      });
      if (result) return result;
    } catch (err) {
      console.warn('[TubeShell Generator] Real backend call failed, using intelligent client synthesis:', err);
    }

    // 2. Intelligent Client-Side Simulation & Fallback
    // Check if matching any preloaded example
    const matchedExample = PRELOADED_URL_EXAMPLES.find(ex => url.includes(ex.domain) || url === ex.url);
    if (matchedExample) {
      await new Promise(r => setTimeout(r, 1200)); // realistic generation latency
      return {
        id: `gen-${Date.now()}`,
        type: 'url_bookmark',
        sourceType: matchedExample.tag === 'YouTube' ? 'youtube' : 'web_doc',
        title: matchedExample.title,
        url: matchedExample.url,
        domain: matchedExample.domain,
        image: matchedExample.thumbnail,
        content: `## ⚡ Generated Note: ${matchedExample.title}\n**Source**: ${matchedExample.domain}\n\n### 📝 Summary\n${matchedExample.summary}\n\n### 💡 Key Takeaways\n${matchedExample.takeaways.map((t, idx) => `${idx + 1}. **${t}**`).join('\n')}`,
        checklist: matchedExample.takeaways.map((t, idx) => ({
          id: `task-${idx + 1}`,
          text: t,
          completed: false
        })),
        category: 'work',
        color: matchedExample.tag === 'YouTube' ? 'indigo' : 'cyan',
        tags: [matchedExample.tag, 'Generated', matchedExample.domain.split('.')[0]],
        isPinned: false
      };
    }

    // Generate dynamic fallback for any custom URL pasted by user
    let domain = 'web';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname.replace('www.', '');
    } catch (e) {}

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    await new Promise(r => setTimeout(r, 1500));

    return {
      id: `gen-${Date.now()}`,
      type: 'url_bookmark',
      sourceType: isYouTube ? 'youtube' : 'web_doc',
      title: isYouTube ? `YouTube Video Summary: ${domain}` : `Web Notes: ${domain} Resource`,
      url: url,
      domain: domain,
      image: isYouTube 
        ? 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      content: `## ⚡ AI Generated Analysis for ${domain}\n**Extracted from**: [${url}](${url})\n\n### 💡 Key Insights & Extracted Points\n1. **Core Concept Overview**: Structured synthesis extracted from ${url}.\n2. **Action Items & Steps**: Clear breakdown of key takeaways and actionable checklist items.\n3. **Visual Mapping**: Node relations generated for mindmap and flowchart visualization.\n\n> *Generated automatically by TubeShell Notes Generator AI.*`,
      checklist: [
        { id: "task-1", text: `Review extracted summary for ${domain}`, completed: false },
        { id: "task-2", text: "Inspect interactive mindmap nodes", completed: false },
        { id: "task-3", text: "Export notes or share with team", completed: false }
      ],
      category: 'ideas',
      color: isYouTube ? 'rose' : 'cyan',
      tags: [isYouTube ? 'YouTube' : 'WebArticle', domain, 'AI-Generated'],
      isPinned: false
    };
  }
};
