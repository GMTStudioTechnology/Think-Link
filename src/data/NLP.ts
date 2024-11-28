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

// Modify findBestMatch to prioritize exact matches
export function findBestMatch(query: string, trainingData: TrainingData[], threshold: number = 0.3): string {
  // First, try to find an exact match (case-insensitive)
  const normalizedQuery = normalizeText(query);
  const exactMatch = trainingData.find(entry => 
    normalizeText(entry.input) === normalizedQuery
  );
  
  if (exactMatch) {
    return exactMatch.output;
  }

  // If no exact match, then try pattern matching
  const patternMatch = trainingData.find(entry => {
    const pattern = new RegExp(normalizeText(entry.input), 'i');
    return pattern.test(normalizedQuery);
  });

  if (patternMatch) {
    return patternMatch.output;
  }

  // If no pattern match, fall back to cosine similarity
  const queryVector = vectorizeSingleInput(query, Array.from(new Set(trainingData.map(d => d.input.split(' ')).flat())));
  let bestMatch = { similarity: 0, response: '' };

  trainingData.forEach(entry => {
    const entryVector = vectorizeSingleInput(entry.input, Array.from(new Set(trainingData.map(d => d.input.split(' ')).flat())));
    const similarity = cosineSimilarity(queryVector, entryVector);
    
    if (similarity > bestMatch.similarity) {
      bestMatch = { similarity, response: entry.output };
    }
  });

  return bestMatch.similarity >= threshold ? bestMatch.response : "I'm not sure how to respond to that.";
}

// Helper function to vectorize a single input
function vectorizeSingleInput(input: string, vocabulary: string[]): number[] {
  const vector = new Array(vocabulary.length).fill(0);
  const words = input.toLowerCase().split(/[\s.,!?]+/).filter(word => word.length > 1);
  
  words.forEach(word => {
    const index = vocabulary.indexOf(word);
    if (index !== -1) {
      vector[index]++;
    }
  });
  
  return vector;
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
