/**
 * AI Provider Abstraction
 * This isolates the specific AI API (OpenAI, Gemini, Anthropic) from the business logic.
 */
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'mock';
  }

  async generateSummary(text) {
    // Call specific provider implementation
    return `Summary of: ${text.substring(0, 50)}...`;
  }

  async generateNotes(text) {
    return `## Structured Notes\n\n- Key point 1\n- Key point 2\n\nContext: ${text.substring(0, 30)}...`;
  }

  async generateFlashcards(text) {
    return [
      { front: 'Question 1', back: 'Answer 1' },
      { front: 'Question 2', back: 'Answer 2' }
    ];
  }

  async generateMindMap(text) {
    return {
      nodes: [
        { id: '1', label: 'Main Concept' },
        { id: '2', label: 'Sub Concept 1' }
      ],
      edges: [
        { source: '1', target: '2' }
      ]
    };
  }
  
  async generateChecklist(text) {
    return [
      { id: 'task-1', text: 'Review notes', completed: false },
      { id: 'task-2', text: 'Practice flashcards', completed: false }
    ];
  }
}

module.exports = new AIService();
