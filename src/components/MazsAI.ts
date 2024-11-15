import { initializeTrainingData, TrainingData } from '../data/NLP';

interface NeuralNetworkLayer {
  weights: number[][];
  bias: number[];
}

export class MazsAI {
  private vocabulary: Set<string>;
  private layers: NeuralNetworkLayer[];
  private trainingData: TrainingData[];

  constructor() {
    this.vocabulary = new Set<string>();
    this.layers = [];
    this.trainingData = initializeTrainingData();
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    // Create a simple 3-layer network with improved dimensions
    this.layers = [
      {
        weights: this.createRandomMatrix(100, 64),
        bias: new Array(64).fill(0).map(() => Math.random() - 0.5)
      },
      {
        weights: this.createRandomMatrix(64, 32),
        bias: new Array(32).fill(0).map(() => Math.random() - 0.5)
      },
      {
        weights: this.createRandomMatrix(32, 16),
        bias: new Array(16).fill(0).map(() => Math.random() - 0.5)
      }
    ];
  }

  private createRandomMatrix(rows: number, cols: number): number[][] {
    return Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => Math.random() - 0.5)
    );
  }

  private tokenize(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => this.vocabulary.add(word));
    
    // Create a simple bag-of-words vector with improved hashing
    const vector = new Array(100).fill(0);
    words.forEach(word => {
      const hash = this.hashString(word);
      vector[hash % 100] += 1;
    });
    
    return vector;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private forwardPass(inputVector: number[]): number[] {
    let current = inputVector;
    
    for (const layer of this.layers) {
      const next = new Array(layer.bias.length).fill(0);
      
      for (let i = 0; i < layer.bias.length; i++) {
        let sum = layer.bias[i];
        for (let j = 0; j < current.length; j++) {
          sum += current[j] * layer.weights[j][i];
        }
        next[i] = this.sigmoid(sum);
      }
      
      current = next;
    }
    
    return current;
  }

  private findBestMatch(inputText: string): string {
    const inputVector = this.tokenize(inputText);
    const inputEmbedding = this.forwardPass(inputVector);
    
    let bestMatch = this.trainingData[0];
    let bestScore = -Infinity;
    
    for (const example of this.trainingData) {
      const exampleVector = this.tokenize(example.input);
      const exampleEmbedding = this.forwardPass(exampleVector);
      
      const score = this.cosineSimilarity(inputEmbedding, exampleEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = example;
      }
    }
    
    return bestScore > 0.7 ? bestMatch.output : this.generateFallbackResponse();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private generateFallbackResponse(): string {
    const responses = [
      "I'm not sure I understand. Could you rephrase that?",
      "I'm still learning. Could you try asking in a different way?",
      "I don't have enough information to respond to that properly.",
      "Could you provide more context or details?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public processInput(input: string): string {
    // Preprocess input
    const processedInput = input.trim().toLowerCase();
    
    // Check for empty input
    if (!processedInput) {
      return "Please provide a command or question.";
    }

    // Determine if the input is a chat command (e.g., starts with 'chat:')
    if (processedInput.startsWith('chat:')) {
      const chatMessage = processedInput.replace('chat:', '').trim();
      return this.findBestMatch(chatMessage);
    }

    // If not a chat command, process normally
    return this.findBestMatch(processedInput);
  }

  // Method to add new training data
  public learn(input: string, output: string): void {
    this.trainingData.push({ input, output });
  }

  // Method to get model statistics
  public getModelStats(): { vocabularySize: number; trainingExamples: number } {
    return {
      vocabularySize: this.vocabulary.size,
      trainingExamples: this.trainingData.length,
    };
  }
}

