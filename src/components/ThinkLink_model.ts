import { trainingData } from '../data/trainingData';

export interface Task {
  id: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  created: Date;
  due?: Date;
  context?: string;
  type?: 'task' | 'event' | 'note';
  status: 'pending' | 'done';
}

interface TrainingData {
  input: string;
  expectedOutput: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    type: 'task' | 'event' | 'note';
  };
}

interface NLUResult {
  mainTopic: string;
  action: string;
  entities: {
    subject?: string;
    object?: string;
    location?: string;
    time?: string;
    people?: string[];
  };
  keywords: string[];
  sentiment: number;
  urgency: number;
}

interface ParsedSentence {
  text: string;
  score: number;
  action?: string;
  topic?: string;
  entities: {
    subject?: string;
    object?: string;
    time?: string;
    location?: string;
  };
}

type VerbPhrase = {
  verb: string;
  object?: string;
  modifiers: string[];
};

export class ThinkLinkNLP {
  private keywords = {
    priority: {
      high: ['urgent', 'important', 'critical', 'asap', 'high', 'priority', 'crucial', 'vital', 'emergency'],
      medium: ['normal', 'medium', 'moderate', 'standard', 'regular'],
      low: ['low', 'later', 'whenever', 'not urgent', 'optional', 'someday', 'eventually']
    },
    categories: [
      'work', 'personal', 'shopping', 'health', 'study', 'finance', 
      'home', 'family', 'project', 'meeting', 'travel', 'fitness',
      'calendar', 'goal', 'note'
    ],
    timeIndicators: [
      'today', 'tomorrow', 'tonight', 'next week', 'next month',
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'hour', 'minute', 'second', 'morning', 'afternoon', 'evening'
    ],
    actions: [
      'create', 'add', 'new', 'delete', 'remove', 'update', 
      'show', 'list', 'complete', 'done', 'finish', 'edit',
      'view', 'schedule', 'organize', 'plan', 'set', 'mark'
    ],
    contextual: ['for', 'by', 'at', 'on', 'in', 'with', 'to', 'from'],
    relationships: [
      'with', 'for', 'team', 'client', 'boss', 'colleague', 'partner',
      'department', 'group', 'stakeholder', 'customer', 'family', 'friend'
    ],
    locations: [
      'office', 'home', 'remote', 'online', 'virtual', 'room', 
      'building', 'site', 'location', 'park', 'gym', 'restaurant',
      'cafe', 'library'
    ],
    urgencyModifiers: [
      'before', 'after', 'deadline', 'due', 'must', 'should', 
      'need to', 'required', 'mandatory', 'immediately', 'soon', 'quickly'
    ]
  };

  private sentimentWeights = {
    positive: ['excited', 'happy', 'great', 'good', 'important', 'successful', 'achieve', 'satisfied', 'delighted', 'fantastic'],
    negative: ['worried', 'concerned', 'bad', 'difficult', 'hard', 'stressful', 'frustrated', 'upset', 'disappointed', 'overwhelmed']
  };

  // Neural network weights
  private neuralWeights = {
    priority: new Map<string, number>(),
    category: new Map<string, number>(),
    type: new Map<string, number>()
  };

  private learningRate = 0.05; // Adjusted for smoother training
  private trainingDataSet: TrainingData[] = trainingData;
  private modelKey = 'ThinkLinkNLPModel';

  // Add context awareness
  private contextPatterns = {
    deadline: /by|before|due|until|deadline/i,
    dependency: /after|following|depends on|blocked by/i,
    recurring: /every|daily|weekly|monthly|yearly|recurring/i,
    duration: /for|during|takes|hours|minutes|days|weeks|months|years/i
  };

  // Enhanced stopwords for better performance
  private extendedStopwords: Set<string> = new Set([
    'the', 'is', 'in', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'for', 
    'to', 'of', 'with', 'please', 'help', 'me', 'add', 'create', 'task', 
    'called', 'new', 'assist', 'support', 'this', 'that', 'these', 'those',
    'i', 'we', 'they', 'he', 'she', 'it', 'you', 'my', 'our', 'their',
    'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'will', 'would', 'should', 'could', 'must', 'can', 'may', 'might', 'need',
    'must', 'shall'
  ]);

  private nlpPatterns = {
    // Enhanced sentence structures with more variations
    subjectVerbObject: /\b(\w+)\s+(is|are|was|were|have|has|had|will|would|should|could|must|can|may|might)\s+(\w+)\b/i,
    actionObject: /\b(create|update|review|prepare|develop|implement|fix|organize|schedule|plan|complete|finish|set|mark|achieve)\s+([a-z\s]+)\b/i,
    timeExpression: /\b(today|tomorrow|next|this|coming|following|in|after|within|by)\s+(week|month|day|morning|afternoon|evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday|hour|minute|second)s?\b/i,
    
    // Enhanced task-specific patterns
    deadlinePattern: /\b(due|deadline|by|before|until|not later than|no later than)\s+([a-z0-9\s,]+)\b/i,
    priorityPattern: /\b(urgent|asap|important|critical|high priority|low priority|medium priority|crucial|vital|essential)\b/i,
    
    // Enhanced entity patterns
    peoplePattern: /\b(with|for|from|to|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
    locationPattern: /\b(at|in|from|to|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
    
    // New patterns for better understanding
    conditionalPattern: /\b(if|when|unless|until|after|before)\s+([^,.]+)/i,
    quantityPattern: /\b(\d+)\s+(minutes?|hours?|days?|weeks?|months?|years?)\b/i,
    statusPattern: /\b(completed|done|finished|in progress|pending|started|not started)\b/i,
    relationPattern: /\b(depends on|blocked by|related to|linked with|part of)\b/i
  };

  private verbGroups = {
    creation: ['create', 'develop', 'prepare', 'make', 'build', 'design', 'establish', 'set', 'mark', 'achieve'],
    modification: ['update', 'modify', 'change', 'revise', 'edit', 'adjust'],
    review: ['review', 'check', 'analyze', 'evaluate', 'assess', 'examine'],
    completion: ['complete', 'finish', 'deliver', 'submit', 'send'],
    communication: ['discuss', 'present', 'share', 'explain', 'report'],
    planning: ['plan', 'schedule', 'organize', 'arrange', 'coordinate']
  };

  // Enhanced date parsing patterns
  private datePatterns = {
    relative: {
      today: /\b(today|tonight)\b/i,
      tomorrow: /\b(tomorrow)\b/i,
      nextWeek: /\b(next\s+week)\b/i,
      nextMonth: /\b(next\s+month)\b/i,
      weekend: /\b(this\s+weekend|next\s+weekend)\b/i,
    },
    absolute: {
      date: /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,
      dayMonth: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{1,2})(st|nd|rd|th)?\b/i,
      time: /\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i,
    }
  };

  constructor() {
    if (!this.loadModel()) {
      this.initializeWeights();
      this.trainModelWithDataset(300); // Increased epochs for better training
      this.saveModel();
    }
  }

  private initializeWeights(): void {
    // Initialize weights for all known words with a focus on diversity
    const allWords = new Set([
      ...this.keywords.priority.high,
      ...this.keywords.priority.medium,
      ...this.keywords.priority.low,
      ...this.keywords.categories,
      ...this.keywords.timeIndicators,
      ...this.keywords.actions,
      ...this.keywords.contextual,
      ...this.sentimentWeights.positive,
      ...this.sentimentWeights.negative
    ]);

    allWords.forEach(word => {
      this.neuralWeights.priority.set(word, Math.random() * 2 - 1);
      this.neuralWeights.category.set(word, Math.random() * 2 - 1);
      this.neuralWeights.type.set(word, Math.random() * 2 - 1);
    });
  }

  private trainModelWithDataset(epochs: number = 100): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      this.trainingDataSet.forEach(sample => {
        this.train(sample.input, sample.expectedOutput);
      });

      if ((epoch + 1) % 10 === 0) {
        const stats = this.getTrainingStats();
        console.log(`Epoch ${epoch + 1}: Accuracy = ${(stats.averageAccuracy * 100).toFixed(2)}%`);
        // Optional: Implement early stopping based on accuracy
        if (stats.averageAccuracy >= 0.95) {
          console.log('Desired accuracy reached. Stopping training.');
          break;
        }
      }
    }
  }

  public train(input: string, expectedOutput: TrainingData['expectedOutput']): void {
    const tokens = this.tokenize(input);
    const prediction = this.predict(tokens);

    // Update weights based on prediction error
    tokens.forEach(token => {
      // Update Priority Weights
      if (this.neuralWeights.priority.has(token)) {
        const target = this.encodePriority(expectedOutput.priority);
        const error = target - prediction.priority;
        const currentWeight = this.neuralWeights.priority.get(token) || 0;
        this.neuralWeights.priority.set(
          token,
          currentWeight + this.learningRate * error
        );
      }

      // Update Category Weights
      if (this.neuralWeights.category.has(token)) {
        const target = this.encodeCategory(expectedOutput.category);
        const error = target - prediction.category;
        const currentWeight = this.neuralWeights.category.get(token) || 0;
        this.neuralWeights.category.set(
          token,
          currentWeight + this.learningRate * error
        );
      }

      // Update Type Weights
      if (this.neuralWeights.type.has(token)) {
        const target = this.encodeType(expectedOutput.type);
        const error = target - prediction.type;
        const currentWeight = this.neuralWeights.type.get(token) || 0;
        this.neuralWeights.type.set(
          token,
          currentWeight + this.learningRate * error
        );
      }
    });
  }

  private predict(tokens: string[]): {
    priority: number;
    category: number;
    type: number;
  } {
    const prediction = {
      priority: 0,
      category: 0,
      type: 0
    };

    tokens.forEach(token => {
      prediction.priority += this.neuralWeights.priority.get(token) || 0;
      prediction.category += this.neuralWeights.category.get(token) || 0;
      prediction.type += this.neuralWeights.type.get(token) || 0;
    });

    // Apply activation function (sigmoid)
    return {
      priority: this.sigmoid(prediction.priority),
      category: this.sigmoid(prediction.category),
      type: this.sigmoid(prediction.type)
    };
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private encodePriority(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 0.5;
      case 'low': return 0;
      default: return 0.5;
    }
  }

  private encodeCategory(category: string): number {
    // Simple encoding based on category index
    const index = this.keywords.categories.indexOf(category);
    return index >= 0 ? index / this.keywords.categories.length : 0.5;
  }

  private encodeType(type: 'task' | 'event' | 'note'): number {
    switch (type) {
      case 'task': return 1;
      case 'event': return 0.5;
      case 'note': return 0;
      default: return 0.5;
    }
  }

  // Modify existing extractPriority to use neural network prediction
  private extractPriority(tokens: string[]): 'high' | 'medium' | 'low' {
    const prediction = this.predict(tokens);
    
    // Combine neural network prediction with rule-based approach
    const ruleBasedPriority = this.extractPriorityRuleBased(tokens);
    const neuralPriority = prediction.priority > 0.7 ? 'high' : 
                          prediction.priority > 0.4 ? 'medium' : 'low';
    
    // Weight both approaches (70% neural, 30% rule-based)
    return Math.random() < 0.7 ? neuralPriority : ruleBasedPriority;
  }

  // Rename original extractPriority to extractPriorityRuleBased
  private extractPriorityRuleBased(tokens: string[]): 'high' | 'medium' | 'low' {
    for (const token of tokens) {
      if (this.keywords.priority.high.includes(token)) return 'high';
      if (this.keywords.priority.medium.includes(token)) return 'medium';
      if (this.keywords.priority.low.includes(token)) return 'low';
    }
    return 'medium';
  }

  // Add method to get training statistics
  public getTrainingStats(): {
    samplesCount: number;
    averageAccuracy: number;
  } {
    const totalSamples = this.trainingDataSet.length;
    if (totalSamples === 0) {
      return { samplesCount: 0, averageAccuracy: 0 };
    }

    let correctPredictions = 0;
    this.trainingDataSet.forEach(sample => {
      const tokens = this.tokenize(sample.input);
      const prediction = this.predict(tokens);
      
      // Simple accuracy check for priority
      const predictedPriority = prediction.priority > 0.7 ? 'high' : 
                               prediction.priority > 0.4 ? 'medium' : 'low';
      if (predictedPriority === sample.expectedOutput.priority) {
        correctPredictions++;
      }
    });

    return {
      samplesCount: totalSamples,
      averageAccuracy: correctPredictions / totalSamples
    };
  }

  private tokenize(input: string): string[] {
    return input.toLowerCase()
      // Handle contractions
      .replace(/n't/g, ' not')
      .replace(/'re/g, ' are')
      .replace(/'s/g, ' is')
      .replace(/'d/g, ' would')
      .replace(/'ll/g, ' will')
      .replace(/'t/g, ' not')
      .replace(/[.,/#$%^&*;:{}=_`~()\-/"“”]/g, '')
      .split(/\s+/)
      .map(token => this.stemToken(token))
      .filter(token => token.length > 0);
  }

  /**
   * Basic stemming to reduce words to their root form
   * This is a rudimentary implementation due to constraints
   */
  private stemToken(token: string): string {
    const suffixes = ['ing', 'ed', 'ly', 'es', 's', 'ment'];
    for (const suffix of suffixes) {
      if (token.endsWith(suffix) && token.length > suffix.length + 2) { // Ensure meaningful stem
        return token.slice(0, -suffix.length);
      }
    }
    return token;
  }

  private extractCategory(tokens: string[]): string {
    for (const token of tokens) {
      if (this.keywords.categories.includes(token)) return token;
    }
    return 'personal';
  }

  private extractDate(tokens: string[]): Date | undefined {
    const today = new Date();
    const dateIndicator = tokens.find(token => 
      this.keywords.timeIndicators.includes(token)
    );

    if (!dateIndicator) return undefined;

    switch (dateIndicator) {
      case 'today':
        return today;
      case 'tomorrow':
        return new Date(today.setDate(today.getDate() + 1)); 
      case 'next week':
        return new Date(today.setDate(today.getDate() + 7));
      case 'next month':
        return new Date(today.setMonth(today.getMonth() + 1));
      case 'monday':
      case 'tuesday':
      case 'wednesday':
      case 'thursday':
      case 'friday':
      case 'saturday':
      case 'sunday':
        return this.getNextWeekday(dateIndicator);
      default:
        return undefined;
    }
  }

  // Add smart date parsing
  private extractSmartDate(tokens: string[]): { due?: Date; recurring?: string } {
    const text = tokens.join(' ');
    const result: { due?: Date; recurring?: string } = {};
    
    // Handle recurring patterns
    const recurringMatch = text.match(/every (day|week|month|year|daily|weekly|monthly|yearly)/i);
    if (recurringMatch) {
      result.recurring = recurringMatch[1].toLowerCase();
    }

    // Handle relative dates
    if (text.includes('next')) {
      const today = new Date();
      if (text.includes('week')) {
        result.due = new Date(today.setDate(today.getDate() + 7));
      } else if (text.includes('month')) {
        result.due = new Date(today.setMonth(today.getMonth() + 1));
      }
    }

    // Handle specific weekdays
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mentionedDay = weekdays.find(day => text.toLowerCase().includes(day));
    if (mentionedDay) {
      result.due = this.getNextWeekday(mentionedDay);
    }

    return result;
  }

  // Add smart priority calculation
  private calculateSmartPriority(tokens: string[]): 'high' | 'medium' | 'low' {
    const text = tokens.join(' ');
    let score = 0;

    // Check urgency indicators
    this.keywords.urgencyModifiers.forEach(modifier => {
      if (text.includes(modifier)) score += 2;
    });

    // Check deadline proximity
    const dateInfo = this.extractSmartDate(tokens);
    if (dateInfo.due) {
      const daysUntilDue = Math.ceil((dateInfo.due.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (daysUntilDue <= 2) score += 3;
      else if (daysUntilDue <= 7) score += 2;
    }

    // Check relationship importance
    this.keywords.relationships.forEach(rel => {
      if (text.includes(rel)) score += 1;
    });

    // Consider sentiment
    const sentiment = this.analyzeSentiment(tokens);
    score += sentiment * 2;

    return score >= 6 ? 'high' : score >= 4 ? 'medium' : 'low';
  }

  // Enhanced processCommand method
  public processCommand(input: string): {
    action: string;
    task?: Task;
    message: string;
    suggestions?: string[];
  } {
    const tokens = this.tokenize(input);
    const text = tokens.join(' ');
    const action = tokens.find(token => this.keywords.actions.includes(token)) || 'create';
    const suggestions: string[] = [];

    if (action === 'list' || action === 'show') {
      return {
        action: 'list',
        message: 'Displaying all tasks.'
      };
    }

    if (action === 'delete' || action === 'remove') {
      const taskId = tokens.find(token => this.isValidId(token));
      
      if (taskId) {
        return {
          action: 'delete',
          task: { id: taskId } as Task, // Create a minimal task object with just the ID
          message: `Deleted task with ID ${taskId}`
        };
      }
      return {
        action: 'delete',
        message: 'Please specify the task ID to delete. Use the format: delete <task-id>'
      };
    }

    if (action === 'schedule' || action === 'organize' || action === 'view') {
      // Handle calendar-related commands
      return {
        action: 'calendar',
        message: 'Calendar functionality is under development.'
      };
    }

    if (action === 'create') {
      const dateInfo = this.extractSmartDate(tokens);
      const smartPriority = this.calculateSmartPriority(tokens);
      const category = this.extractCategory(tokens);

      // Generate smart suggestions
      if (!dateInfo.due) {
        suggestions.push("Consider adding a due date for better task management.");
      }
      if (category === 'personal' && text.includes('work')) {
        suggestions.push("This might be better categorized as a 'work' task.");
      }
      if (smartPriority === 'high' && !tokens.some(t => this.keywords.priority.high.includes(t))) {
        suggestions.push("This task seems important. Consider marking it as high priority.");
      }

      // Attempt to extract task name from quoted strings or summarize
      const taskName = this.extractTaskName(input) || this.summarizeTaskName(input);

      // Generate smart suggestions for the task name
      if (!taskName || taskName === 'New Task') {
        suggestions.push("Couldn't extract a meaningful task name. Please provide more details.");
      }

      const task: Task = {
        id: this.generateUniqueId(),
        content: this.capitalizeTaskName(taskName),
        priority: smartPriority,
        category,
        created: new Date(),
        due: dateInfo.due,
        context: this.extractContext(tokens),
        status: 'pending',
        type: 'task'
      };

      return {
        action: 'create',
        task,
        message: `Created a new ${task.priority} priority ${task.type} in ${task.category} category.`,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
    }

    // Use sentiment to adjust priority if not explicitly specified
    const sentimentScore = this.analyzeSentiment(tokens);
    let priority = this.extractPriority(tokens);
    if (priority === 'medium') {
      if (sentimentScore > 0.2) priority = 'high';
      if (sentimentScore < -0.2) priority = 'low';
    }

    // Determine task type
    let type: Task['type'] = 'task';
    if (tokens.includes('event') || tokens.includes('meeting')) type = 'event';
    if (tokens.includes('note') || tokens.includes('document')) type = 'note';

    // Attempt to extract task name from quoted strings or summarize
    const taskNameElse = this.extractTaskName(input) || this.summarizeTaskName(input);

    // Generate smart suggestions for the task name
    if (!taskNameElse || taskNameElse === 'New Task') {
      // Optionally add suggestions or handle accordingly
      suggestions.push("Couldn't extract a meaningful task name. Please provide more details.");
    }

    // Generate smart suggestions:
    // (Optional) Additional logic can be added here for suggestions based on taskNameElse

    const taskElse: Task = {
      id: this.generateUniqueId(),
      content: this.capitalizeTaskName(taskNameElse),
      priority,
      category: this.extractCategory(tokens),
      created: new Date(),
      due: this.extractDate(tokens),
      type,
      status: 'pending'
    };

    return {
      action: 'create',
      task: taskElse,
      message: `Created a new ${taskElse.priority} priority ${taskElse.type} in ${taskElse.category} category.`
    };
  }

  /**
   * Extracts task name from quoted strings or returns undefined
   */
  private extractTaskName(input: string): string | undefined {
    const quotedMatch = input.match(/["“”](.+?)["“”]/);
    if (quotedMatch && quotedMatch[1].trim().length > 0) {
      return quotedMatch[1].trim();
    }
    return undefined;
  }

  /**
   * Enhanced method to summarize long paragraphs into concise task names.
   * This implementation uses sentence splitting and keyword-based ranking to select the most relevant sentence.
   */
  private summarizeTaskName(paragraph: string): string {
    // Split the paragraph into sentences
    const sentences = this.splitIntoSentences(paragraph);

    if (sentences.length === 0) return 'New Task';

    // Action/Task related keywords that often indicate the main task
    const actionKeywords = new Set([
      ...this.verbGroups.creation,
      ...this.verbGroups.planning
    ]);

    // Words to exclude from the task name (expanded stopwords)
    const excludeWords = this.extendedStopwords;

    // Function to extract the main task from a sentence
    const extractMainTask = (sentence: string): string[] => {
      const tokens = this.tokenize(sentence);
      const result: string[] = [];
      let foundAction = false;

      // Look for action keyword and collect subsequent important words
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Skip excluded words
        if (excludeWords.has(token)) continue;

        // If we find an action keyword, start collecting words
        if (actionKeywords.has(token)) {
          foundAction = true;
          result.push(token);
          continue;
        }

        // Collect important nouns following the action
        if (foundAction && result.length < 6) {
          // Add word if it's not in exclude list and not already in result
          if (!excludeWords.has(token) && !result.includes(token)) {
            result.push(token);
          }
        }
      }

      return result;
    };

    // Process each sentence and score them
    const taskCandidates = sentences.map(sentence => {
      const mainTask = extractMainTask(sentence);
      const score = mainTask.length + 
                   (this.keywords.priority.high.some(word => sentence.toLowerCase().includes(word)) ? 2 : 0) +
                   (this.keywords.priority.medium.some(word => sentence.toLowerCase().includes(word)) ? 1 : 0);
      
      return {
        task: mainTask,
        score: score
      };
    });

    // Sort by score and get the best candidate
    taskCandidates.sort((a, b) => b.score - a.score);
    
    // If no good candidate found, try to extract nouns from the first sentence
    if (taskCandidates[0].task.length === 0) {
      const firstSentence = sentences[0];
      const tokens = this.tokenize(firstSentence);
      const nouns = tokens.filter(token => !this.extendedStopwords.has(token)).slice(0, 4);
      return this.capitalizeTaskName(nouns.join(' ')) || 'New Task';
    }

    return this.capitalizeTaskName(taskCandidates[0].task.join(' '));
  }

  /**
   * Capitalizes the first letter of each word in the task name.
   * @param taskName The task name to capitalize.
   * @returns The capitalized task name.
   */
  private capitalizeTaskName(taskName: string): string {
    return taskName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private analyzeSentiment(tokens: string[]): number {
    let score = 0;
    tokens.forEach(token => {
      if (this.sentimentWeights.positive.includes(token)) score += 0.3;
      if (this.sentimentWeights.negative.includes(token)) score -= 0.3;
    });
    return score;
  }

  public generateCanvas(tasks: Task[]): string {
    const boxWidth = 80;
    const canvasLines: string[] = [
      '╭' + '─'.repeat(boxWidth - 2) + '╮',
      '│' + ' ThinkLink Canvas '.padStart((boxWidth + 'ThinkLink Canvas'.length) / 2).padEnd(boxWidth - 2) + '│',
      '├' + '─'.repeat(boxWidth - 2) + '┤'
    ];

    const groupedTasks = this.groupTasksByCategory(tasks);
    
    for (const [category, categoryTasks] of Object.entries(groupedTasks)) {
      // Category Header
      canvasLines.push('│ ' + category.toUpperCase().padEnd(boxWidth - 3) + '│');
      canvasLines.push('│' + '─'.repeat(boxWidth - 2) + '│');

      // Tasks under Category
      categoryTasks.forEach(task => {
        const priority = this.getPrioritySymbol(task.priority);
        const due = task.due ? ` 📅 ${task.due.toLocaleDateString()}` : '';
        // Main task content without ID
        const taskLine = `${priority} ${task.content}${due}`;
        
        // Handle long task lines with word wrapping
        const wrappedLines = this.wrapText(taskLine, boxWidth - 6);
        wrappedLines.forEach(line => {
          canvasLines.push('│  ' + line.padEnd(boxWidth - 6) + ' │');
        });

        // Add ID on the next line, indented and styled differently
        canvasLines.push('│  ' + `└─ ID: ${task.id}`.padEnd(boxWidth - 6) + ' │');
        // Add a separator line after each task
        canvasLines.push('│  ' + '─'.repeat(boxWidth - 8) + ' │');
      });
      
      // Category Separator
      canvasLines.push('├' + '─'.repeat(boxWidth - 2) + '┤');
    }

    // Replace the last separator with the bottom border
    if (canvasLines.length > 0) {
      canvasLines[canvasLines.length - 1] = '╰' + '─'.repeat(boxWidth - 2) + '╯';
    }

    return canvasLines.join('\n');
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxWidth) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

  private groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }

  private getPrioritySymbol(priority: string): string {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  // Helper method to get next occurrence of a weekday
  private getNextWeekday(dayName: string, includeToday: boolean = true): Date {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    if (targetDay === -1) return new Date();

    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;

    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && !includeToday)) {
      daysUntilTarget += 7;
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    return nextDate;
  }

  // Enhanced context extraction
  private extractContext(tokens: string[]): string {
    const text = tokens.join(' ');
    const contexts: string[] = [];

    // Extract location context
    const location = this.keywords.locations.find(loc => text.includes(loc));
    if (location) contexts.push(`Location: ${location}`);

    // Extract relationship context
    const relationship = this.keywords.relationships.find(rel => text.includes(rel));
    if (relationship) contexts.push(`With: ${relationship}`);

    // Extract temporal context
    Object.entries(this.contextPatterns).forEach(([type, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        contexts.push(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${match[0]}`);
      }
    });

    return contexts.join('; ');
  }

  // Generate unique ID for tasks
  private generateUniqueId(): string {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Calendar integration method to schedule tasks
  public scheduleTask(task: Task, tasks: Task[]): void {
    if (task.due) {
      // Check for conflicts
      const conflict = tasks.find(t => 
        t.due?.toDateString() === task.due?.toDateString() && t.category === task.category
      );
      if (conflict) {
        console.log(`Conflict detected with task ID ${conflict.id} on ${task.due.toLocaleDateString()}`);
        // Handle conflict resolution here (e.g., reschedule, prioritize)
      } else {
        console.log(`Task scheduled on ${task.due.toLocaleDateString()}`);
      }
    } else {
      console.log('No due date specified for the task.');
    }
  }

  // Method to visualize dependencies between tasks
  public visualizeDependencies(tasks: Task[]): string {
    const dependencyLines: string[] = ['Dependencies Graph:'];
    tasks.forEach(task => {
      if (task.context?.includes('depends on')) {
        const dependentTaskId = task.context.split(': ')[1];
        dependencyLines.push(`- Task ${task.id} depends on Task ${dependentTaskId}`);
      }
    });
    return dependencyLines.join('\n');
  }

  // Enhanced canvas generation with dependency visualization
  public generateAdvancedCanvas(tasks: Task[]): string {
    const baseCanvas = this.generateCanvas(tasks);
    const dependencies = this.visualizeDependencies(tasks);
    return `${baseCanvas}\n\n${dependencies}`;
  }

  // Save the trained model to localStorage
  private saveModel(): void {
    const serializedModel = {
      priority: Array.from(this.neuralWeights.priority.entries()),
      category: Array.from(this.neuralWeights.category.entries()),
      type: Array.from(this.neuralWeights.type.entries())
    };
    localStorage.setItem(this.modelKey, JSON.stringify(serializedModel));
    console.log('Model saved to localStorage.');
  }

  // Load the trained model from localStorage
  private loadModel(): boolean {
    const serializedModel = localStorage.getItem(this.modelKey);
    if (serializedModel) {
      try {
        const parsedModel = JSON.parse(serializedModel);
        this.neuralWeights.priority = new Map<string, number>(parsedModel.priority);
        this.neuralWeights.category = new Map<string, number>(parsedModel.category);
        this.neuralWeights.type = new Map<string, number>(parsedModel.type);
        console.log('Model loaded from localStorage.');
        return true;
      } catch (error) {
        console.error('Failed to parse the saved model. Reinitializing weights.', error);
        return false;
      }
    }
    console.log('No saved model found. Initializing and training a new model.');
    return false;
  }

  // Method to retrain the model manually
  public retrainModel(epochs?: number): void {
    this.initializeWeights();
    this.trainModelWithDataset(epochs);
    this.saveModel();
    console.log('Model retrained and saved.');
  }

  /**
   * Enhanced Natural Language Understanding
   * Analyzes text to extract structured information about tasks
   */
  public analyzeText(text: string): NLUResult {
    const entities = this.extractEntities(text);
    
    // Extract time information
    const timeEntity = this.extractDateTime(text);
    if (timeEntity) {
      entities.time = timeEntity.toISOString();
    }
    
    // Calculate urgency based on time proximity and keywords
    const urgency = this.calculateUrgency(text);
    
    // Extract main action and topic
    const mainSentence = this.findMainSentence(
      text.split(/[.!?]+/).map(s => this.parseSentence(s))
    );
    
    return {
      mainTopic: mainSentence.topic || '',
      action: mainSentence.action || '',
      entities,
      keywords: this.extractKeywords(text),
      sentiment: this.calculateSentiment(text),
      urgency
    };
  }

  /**
   * Improved sentence parsing with linguistic structure analysis
   */
  private parseSentence(sentence: string): ParsedSentence {
    const tokens = this.tokenize(sentence);
    const verbPhrase = this.findVerbPhrase(tokens);
    const entities = this.extractEntitiesFromSentence(sentence);
    
    return {
      text: sentence,
      score: this.calculateSentenceRelevance(sentence, verbPhrase),
      action: verbPhrase?.verb,
      topic: verbPhrase?.object,
      entities
    };
  }

  /**
   * Enhanced verb phrase extraction
   */
  private findVerbPhrase(tokens: string[]): VerbPhrase | null {
    const verbs = new Set([
      ...this.verbGroups.creation,
      ...this.verbGroups.modification,
      ...this.verbGroups.review,
      ...this.verbGroups.completion,
      ...this.verbGroups.communication,
      ...this.verbGroups.planning
    ]);

    const verbIndex = tokens.findIndex(token => verbs.has(token.toLowerCase()));
    if (verbIndex === -1) return null;

    const verb = tokens[verbIndex];
    const modifiers: string[] = [];
    let object: string | undefined;

    // Look for object and modifiers after the verb
    for (let i = verbIndex + 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (this.extendedStopwords.has(token.toLowerCase())) continue;
      
      if (!object) {
        object = token;
      } else {
        modifiers.push(token);
      }
    }

    return { verb, object, modifiers };
  }

  /**
   * Improved entity extraction
   */
  private extractEntitiesFromSentence(sentence: string): ParsedSentence['entities'] {
    const entities: ParsedSentence['entities'] = {};

    // Extract time expressions
    const timeMatch = sentence.match(this.nlpPatterns.timeExpression);
    if (timeMatch) {
      entities.time = timeMatch[0];
    }

    // Extract location
    const locationMatch = sentence.match(this.nlpPatterns.locationPattern);
    if (locationMatch) {
      entities.location = locationMatch[2];
    }

    // Extract subject/object from common patterns
    const svoMatch = sentence.match(this.nlpPatterns.subjectVerbObject);
    if (svoMatch) {
      entities.subject = svoMatch[1];
      entities.object = svoMatch[3];
    }

    return entities;
  }

  /**
   * Enhanced sentence relevance calculation
   */
  private calculateSentenceRelevance(sentence: string, verbPhrase: VerbPhrase | null): number {
    let score = 0;

    // Score based on verb type
    if (verbPhrase) {
      if (this.verbGroups.creation.includes(verbPhrase.verb)) score += 3;
      if (this.verbGroups.modification.includes(verbPhrase.verb)) score += 2;
      if (this.verbGroups.completion.includes(verbPhrase.verb)) score += 2;
      if (this.verbGroups.planning.includes(verbPhrase.verb)) score += 1;
    }

    // Score based on presence of priority indicators
    if (this.nlpPatterns.priorityPattern.test(sentence)) score += 2;
    
    // Score based on presence of deadline
    if (this.nlpPatterns.deadlinePattern.test(sentence)) score += 2;

    // Score based on position in text (first sentences are often more important)
    if (sentence === this.splitIntoSentences(sentence)[0]) score += 1;

    return score;
  }

  /**
   * Improved keyword extraction
   */
  private extractKeywords(text: string): string[] {
    const tokens = this.tokenize(text);
    const frequencies = new Map<string, number>();
    
    // Calculate term frequency
    tokens.forEach(token => {
      if (this.extendedStopwords.has(token.toLowerCase())) return;
      frequencies.set(token, (frequencies.get(token) || 0) + 1);
    });

    // Sort by frequency and importance
    return Array.from(frequencies.entries())
      .sort((a, b) => {
        const scoreA = a[1] + this.calculateTermImportance(a[0]);
        const scoreB = b[1] + this.calculateTermImportance(b[0]);
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(([term]) => term);
  }

  /**
   * Calculate term importance based on various factors
   */
  private calculateTermImportance(term: string): number {
    let score = 0;
    
    // Check if term is a known important keyword
    if (this.keywords.categories.includes(term)) score += 2;
    if (this.keywords.priority.high.includes(term)) score += 2;
    if (Object.values(this.verbGroups).some(group => group.includes(term))) score += 1;
    
    // Check if term is a proper noun (simplified check)
    if (/^[A-Z][a-z]+$/.test(term)) score += 1;
    
    return score;
  }

  /**
   * Split text into sentences with improved handling of edge cases
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .replace(/([.?!])\s*(?=[A-Z])/g, "$")
      .split("|")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Find the most relevant sentence for task naming
   */
  private findMainSentence(sentences: ParsedSentence[]): ParsedSentence {
    return sentences.reduce((best, current) => 
      current.score > best.score ? current : best
    , sentences[0]);
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string): NLUResult['entities'] {
    const entities: NLUResult['entities'] = {
      people: []
    };

    // Extract location
    const locationMatch = text.match(this.nlpPatterns.locationPattern);
    if (locationMatch) {
      entities.location = locationMatch[2];
    }

    // Extract time
    const timeMatch = text.match(this.nlpPatterns.timeExpression);
    if (timeMatch) {
      entities.time = timeMatch[0];
    }

    // Extract people
    const peopleMatches = text.matchAll(this.nlpPatterns.peoplePattern);
    for (const match of peopleMatches) {
      if (match[2] && !entities.people?.includes(match[2])) {
        entities.people?.push(match[2]);
      }
    }

    // Extract subject/object
    const svoMatch = text.match(this.nlpPatterns.subjectVerbObject);
    if (svoMatch) {
      entities.subject = svoMatch[1];
      entities.object = svoMatch[3];
    }

    return entities;
  }

  /**
   * Calculate sentiment score from text
   */
  private calculateSentiment(text: string): number {
    const tokens = this.tokenize(text);
    let score = 0;
    
    // Count positive and negative words
    tokens.forEach(token => {
      if (this.sentimentWeights.positive.includes(token)) {
        score += 0.3;
      }
      if (this.sentimentWeights.negative.includes(token)) {
        score -= 0.3;
      }
    });

    // Normalize score between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Calculate urgency score from text
   */
  private calculateUrgency(text: string): number {
    let score = 0;
    const lowercaseText = text.toLowerCase();

    // Check for urgent keywords with weights
    const urgentKeywords = [
      { word: 'urgent', weight: 0.5 },
      { word: 'asap', weight: 0.5 },
      { word: 'immediately', weight: 0.4 },
      { word: 'critical', weight: 0.4 },
      { word: 'deadline', weight: 0.3 },
      { word: 'important', weight: 0.3 },
      { word: 'priority', weight: 0.2 }
    ];

    urgentKeywords.forEach(({ word, weight }) => {
      if (lowercaseText.includes(word)) {
        score += weight;
      }
    });

    // Check for time-related urgency
    if (lowercaseText.includes('today')) score += 0.3;
    if (lowercaseText.includes('tomorrow')) score += 0.2;
    if (lowercaseText.includes('this week')) score += 0.1;

    // Normalize score between 0 and 1
    return Math.min(1, score);
  }

  // Method to validate task ID format
  private isValidId(id: string): boolean {
    const idPattern = /^[a-f0-9]{24}$/i; // Example pattern, adjust as needed
    return idPattern.test(id);
  }

  public extractTaskContent(tokens: string[]): string {
    return tokens
      .filter(token => 
        !this.keywords.priority.high.includes(token) &&
        !this.keywords.priority.medium.includes(token) &&
        !this.keywords.priority.low.includes(token) &&
        !this.keywords.categories.includes(token) &&
        !this.keywords.timeIndicators.includes(token) &&
        !this.keywords.actions.includes(token) &&
        !this.keywords.contextual.includes(token) &&
        !this.sentimentWeights.positive.includes(token) &&
        !this.sentimentWeights.negative.includes(token)
      )
      .join(' ');
  }

  // Enhanced time extraction
  private extractDateTime(text: string): Date | undefined {
    const lowerText = text.toLowerCase();
    const now = new Date();

    // Handle "next monday", "this friday", etc.
    const nextWeekdayMatch = lowerText.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    const thisWeekdayMatch = lowerText.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);

    if (nextWeekdayMatch) {
      return this.getNextWeekday(nextWeekdayMatch[1]);
    }

    if (thisWeekdayMatch) {
      const date = this.getNextWeekday(thisWeekdayMatch[1]);
      const today = new Date();
      const targetDay = date.getDay();
      const currentDay = today.getDay();
      if (targetDay === currentDay) {
        return date;
      }
      return this.getNextWeekday(thisWeekdayMatch[1], false); // Get the upcoming one if not the same day
    }

    // Existing relative date handling
    if (this.datePatterns.relative.today.test(lowerText)) {
      return now;
    }
    if (this.datePatterns.relative.tomorrow.test(lowerText)) {
      return new Date(now.setDate(now.getDate() + 1));
    }
    if (this.datePatterns.relative.nextWeek.test(lowerText)) {
      return new Date(now.setDate(now.getDate() + 7));
    }

    // Check for specific time mentions
    const timeMatch = lowerText.match(this.datePatterns.absolute.time);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';

      const date = new Date();
      date.setHours(isPM ? hours + 12 : hours, minutes, 0);
      return date;
    }

    // Check for specific dates
    const dateMatch = lowerText.match(this.datePatterns.absolute.date);
    if (dateMatch) {
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const day = parseInt(dateMatch[1]);
      const month = months[dateMatch[3].toLowerCase() as keyof typeof months];
      const date = new Date();
      date.setMonth(month, day);
      return date;
    }

    return undefined;
  }
}