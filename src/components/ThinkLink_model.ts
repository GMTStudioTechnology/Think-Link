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

  // Add context awareness
  private contextPatterns = {
    deadline: /by|before|due|until|deadline/i,
    dependency: /after|following|depends on|blocked by/i,
    recurring: /every|daily|weekly|monthly|yearly/i,
    duration: /for|during|takes|hours|minutes|days/i
  };

  constructor() {
    this.initializeWeights();
    this.trainModelWithDataset();
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

  private extractTaskContent(tokens: string[]): string {
    // Remove known keywords and return the remaining content
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
      const taskId = tokens.find(token => token.length === 13); // Assuming ID length
      if (taskId) {
        return {
          action: 'delete',
          message: `Deleted task with ID ${taskId}`
        };
      }
      return {
        action: 'delete',
        message: 'Please specify the task ID to delete'
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

      const task: Task = {
        id: this.generateUniqueId(),
        content: this.extractTaskContent(tokens),
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

    const task: Task = {
      id: this.generateUniqueId(),
      content: this.extractTaskContent(tokens),
      priority,
      category: this.extractCategory(tokens),
      created: new Date(),
      due: this.extractDate(tokens),
      type,
      status: 'pending'
    };

    return {
      action: 'create',
      task,
      message: `Created new ${task.priority} priority ${task.type} in ${task.category} category`
    };
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
        const taskLine = `${priority} ${task.content}${due}`;
        
        // Handle long task lines with word wrapping
        const wrappedLines = this.wrapText(taskLine, boxWidth - 4);
        wrappedLines.forEach(line => {
          canvasLines.push('│  ' + line.padEnd(boxWidth - 4) + ' │');
        });
      });
      
      // Separator
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
}

