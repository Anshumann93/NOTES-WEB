const ApiError = require('../utils/ApiError');
const { GoogleGenAI } = require('@google/genai');

/**
 * Real AI Provider Integration (Gemini, OpenAI, Groq)
 */
class AIService {
  getProvider() {
    if (process.env.GEMINI_API_KEY) return 'gemini';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.GROQ_API_KEY) return 'groq';
    if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== 'mock') {
      return process.env.AI_PROVIDER;
    }
    return null;
  }

  validateConfiguration() {
    const provider = this.getProvider();
    if (!provider) {
      throw new ApiError(
        500,
        'AI Provider is not configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in Backend/.env file.'
      );
    }
    return provider;
  }

  async callLLM(prompt, systemInstruction = '') {
    const provider = this.validateConfiguration();

    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      try {
        const ai = new GoogleGenAI({ apiKey });
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
        
        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        if (!response.text) {
          throw new Error('Received empty response from Gemini API');
        }

        return response.text;
      } catch (err) {
        console.error('[AIService] Gemini API error:', err.message);
        throw new ApiError(500, `Gemini AI Generation Error: ${err.message}`);
      }
    } else if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemInstruction || "You are an expert educational notes generator. Output valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(500, `OpenAI API Error: ${data.error?.message || 'Request failed'}`);
      return data.choices[0].message.content;
    } else if (provider === 'groq') {
      const apiKey = process.env.GROQ_API_KEY;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemInstruction || "You are an expert educational notes generator. Output valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(500, `Groq API Error: ${data.error?.message || 'Request failed'}`);
      return data.choices[0].message.content;
    } else {
      throw new ApiError(500, `Unsupported AI provider configuration: ${provider}`);
    }
  }

  /**
   * Generates complete structured study material from transcript
   */
  async generateStudyMaterials(transcriptText, videoTitle = '', options = {}) {
    const { noteStyle = 'standard', depth = 'detailed', includeDiagrams = true } = options;

    const systemPrompt = `You are a top-tier academic assistant and visual note-taker. 
Your task is to convert a YouTube video transcript into highly structured, comprehensive, non-fabricated study materials.
Do not invent any facts, formulas, or concepts not present or clearly implied by the transcript.
Preserve exact technical terminology, definitions, formulas, code snippets, step-by-step explanations, and key examples.

Return a SINGLE VALID JSON OBJECT with this exact structure:
{
  "summary": "3-5 sentence executive summary highlighting key concepts.",
  "notes": "Detailed Markdown formatted notes with headings (##), subheadings (###), bullet points, bold key terms, definitions, and code/formula snippets if present.",
  "flashcards": [
    { "front": "Concept / Question", "back": "Clear, concise answer" }
  ],
  "mindMap": {
    "nodes": [ { "id": "1", "label": "Central Concept" }, { "id": "2", "label": "Subtopic A" } ],
    "edges": [ { "source": "1", "target": "2", "label": "includes" } ]
  },
  "flowchart": {
    "nodes": [ { "id": "step1", "label": "1. Initial Step" }, { "id": "step2", "label": "2. Next Action" } ],
    "edges": [ { "source": "step1", "target": "step2" } ]
  },
  "checklist": [
    { "id": "task-1", "text": "Action item / key concept to master", "completed": false }
  ],
  "handwrittenData": {
    "notebookTitle": "Title of the Notebook",
    "pages": [
      {
        "pageNumber": 1,
        "header": "Page Main Subject / Module Title",
        "sections": [
          {
            "type": "heading",
            "title": "Section Title"
          },
          {
            "type": "paragraph",
            "content": "Explanatory text paragraph"
          },
          {
            "type": "bullets",
            "title": "Key Points",
            "items": ["Point 1", "Point 2", "Point 3"]
          },
          {
            "type": "definition",
            "term": "Key Term",
            "definition": "Precise definition",
            "highlight": "yellow"
          },
          {
            "type": "formula",
            "title": "Formula / Rule",
            "content": "e.g. E = mc² or algorithm logic",
            "highlight": "pink"
          },
          {
            "type": "example",
            "title": "Example Case",
            "content": "Concrete real-world example from transcript",
            "highlight": "green"
          },
          {
            "type": "diagram",
            "title": "Conceptual Flow Diagram",
            "diagramType": "process",
            "items": ["Input Data", "Processing Step", "Output Result"]
          }
        ]
      }
    ]
  }
}`;

    const userPrompt = `Video Title: "${videoTitle}"
Requested Note Style: ${noteStyle}
Note Depth: ${depth}
Include Diagrams: ${includeDiagrams}

Transcript Content:
"""
${transcriptText}
"""

Generate complete, accurate, structured study material matching the exact JSON schema. Ensure handwrittenData has 2 to 6 pages of content broken into logical pages.`;

    const responseText = await this.callLLM(userPrompt, systemPrompt);

    try {
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Simple validation of required fields
      return {
        summary: parsed.summary || 'Summary generated from transcript.',
        notes: parsed.notes || '## Notes\n\nNo detailed notes produced.',
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
        mindMap: parsed.mindMap || { nodes: [], edges: [] },
        flowchart: parsed.flowchart || { nodes: [], edges: [] },
        checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
        handwrittenData: parsed.handwrittenData || {
          notebookTitle: videoTitle || 'Study Notebook',
          pages: [
            {
              pageNumber: 1,
              header: videoTitle || 'Study Notes',
              sections: [
                { type: 'heading', title: 'Overview' },
                { type: 'paragraph', content: parsed.summary || 'Summary unavailable' }
              ]
            }
          ]
        }
      };
    } catch (err) {
      console.error('[AIService] JSON parse error:', err.message, 'Raw response:', responseText?.slice(0, 300));
      throw new ApiError(500, 'AI returned an unparseable response structure. Please retry.');
    }
  }

  // Legacy helper methods for backwards compatibility
  async generateSummary(text) {
    const res = await this.generateStudyMaterials(text);
    return res.summary;
  }
  async generateNotes(text) {
    const res = await this.generateStudyMaterials(text);
    return res.notes;
  }
  async generateFlashcards(text) {
    const res = await this.generateStudyMaterials(text);
    return res.flashcards;
  }
  async generateMindMap(text) {
    const res = await this.generateStudyMaterials(text);
    return res.mindMap;
  }
  async generateChecklist(text) {
    const res = await this.generateStudyMaterials(text);
    return res.checklist;
  }
}

module.exports = new AIService();

