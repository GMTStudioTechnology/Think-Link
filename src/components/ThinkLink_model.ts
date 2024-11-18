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
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ],
    actions: [
      'create', 'add', 'new', 'delete', 'remove', 'update', 
      'show', 'list', 'complete', 'done', 'finish', 'edit',
      'view', 'schedule', 'organize'
    ],
    contextual: ['for', 'by', 'at', 'on', 'in', 'with', 'to'],
    relationships: [
      'with', 'for', 'team', 'client', 'boss', 'colleague', 'partner',
      'department', 'group', 'stakeholder', 'customer'
    ],
    locations: [
      'office', 'home', 'remote', 'online', 'virtual', 'room', 
      'building', 'site', 'location'
    ],
    urgencyModifiers: [
      'before', 'after', 'deadline', 'due', 'must', 'should', 
      'need to', 'required', 'mandatory'
    ]
  };

  private sentimentWeights = {
    positive: ['excited', 'happy', 'great', 'good', 'important'],
    negative: ['worried', 'concerned', 'bad', 'difficult', 'hard']
  };

  // Neural network weights
  private neuralWeights = {
    priority: new Map<string, number>(),
    category: new Map<string, number>(),
    type: new Map<string, number>()
  };

  private learningRate = 0.1;
  private trainingDataSet: TrainingData[] = trainingData;
  private modelKey = 'ThinkLinkNLPModel';

  // Add context awareness
  private contextPatterns = {
    deadline: /by|before|due|until|deadline/i,
    dependency: /after|following|depends on|blocked by/i,
    recurring: /every|daily|weekly|monthly|yearly/i,
    duration: /for|during|takes|hours|minutes|days/i
  };

  // Add extended stopwords as a class property for better performance
  private extendedStopwords: Set<string> = new Set([
    'the', 'is', 'in', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'for', 
    'to', 'of', 'with', 'please', 'help', 'me', 'add', 'create', 'task', 
    'called', 'new', 'assist', 'support', 'this', 'that', 'these', 'those',
    'i', 'we', 'they', 'he', 'she', 'it', 'you', 'my', 'our', 'their',
    'am', 'are', 'was', 'were', 'be', 'been', 'being'
  ]);

  private nlpPatterns = {
    // Enhanced sentence structures with more variations
    subjectVerbObject: /\b(\w+)\s+(is|are|was|were|have|has|had|will|would|should|could|must)\s+(\w+)\b/i,
    actionObject: /\b(create|update|review|prepare|develop|implement|fix|organize|schedule|plan|complete|finish)\s+([a-z\s]+)\b/i,
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
    creation: ['create', 'develop', 'prepare', 'make', 'build', 'design', 'establish'],
    modification: ['update', 'modify', 'change', 'revise', 'edit', 'adjust'],
    review: ['review', 'check', 'analyze', 'evaluate', 'assess', 'examine'],
    completion: ['complete', 'finish', 'deliver', 'submit', 'send'],
    communication: ['discuss', 'present', 'share', 'explain', 'report'],
    planning: ['plan', 'schedule', 'organize', 'arrange', 'coordinate']
  };

  constructor() {
    if (!this.loadModel()) {
      this.initializeWeights();
      this.trainModelWithDataset(200); // Increased epochs for better training
      this.saveModel();
    }
  }

  private initializeWeights(): void {
    // Initialize weights for all known words
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
    const neuralPriority = prediction.priority > 0.66 ? 'high' : 
                          prediction.priority > 0.33 ? 'medium' : 'low';
    
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
      const predictedPriority = prediction.priority > 0.66 ? 'high' : 
                               prediction.priority > 0.33 ? 'medium' : 'low';
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
      .replace(/[.,/#$%^&*;:{}=_`~()\-/]/g, '')
      .split(' ')
      .filter(token => token.length > 0);
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
    const recurringMatch = text.match(/every (day|week|month|year)/i);
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

    return score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';
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
        message: 'Showing all tasks'
      };
    }

    if (action === 'delete' || action === 'remove') {
      const taskId = tokens[tokens.length - 1]; // Get the last token as ID
      
      if (taskId && taskId.length > 8) { // Basic validation for ID length
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
        message: 'Calendar functionality is under development'
      };
    }

    if (action === 'create') {
      const dateInfo = this.extractSmartDate(tokens);
      const smartPriority = this.calculateSmartPriority(tokens);
      const category = this.extractCategory(tokens);

      // Generate smart suggestions
      if (!dateInfo.due) {
        suggestions.push("Consider adding a due date for better task management");
      }
      if (category === 'personal' && text.includes('work')) {
        suggestions.push("This might be better categorized as a 'work' task");
      }
      if (smartPriority === 'high' && !tokens.some(t => this.keywords.priority.high.includes(t))) {
        suggestions.push("This task seems important. Consider marking it as high priority");
      }

      // Attempt to extract task name from quoted strings
      const quotedMatch = input.match(/["“”](.+?)["“”]/);
      let taskName: string;

      if (quotedMatch && quotedMatch[1].trim().length > 0) {
        taskName = quotedMatch[1].trim();
      } else {
        // Fallback to summarization if no quoted string is found
        taskName = this.summarizeTaskName(input);
      }

      // Generate smart suggestions for the task name
      if (!quotedMatch && taskName === 'New Task') {
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
        message: `Created new ${task.priority} priority ${task.type} in ${task.category} category`,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
    }

    // Use sentiment to adjust priority if not explicitly specified
    const sentimentScore = this.analyzeSentiment(tokens);
    let priority = this.extractPriority(tokens);
    if (priority === 'medium') {
      if (sentimentScore > 0) priority = 'high';
      if (sentimentScore < 0) priority = 'low';
    }

    // Determine task type
    let type: Task['type'] = 'task';
    if (tokens.includes('event') || tokens.includes('meeting')) type = 'event';
    if (tokens.includes('note') || tokens.includes('document')) type = 'note';

    // Attempt to extract task name from quoted strings
    const quotedMatchElse = input.match(/["“”](.+?)["“”]/);
    let taskNameElse: string;

    if (quotedMatchElse && quotedMatchElse[1].trim().length > 0) {
      taskNameElse = quotedMatchElse[1].trim();
    } else {
      // Fallback to summarization if no quoted string is found
      taskNameElse = this.summarizeTaskName(input);
    }

    // Generate smart suggestions for the task name
    if (!quotedMatchElse && taskNameElse === 'New Task') {
      // Optionally add suggestions or handle accordingly
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
      message: `Created new ${taskElse.priority} priority ${taskElse.type} in ${taskElse.category} category`
    };
  }

  /**
   * Enhanced method to summarize long paragraphs into concise task names.
   * This implementation uses sentence splitting and keyword-based ranking to select the most relevant sentence.
   */
  private summarizeTaskName(paragraph: string): string {
    // Split the paragraph into sentences
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

    // Action/Task related keywords that often indicate the main task
    const actionKeywords = new Set([
      'prepare', 'create', 'develop', 'write', 'make', 'build', 'organize',
      'schedule', 'plan', 'implement', 'review', 'update', 'complete'
    ]);

    // Words to exclude from the task name (expanded stopwords)
    const excludeWords = new Set([
      ...this.extendedStopwords,
      'need', 'should', 'must', 'will', 'have', 'has', 'had',
      'would', 'could', 'might', 'may', 'can', 'extremely',
      'urgent', 'important', 'critical', 'asap', 'soon',
      'as', 'because', 'since', 'due', 'to'
    ]);

    // Function to extract the main task from a sentence
    const extractMainTask = (sentence: string): string[] => {
      const tokens = this.tokenize(sentence);
      const result: string[] = [];
      let foundAction = false;

      // Look for action keyword and following words
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
        if (foundAction && result.length < 4) {
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
                   (sentence.toLowerCase().includes('urgent') ? 1 : 0) +
                   (sentence.toLowerCase().includes('important') ? 1 : 0);
      
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
      const nouns = tokens.filter(token => !excludeWords.has(token)).slice(0, 3);
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
      if (this.sentimentWeights.positive.includes(token)) score += 0.2;
      if (this.sentimentWeights.negative.includes(token)) score -= 0.2;
    });
    return score;
  }

  public generateCanvas(tasks: Task[]): string {
    const boxWidth = 80;
    const canvasLines: string[] = [
      '╭' + '─'.repeat(boxWidth - 2) + '╮',
      '│' + ' ThinkLink Canvas '.padStart((boxWidth + 'ThinkLink Canvas'.length) / 2).padEnd(boxWidth - 2) + '',
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
        const wrappedLines = this.wrapText(taskLine, boxWidth - 4);
        wrappedLines.forEach(line => {
          canvasLines.push('│  ' + line.padEnd(boxWidth - 4) + ' │');
        });

        // Add ID on the next line, indented and in a different color/style
        canvasLines.push('│  ' + `└─ ID: ${task.id}`.padEnd(boxWidth - 4) + ' │');
        // Add a separator line after each task
        canvasLines.push('│  ' + '─'.repeat(boxWidth - 6) + ' │');
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
  private getNextWeekday(dayName: string): Date {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const targetDay = days.indexOf(dayName.toLowerCase());
    const todayDay = today.getDay();
    let daysUntilTarget = targetDay - todayDay;
    if (daysUntilTarget <= 0) daysUntilTarget += 7;
    return new Date(today.setDate(today.getDate() + daysUntilTarget));
  }

  // Enhanced context extraction
  private extractContext(tokens: string[]): string {
    const text = tokens.join(' ');
    const contexts: string[] = [];

    // Extract location context
    const location = this.keywords.locations.find(loc => text.includes(loc));
    if (location) contexts.push(`at: ${location}`);

    // Extract relationship context
    const relationship = this.keywords.relationships.find(rel => text.includes(rel));
    if (relationship) contexts.push(`with: ${relationship}`);

    // Extract temporal context
    Object.entries(this.contextPatterns).forEach(([type, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        contexts.push(`${type}: ${match[0]}`);
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
        t.due?.getTime() === task.due?.getTime() && t.category === task.category
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
    const sentences = this.splitIntoSentences(text);
    const parsedSentences = sentences.map(sentence => this.parseSentence(sentence));
    
    // Find the most relevant sentence
    const mainSentence = this.findMainSentence(parsedSentences);
    
    // Extract entities and relationships
    const entities = this.extractEntities(text);
    
    // Calculate overall sentiment and urgency
    const sentiment = this.calculateSentiment(text);
    const urgency = this.calculateUrgency(text);
    
    return {
      mainTopic: mainSentence.topic || '',
      action: mainSentence.action || '',
      entities,
      keywords: this.extractKeywords(text),
      sentiment,
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
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
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
        score += 0.2;
      }
      if (this.sentimentWeights.negative.includes(token)) {
        score -= 0.2;
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

    // Check for urgent keywords
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
}

