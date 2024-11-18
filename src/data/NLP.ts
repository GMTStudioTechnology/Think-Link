import conversationData from './Conversation.json';
import conversationData_2 from './Conversation_2.json';
import conversationData_3 from './Conversation_3.json';
import conversationData_4 from './Conversation_4.json';
import conversationData_5 from './Conversation_5.json';
import conversationData_6 from './Conversation_6.json';
import conversationData_7 from './Conversation_7.json';
import conversationData_8 from './Conversation_8.json';
import conversationData_9 from './Chinese_Conver.json';

export interface TrainingData {
  input: string;
  output: string;
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

interface QuestionsEntry {
  question: string;
  answer: string;
}

function trimAndNormalize(entry: { input: string; output: string }): TrainingData {
  return {
    input: normalizeText(entry.input),
    output: normalizeText(entry.output),
  };
}

export function initializeTrainingData(): TrainingData[] {
  try {
    const data1 = loadConversationData(conversationData);
    const data2 = loadTrainingData(conversationData_2);
    const data3 = loadIntents(conversationData_3);
    const data4 = loadQuestions(conversationData_4);
    const data5 = loadIntents(conversationData_5);
    const data6 = loadTrainingData(conversationData_6);
    const data7 = loadTrainingData(conversationData_7);
    const data8 = loadTrainingData(conversationData_8);
    const data9 = loadTrainingData(conversationData_9);

    const allData = [
      ...data1,
      ...data2,
      ...data3,
      ...data4,
      ...data5,
      ...data6,
      ...data7,
      ...data8,
      ...data9,
    ];

    const normalizedData = allData.map(trimAndNormalize);

    const { trainingSet, testingSet } = splitData(normalizedData, 0.8);
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

function loadQuestions(data: unknown): TrainingData[] {
  const questions = (data as { questions: QuestionsEntry[] }).questions;
  if (!questions) throw new Error("Invalid questions data structure");

  return questions.map(entry => ({
    input: entry.question.trim(),
    output: entry.answer.trim(),
  }));
}

function normalizeText(text: string): string {
  return text
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffleData<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function splitData(data: TrainingData[], trainRatio: number): { trainingSet: TrainingData[]; testingSet: TrainingData[] } {
  const shuffled = shuffleData(data);
  const trainSize = Math.floor(shuffled.length * trainRatio);
  const trainingSet = shuffled.slice(0, trainSize);
  const testingSet = shuffled.slice(trainSize);
  return { trainingSet, testingSet };
}

// Basic Vectorization (Word Count)
export function vectorizeData(data: TrainingData[]): { inputs: number[][]; outputs: string[] } {
  const vocabularySet: Set<string> = new Set();
  
  data.forEach(entry => {
    const words = entry.input.split(" ");
    words.forEach(word => {
      vocabularySet.add(word);
    });
  });

  const vocabulary = Array.from(vocabularySet);
  const wordIndex: { [key: string]: number } = {};
  vocabulary.forEach((word, idx) => {
    wordIndex[word] = idx;
  });

  const inputs = data.map(entry => {
    const vector = Array(vocabulary.length).fill(0);
    entry.input.split(" ").forEach(word => {
      if (wordIndex[word] !== undefined) {
        vector[wordIndex[word]] += 1;
      }
    });
    return vector;
  });

  const outputs = data.map(entry => entry.output);
  return { inputs, outputs };
}
