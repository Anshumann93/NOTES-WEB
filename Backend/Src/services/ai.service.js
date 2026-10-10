// const ApiError = require('../utils/ApiError');
// const { GoogleGenAI } = require('@google/genai');

// /**
//  * Real AI Provider Integration (Gemini, OpenAI, Groq)
//  */
// class AIService {
//   getProvider() {
//     if (process.env.AI_PROVIDER) return process.env.AI_PROVIDER.toLowerCase();
//     if (process.env.GEMINI_API_KEY) return 'gemini';
//     if (process.env.OPENAI_API_KEY) return 'openai';
//     if (process.env.GROQ_API_KEY) return 'groq';
//     return null;
//   }

//   validateConfiguration() {
//     const provider = this.getProvider();
//     const apiKeys = {
//       gemini: process.env.GEMINI_API_KEY,
//       openai: process.env.OPENAI_API_KEY,
//       groq: process.env.GROQ_API_KEY
//     };

//     if (!provider) {
//       throw new ApiError(
//         500,
//         'AI Provider is not configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in Backend/.env file.'
//       );
//     }
//     if (!Object.hasOwn(apiKeys, provider)) {
//       throw new ApiError(500, 'AI_PROVIDER must be gemini, openai, or groq.');
//     }
//     if (!apiKeys[provider]) {
//       throw new ApiError(500, `Set ${provider.toUpperCase()}_API_KEY for the selected AI provider.`);
//     }

//     return provider;
//   }

//   async callLLM(prompt, systemInstruction = '') {
//     const provider = this.validateConfiguration();

//     if (provider === 'gemini') {
//       const apiKey = process.env.GEMINI_API_KEY;
//       try {
//         const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 120000 } });
//         const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
//         const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

//         const response = await ai.models.generateContent({
//           model: modelName,
//           contents: fullPrompt,
//           config: {
//             responseMimeType: 'application/json',
//             temperature: 0.2
//           }
//         });

//         if (!response.text) {
//           throw new Error('Received empty response from Gemini API');
//         }

//         return response.text;
//       } catch (err) {
//         console.error('[AIService] Gemini API error:', err.message);
//         if (err.name === 'TimeoutError') {
//           throw new ApiError(504, 'Gemini request timed out. Please try again.');
//         }
//         throw new ApiError(500, `Gemini AI Generation Error: ${err.message}`);
//       }
//     } else if (provider === 'openai') {
//       const apiKey = process.env.OPENAI_API_KEY;
//       const res = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${apiKey}`
//         },
//         signal: AbortSignal.timeout(120000),
//         body: JSON.stringify({
//           model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
//           response_format: { type: "json_object" },
//           messages: [
//             { role: "system", content: systemInstruction || "You are an expert educational notes generator. Output valid JSON." },
//             { role: "user", content: prompt }
//           ],
//           temperature: 0.2
//         })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new ApiError(500, `OpenAI API Error: ${data.error?.message || 'Request failed'}`);
//       return data.choices[0].message.content;
//     } else if (provider === 'groq') {
//       const apiKey = process.env.GROQ_API_KEY;
//       const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${apiKey}`
//         },
//         signal: AbortSignal.timeout(120000),
//         body: JSON.stringify({
//           model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//           response_format: { type: "json_object" },
//           messages: [
//             { role: "system", content: systemInstruction || "You are an expert educational notes generator. Output valid JSON." },
//             { role: "user", content: prompt }
//           ],
//           temperature: 0.2
//         })
//       });
//       const data = await res.json();
//       if (!res.ok) throw new ApiError(500, `Groq API Error: ${data.error?.message || 'Request failed'}`);
//       return data.choices[0].message.content;
//     } else {
//       throw new ApiError(500, `Unsupported AI provider configuration: ${provider}`);
//     }
//   }

//   /**
//    * Generates complete structured study material from transcript
//    */
//   async generateStudyMaterials(transcriptText, videoTitle = '', options = {}) {
//     const { noteStyle = 'standard', depth = 'detailed', includeDiagrams = true } = options;

//     const systemPrompt = `You are a top-tier academic assistant and visual note-taker. 
// Your task is to convert a YouTube video transcript into highly structured, comprehensive, non-fabricated study materials.
// Do not invent any facts, formulas, or concepts not present or clearly implied by the transcript.
// Preserve exact technical terminology, definitions, formulas, code snippets, step-by-step explanations, and key examples.

// Return a SINGLE VALID JSON OBJECT with this exact structure:
// {
//   "summary": "3-5 sentence executive summary highlighting key concepts.",
//   "notes": "Detailed Markdown formatted notes with headings (##), subheadings (###), bullet points, bold key terms, definitions, and code/formula snippets if present.",
//   "flashcards": [
//     { "front": "Concept / Question", "back": "Clear, concise answer" }
//   ],
//   "mindMap": {
//     "nodes": [ { "id": "1", "label": "Central Concept" }, { "id": "2", "label": "Subtopic A" } ],
//     "edges": [ { "source": "1", "target": "2", "label": "includes" } ]
//   },
//   "flowchart": {
//     "nodes": [ { "id": "step1", "label": "1. Initial Step" }, { "id": "step2", "label": "2. Next Action" } ],
//     "edges": [ { "source": "step1", "target": "step2" } ]
//   },
//   "checklist": [
//     { "id": "task-1", "text": "Action item / key concept to master", "completed": false }
//   ],
//   "handwrittenData": {
//     "notebookTitle": "Title of the Notebook",
//     "pages": [
//       {
//         "pageNumber": 1,
//         "header": "Page Main Subject / Module Title",
//         "sections": [
//           {
//             "type": "heading",
//             "title": "Section Title"
//           },
//           {
//             "type": "paragraph",
//             "content": "Explanatory text paragraph"
//           },
//           {
//             "type": "bullets",
//             "title": "Key Points",
//             "items": ["Point 1", "Point 2", "Point 3"]
//           },
//           {
//             "type": "definition",
//             "term": "Key Term",
//             "definition": "Precise definition",
//             "highlight": "yellow"
//           },
//           {
//             "type": "formula",
//             "title": "Formula / Rule",
//             "content": "e.g. E = mc² or algorithm logic",
//             "highlight": "pink"
//           },
//           {
//             "type": "example",
//             "title": "Example Case",
//             "content": "Concrete real-world example from transcript",
//             "highlight": "green"
//           },
//           {
//             "type": "diagram",
//             "title": "Conceptual Flow Diagram",
//             "diagramType": "process",
//             "items": ["Input Data", "Processing Step", "Output Result"]
//           }
//         ]
//       }
//     ]
//   }
// }`;

//     const userPrompt = `Video Title: "${videoTitle}"
// Requested Note Style: ${noteStyle}
// Note Depth: ${depth}
// Include Diagrams: ${includeDiagrams}

// Transcript Content:
// """
// ${transcriptText}
// """

// Generate complete, accurate, structured study material matching the exact JSON schema. Ensure handwrittenData has 2 to 6 pages of content broken into logical pages.`;

//     const responseText = await this.callLLM(userPrompt, systemPrompt);

//     try {
//       const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
//       const parsed = JSON.parse(cleanJson);

//       // Simple validation of required fields
//       return {
//         summary: parsed.summary || 'Summary generated from transcript.',
//         notes: parsed.notes || '## Notes\n\nNo detailed notes produced.',
//         flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
//         mindMap: parsed.mindMap || { nodes: [], edges: [] },
//         flowchart: parsed.flowchart || { nodes: [], edges: [] },
//         checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
//         handwrittenData: parsed.handwrittenData || {
//           notebookTitle: videoTitle || 'Study Notebook',
//           pages: [
//             {
//               pageNumber: 1,
//               header: videoTitle || 'Study Notes',
//               sections: [
//                 { type: 'heading', title: 'Overview' },
//                 { type: 'paragraph', content: parsed.summary || 'Summary unavailable' }
//               ]
//             }
//           ]
//         }
//       };
//     } catch (err) {
//       console.error('[AIService] JSON parse error:', err.message, 'Raw response:', responseText?.slice(0, 300));
//       throw new ApiError(500, 'AI returned an unparseable response structure. Please retry.');
//     }
//   }

//   // Legacy helper methods for backwards compatibility
//   async generateSummary(text) {
//     const res = await this.generateStudyMaterials(text);
//     return res.summary;
//   }
//   async generateNotes(text) {
//     const res = await this.generateStudyMaterials(text);
//     return res.notes;
//   }
//   async generateFlashcards(text) {
//     const res = await this.generateStudyMaterials(text);
//     return res.flashcards;
//   }
//   async generateMindMap(text) {
//     const res = await this.generateStudyMaterials(text);
//     return res.mindMap;
//   }
//   async generateChecklist(text) {
//     const res = await this.generateStudyMaterials(text);
//     return res.checklist;
//   }
// }

// module.exports = new AIService();





















const ApiError = require('../utils/ApiError');
const { GoogleGenAI, Type } = require('@google/genai');

/**
 * Unified AI Schema Definition for Structured Output Enforcement
 * Tailored to match StudyShell UI components (Mindmap Canvas & Flowchart Canvas)
 */
const studyShellSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: '3-5 sentence executive summary highlighting key concepts.'
    },
    notes: {
      type: Type.STRING,
      description: 'Detailed Markdown formatted notes with headings (##), subheadings (###), bullet points, bold key terms, definitions, and code/formula snippets.'
    },
    mindMap: {
      type: Type.OBJECT,
      properties: {
        centralTopic: { type: Type.STRING, description: 'The core title node displayed in the center' },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              icon: { type: Type.STRING, description: "e.g., 'lightning', 'shield', 'database', 'bar-chart'" }
            },
            required: ['id', 'label']
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              target: { type: Type.STRING },
              label: { type: Type.STRING }
            },
            required: ['source', 'target']
          }
        }
      },
      required: ['centralTopic', 'nodes', 'edges']
    },
    flowchart: {
      type: Type.OBJECT,
      properties: {
        workflowTitle: { type: Type.STRING, description: 'Title of the process or architectural workflow' },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              stepNumber: { type: Type.STRING, description: "Step identifier e.g. 'STEP 1', 'STEP 2', 'STEP 3B'" },
              title: { type: Type.STRING, description: "Main title of the step card" },
              description: { type: Type.STRING, description: "Sub-label description text shown inside the node card" },
              isDecision: { type: Type.BOOLEAN, description: "True if this step represents a conditional decision point" }
            },
            required: ['id', 'stepNumber', 'title', 'description']
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              target: { type: Type.STRING },
              label: { type: Type.STRING, description: "Edge connection condition (e.g., 'Route', 'Healthy (Yes)', 'Timeout (No)')" }
            },
            required: ['source', 'target']
          }
        }
      },
      required: ['workflowTitle', 'nodes', 'edges']
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING },
          back: { type: Type.STRING }
        },
        required: ['front', 'back']
      }
    },
    checklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          completed: { type: Type.BOOLEAN }
        },
        required: ['id', 'text', 'completed']
      }
    },
    handwrittenData: {
      type: Type.OBJECT,
      properties: {
        notebookTitle: { type: Type.STRING },
        pages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageNumber: { type: Type.INTEGER },
              header: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      enum: ['heading', 'paragraph', 'bullets', 'definition', 'formula', 'example', 'diagram']
                    },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    highlight: { type: Type.STRING },
                    diagramType: { type: Type.STRING }
                  },
                  required: ['type']
                }
              }
            },
            required: ['pageNumber', 'header', 'sections']
          }
        }
      },
      required: ['notebookTitle', 'pages']
    }
  },
  required: ['summary', 'notes', 'mindMap', 'flowchart', 'flashcards', 'checklist', 'handwrittenData']
};

class AIService {
  getProvider() {
    if (process.env.AI_PROVIDER) return process.env.AI_PROVIDER.toLowerCase();
    if (process.env.GEMINI_API_KEY) return 'gemini';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.GROQ_API_KEY) return 'groq';
    return null;
  }

  validateConfiguration() {
    const provider = this.getProvider();
    const apiKeys = {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      groq: process.env.GROQ_API_KEY
    };

    if (!provider) {
      throw new ApiError(
        500,
        'AI Provider is not configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in Backend/.env file.'
      );
    }
    if (!Object.hasOwn(apiKeys, provider)) {
      throw new ApiError(500, 'AI_PROVIDER must be gemini, openai, or groq.');
    }
    if (!apiKeys[provider]) {
      throw new ApiError(500, `Set ${provider.toUpperCase()}_API_KEY for the selected AI provider.`);
    }

    return provider;
  }

  async callLLM(prompt, systemInstruction = '', responseSchema = null) {
    const provider = this.validateConfiguration();

    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      try {
        const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 120000 } });
        const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

        const config = {
          responseMimeType: 'application/json',
          temperature: 0.2
        };

        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        if (responseSchema) {
          config.responseSchema = responseSchema;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config
        });

        if (!response.text) {
          throw new Error('Received empty response from Gemini API');
        }

        return response.text;
      } catch (err) {
        console.error('[AIService] Gemini API error:', err.message);
        if (err.name === 'TimeoutError') {
          throw new ApiError(504, 'Gemini request timed out. Please try again.');
        }
        throw new ApiError(500, `Gemini AI Generation Error: ${err.message}`);
      }
    } else if (provider === 'openai' || provider === 'groq') {
      const isGroq = provider === 'groq';
      const apiKey = isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
      const model = isGroq
        ? (process.env.GROQ_MODEL || defaultModel)
        : (process.env.OPENAI_MODEL || defaultModel);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          signal: AbortSignal.timeout(120000),
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemInstruction || 'You are an expert educational notes generator. Output strictly valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2
          })
        });

        const data = await res.json();
        if (!res.ok) throw new ApiError(500, `${provider.toUpperCase()} API Error: ${data.error?.message || 'Request failed'}`);
        return data.choices[0].message.content;
      } catch (err) {
        console.error(`[AIService] ${provider.toUpperCase()} API error:`, err.message);
        throw new ApiError(500, `${provider.toUpperCase()} AI Generation Error: ${err.message}`);
      }
    } else {
      throw new ApiError(500, `Unsupported AI provider configuration: ${provider}`);
    }
  }

  /**
   * Generates complete structured study material from transcript
   */
  async generateStudyMaterials(transcriptText, videoTitle = '', options = {}) {
    const { noteStyle = 'standard', depth = 'detailed', includeDiagrams = true } = options;

    const systemPrompt = `You are StudyShell AI, an expert academic note-taker and system architecture engine.
Your task is to analyze video transcripts and synthesize structured study material tailored for UI mindmaps and interactive flowchart workflows.

Guidelines:
1. Grounding: Rely strictly on facts from the transcript. Do not fabricate concepts, algorithms, or components.
2. Mindmaps: Identify the core root concept and build out a visual hierarchy of subtopics and child nodes.
3. Flowcharts: Extract processes, sequential logic, or architecture flows into distinct steps (e.g., 'STEP 1', 'STEP 2', 'STEP 3B') with titles, sub-descriptions, and labeled conditional branch edges (e.g., 'Healthy (Yes)', 'Timeout (No)').
4. Technical Accuracy: Retain exact technical terms, component names, metrics, and SLAs.`;

    const userPrompt = `Video Title: "${videoTitle}"
Requested Note Style: ${noteStyle}
Note Depth: ${depth}
Include Diagrams: ${includeDiagrams}

Transcript Content:
"""
${transcriptText}
"""

Synthesize complete, accurate study materials matching the requested JSON schema structure.`;

    const responseText = await this.callLLM(userPrompt, systemPrompt, studyShellSchema);

    try {
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        summary: parsed.summary || 'Summary generated from transcript.',
        notes: parsed.notes || '## Notes\n\nNo detailed notes produced.',
        mindMap: parsed.mindMap || { centralTopic: videoTitle || 'Central Topic', nodes: [], edges: [] },
        flowchart: parsed.flowchart || { workflowTitle: videoTitle || 'Process Workflow', nodes: [], edges: [] },
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
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
      console.error('[AIService] JSON parse error:', err.message, 'Raw response excerpt:', responseText?.slice(0, 300));
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