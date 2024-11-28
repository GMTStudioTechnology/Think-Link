import conversationData from './Conversation.json';
import conversationData_2 from './Conversation_2.json';
import conversationData_3 from './Conversation_3.json';
import conversationData_6 from './Conversation_6.json';
import conversationData_7 from './Conversation_7.json';
import conversationData_8 from './Conversation_8.json';
import pythonCodeExamples from './python-codes-25k.json';

export interface TrainingData {
  input: string;
  output: string;
}

export interface CodeEditorState {
  code: string;
  language: string;
  readOnly: boolean;
  pythonOutput?: string;
}

interface ConversationEntry {
  "": number;
  question: string;
  answer: string;
}

interface Intent {
  tag: string;
  patterns: string[];
  responses: string[];
  context_set: string;
}

interface CodeExample {
  instruction: string;
  output: string;
}

function trimAndNormalize(entry: { input: string; output: string }): TrainingData {
  return {
    input: normalizeText(entry.input),
    output: normalizeText(entry.output),
  };
}

// Add a singleton pattern to cache training data
let cachedTrainingData: TrainingData[] | null = null;

export function initializeTrainingData(): TrainingData[] {
  // Return cached data if available
  if (cachedTrainingData) {
    return cachedTrainingData;
  }

  try {
    const data1 = loadConversationData(conversationData);
    const data2 = loadTrainingData(conversationData_2);
    const data3 = loadIntents(conversationData_3);
    const data6 = loadTrainingData(conversationData_6);
    const data7 = loadTrainingData(conversationData_7);
    const data8 = loadTrainingData(conversationData_8);

    const allData = [
      ...data1,
      ...data2,
      ...data3,
      ...data6,
      ...data7,
      ...data8,
    ];

    const normalizedData = allData.map(trimAndNormalize);
    const { trainingSet, testingSet } = splitData(normalizedData, 0.98);
    
    // Cache the training set
    cachedTrainingData = trainingSet;
    
    console.log(`Training set size: ${trainingSet.length}`);
    console.log(`Testing set size: ${testingSet.length}`);

    return trainingSet;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error initializing training data: ${error.message}`);
    } else {
      console.error("An unknown error occurred during training data initialization.");
    }
    return [];
  }
}

function loadConversationData(data: ConversationEntry[]): TrainingData[] {
  return data.map(entry => ({
    input: entry.question.trim(),
    output: entry.answer.trim(),
  }));
}

function loadTrainingData(data: TrainingData[]): TrainingData[] {
  return data.map(entry => ({
    input: entry.input.trim(),
    output: entry.output.trim(),
  }));
}

function loadIntents(data: unknown): TrainingData[] {
  const intents = (data as { intents: Intent[] }).intents;
  if (!intents) throw new Error("Invalid intents data structure");
  
  return intents.flatMap(intent =>
    intent.patterns.map(pattern => ({
      input: pattern.trim(),
      output: intent.responses[0].trim(),
    }))
  );
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/[^\w\s'".,!?-]/g, "")
    .trim();
}

function splitData(data: TrainingData[], trainRatio: number): { trainingSet: TrainingData[]; testingSet: TrainingData[] } {
  const trainSize = Math.floor(data.length * trainRatio);
  const trainingSet = data.slice(0, trainSize);
  const testingSet = data.slice(trainSize);
  return { trainingSet, testingSet };
}

// Enhanced vectorization with TF-IDF weighting
export function vectorizeData(data: TrainingData[]): { inputs: number[][]; outputs: string[]; vocabulary: string[] } {
  const vocabularySet: Set<string> = new Set();
  const documentFrequency: { [key: string]: number } = {};
  
  // Build vocabulary and calculate document frequency
  data.forEach(entry => {
    const words = entry.input.toLowerCase()
      .split(/[\s.,!?]+/)
      .filter(word => word.length > 1);
    
    const uniqueWords = new Set(words);
    uniqueWords.forEach(word => {
      vocabularySet.add(word);
      documentFrequency[word] = (documentFrequency[word] || 0) + 1;
    });
  });

  const vocabulary = Array.from(vocabularySet);
  const wordIndex: { [key: string]: number } = {};
  vocabulary.forEach((word, idx) => {
    wordIndex[word] = idx;
  });

  const inputs = data.map(entry => {
    const vector = Array(vocabulary.length).fill(0);
    const words = entry.input.toLowerCase()
      .split(/[\s.,!?]+/)
      .filter(word => word.length > 1);
    
    const wordCount: { [key: string]: number } = {};
    
    // Calculate term frequency
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Calculate TF-IDF for each word
    Object.keys(wordCount).forEach(word => {
      if (wordIndex[word] !== undefined) {
        const tf = wordCount[word] / words.length;
        const idf = Math.log(data.length / (documentFrequency[word] || 1));
        vector[wordIndex[word]] = tf * idf;
      }
    });

    return vector;
  });

  const outputs = data.map(entry => entry.output);
  return { inputs, outputs, vocabulary };
}

// Add a function to calculate similarity between vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB) || 0;
}

// Add interface for match results
interface MatchResult {
  response: string;
  confidence: number;
  matchType: 'exact' | 'pattern' | 'partial' | 'similarity';
}

// Add JARVIS-level recognition patterns interface
interface RecognitionPattern {
  type: 'exact' | 'variation' | 'semantic' | 'contextual' | 'behavioral' | 'emotional';
  pattern: string;
  weight?: number;
  confidence?: number;
  context?: string[];
}

// Add JARVIS response interface
interface JarvisResponse extends MatchResult {
  context?: string[];
  mood?: string;
  certainty?: number;
  suggestions?: string[];
}

// Enhanced findBestMatch with recognition patterns
export function findBestMatch(query: string, trainingData: TrainingData[], threshold: number = 0.3): string {
  const normalizedQuery = normalizeText(query);
  const matches: JarvisResponse[] = [];
  const context: string[] = [];

  // JARVIS-level pattern recognition system
  trainingData.forEach(entry => {
    const baseInput = normalizeText(entry.input);
    
    // Create advanced recognition patterns with contextual awareness
    const patterns: RecognitionPattern[] = [
      { type: 'exact', pattern: baseInput, weight: 1.0, context: ['direct'] },
      { type: 'variation', pattern: baseInput.replace(/[.,!?]/g, ''), weight: 0.95, context: ['normalized'] },
      { type: 'semantic', pattern: baseInput.split(/\s+/).sort().join(' '), weight: 0.9, context: ['reordered'] },
      { type: 'contextual', pattern: baseInput.replace(/\b(what|how|why|when|where|who)\b/gi, ''), weight: 0.85, context: ['question'] },
      { type: 'behavioral', pattern: baseInput.replace(/\b(can|could|would|should)\b/gi, ''), weight: 0.8, context: ['capability'] },
      { type: 'emotional', pattern: baseInput.replace(/\b(feel|think|believe|want|need|like|love|hate)\b/gi, ''), weight: 0.75, context: ['emotional'] },
      
      // Advanced contextual patterns
      { type: 'semantic', pattern: extractKeyPhrases(baseInput), weight: 0.85, context: ['key-phrases'] },
      { type: 'behavioral', pattern: analyzeSentiment(baseInput), weight: 0.8, context: ['sentiment'] },
      { type: 'contextual', pattern: detectIntent(baseInput), weight: 0.9, context: ['intent'] }
    ];

    // Enhanced pattern matching with context awareness
    patterns.forEach(p => {
      const normalizedPattern = normalizeText(p.pattern.trim());
      const matchScore = calculateMatchScore(normalizedQuery, normalizedPattern);
      
      if (matchScore > threshold) {
        matches.push({
          response: entry.output,
          confidence: matchScore * (p.weight || 1),
          matchType: p.type === 'exact' ? 'exact' : 'pattern',
          context: p.context,
          certainty: matchScore,
          suggestions: generateSuggestions(p.context || [])
        });
        context.push(...(p.context || []));
      }
    });
  });

  // Process high-confidence matches with JARVIS-like intelligence
  const highConfidenceMatches = matches.filter(m => m.confidence > 0.8);
  if (highConfidenceMatches.length > 0) {
    const bestMatch = highConfidenceMatches.sort((a, b) => b.confidence - a.confidence)[0];
    return enhanceResponse(bestMatch.response, bestMatch.context || []);
  }

  // Continue with existing fallback logic but with JARVIS-like enhancements
  return generateJarvisResponse(query);
}

// Helper functions for JARVIS-like behavior
function extractKeyPhrases(text: string): string {
  // Advanced key phrase extraction
  const phrases = text.match(/\b\w+(?:\s+\w+){1,3}\b/g) || [];
  return phrases.join(' ');
}

function analyzeSentiment(text: string): string {
  // Sentiment analysis implementation
  const sentimentWords = {
    positive: /\b(good|great|awesome|excellent|happy|love|wonderful|fantastic)\b/gi,
    negative: /\b(bad|terrible|awful|horrible|sad|hate|poor|wrong)\b/gi
  };
  
  const positiveCount = (text.match(sentimentWords.positive) || []).length;
  const negativeCount = (text.match(sentimentWords.negative) || []).length;
  
  return positiveCount > negativeCount ? 'positive' : 
         negativeCount > positiveCount ? 'negative' : 'neutral';
}

function detectIntent(text: string): string {
  // Intent detection implementation
  const intents = {
    question: /\b(what|how|why|when|where|who)\b/i,
    command: /\b(do|make|create|show|tell|find|help)\b/i,
    statement: /\b(is|are|was|were|will|would)\b/i
  };
  
  for (const [intent, pattern] of Object.entries(intents)) {
    if (pattern.test(text)) return intent;
  }
  return 'unknown';
}

function calculateMatchScore(query: string, pattern: string): number {
  // Enhanced matching score calculation
  const exactMatch = query === pattern;
  const containsMatch = query.includes(pattern) || pattern.includes(query);
  const wordMatch = query.split(' ').some(word => pattern.includes(word));
  
  if (exactMatch) return 1;
  if (containsMatch) return 0.9;
  if (wordMatch) return 0.7;
  return 0;
}

function generateSuggestions(context: string[]): string[] {
  // Generate contextual suggestions based on context only
  const suggestions: string[] = [];
  
  if (context.includes('question')) {
    suggestions.push('Would you like me to elaborate on that?');
  }
  if (context.includes('capability')) {
    suggestions.push('I can help you with similar tasks as well.');
  }
  if (context.includes('emotional')) {
    suggestions.push('Would you like to discuss this further?');
  }
  
  return suggestions;
}

function enhanceResponse(response: string, context: string[]): string {
  // Add JARVIS-like personality to responses
  if (context.includes('emotional')) {
    response = `I understand this is important to you. ${response}`;
  }
  if (context.includes('question')) {
    response = `Let me assist you with that. ${response}`;
  }
  return response;
}

function generateJarvisResponse(query: string): string {
  // Generate JARVIS-style fallback responses
  if (query.toLowerCase().includes('how')) {
    return "Sir, I understand you're inquiring about a process. Could you provide more specific parameters for me to assist you better?";
  }
  if (query.toLowerCase().includes('what')) {
    return "If I may, sir, I'll need additional context to provide you with accurate information about that.";
  }
  if (query.toLowerCase().includes('why')) {
    return "An interesting inquiry, sir. Would you like me to analyze the causality of this situation?";
  }
  
  return "I apologize, sir, but I need more information to provide you with a proper response. How may I refine my assistance?";
}

// Add a function to generate code based on instructions
export function generateCodeFromInstruction(instruction: string): CodeEditorState {
  try {
    // Type assertion for the imported JSON
    const examples = pythonCodeExamples as CodeExample[];
    
    // Find matching code example
    const matchingExample = examples.find((example) => 
      example.instruction.toLowerCase().includes(instruction.toLowerCase())
    );

    if (matchingExample) {
      // Extract the code from the output field
      const code = matchingExample.output
        .replace(/```python\n/, '')
        .replace(/```$/, '')
        .trim();

      return {
        language: 'python',
        readOnly: true,
        code,
        pythonOutput: ''
      };
    }

    // Return default state if no match found
    return {
      language: 'python',
      readOnly: true,
      code: "# No matching code example found for this instruction",
      pythonOutput: ''
    };
  } catch (error) {
    console.error('Error generating code:', error);
    return {
      language: 'python',
      readOnly: true,
      code: "# Error generating code example",
      pythonOutput: ''
    };
  }
}

// Add method to clear cache if needed
export function clearTrainingDataCache(): void {
  cachedTrainingData = null;
}
