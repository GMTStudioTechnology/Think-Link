import conversationData from './Conversation.json';
import conversationData_2 from './Conversation_2.json';
import conversationData_3 from './Conversation_3.json';
import conversationData_4 from './Conversation_4.json';
import conversationData_5 from './Conversation_5.json';

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

export function initializeTrainingData(): TrainingData[] {
  try {
    const data1 = loadConversationData(conversationData);
    const data2 = loadTrainingData(conversationData_2);
    const data3 = loadIntents(conversationData_3);
    const data4 = loadQuestions(conversationData_4);
    const data5 = loadIntents(conversationData_5);

    const allData = [...data1, ...data2, ...data3, ...data4, ...data5];
    const normalizedData = allData.map(entry => ({
      input: normalizeText(entry.input),
      output: normalizeText(entry.output),
    }));

    const { trainingSet, testingSet } = splitData(normalizedData, 0.8);
    console.log(`Training set size: ${trainingSet.length}`);
    console.log(`Testing set size: ${testingSet.length}`);

    return trainingSet;
  } catch (error) {
    console.error("Error initializing training data:", error);
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
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitData(data: TrainingData[], trainRatio: number): { trainingSet: TrainingData[]; testingSet: TrainingData[] } {
  const shuffled = data.sort(() => 0.5 - Math.random());
  const trainSize = Math.floor(shuffled.length * trainRatio);
  const trainingSet = shuffled.slice(0, trainSize);
  const testingSet = shuffled.slice(trainSize);
  return { trainingSet, testingSet };
}

// Basic Vectorization (Word Count)
export function vectorizeData(data: TrainingData[]): { inputs: number[][]; outputs: string[] } {
  const vocabulary: { [key: string]: number } = {};
  let index = 0;

  data.forEach(entry => {
    const words = entry.input.split(" ");
    words.forEach(word => {
      if (!vocabulary[word]) {
        vocabulary[word] = index++;
      }
    });
  });

  const inputs = data.map(entry => {
    const vector = Array(index).fill(0);
    entry.input.split(" ").forEach(word => {
      if (vocabulary[word] !== undefined) {
        vector[vocabulary[word]] += 1;
      }
    });
    return vector;
  });

  const outputs = data.map(entry => entry.output);
  return { inputs, outputs };
}
