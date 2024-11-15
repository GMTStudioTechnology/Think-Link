import conversationData from './Conversation.json';
import conversationData_2 from './Conversation_2.json';
export interface TrainingData {
  input: string;
  output: string;
}

interface ConversationEntry {
  "": number;
  question: string;
  answer: string;
}

export function initializeTrainingData(): TrainingData[] {
  const data1 = (conversationData as ConversationEntry[]).map(entry => ({
    input: entry.question.trim(),
    output: entry.answer.trim(),
  }));

  const data2 = (conversationData_2 as TrainingData[]).map(entry => ({
    input: entry.input.trim(),
    output: entry.output.trim(), 
  }));

  return [...data1, ...data2];
}
