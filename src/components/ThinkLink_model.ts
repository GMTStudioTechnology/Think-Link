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
    contextual: ['for', 'by', 'at', 'on', 'in', 'with', 'to']
  };

  private sentimentWeights = {
    positive: ['excited', 'happy', 'great', 'good', 'important'],
    negative: ['worried', 'concerned', 'bad', 'difficult', 'hard']
  };

  private tokenize(input: string): string[] {
    return input.toLowerCase()
      .replace(/[.,/#$%^&*;:{}=_`~()\-/]/g, '')
      .split(' ')
      .filter(token => token.length > 0);
  }

  private extractPriority(tokens: string[]): 'high' | 'medium' | 'low' {
    for (const token of tokens) {
      if (this.keywords.priority.high.includes(token)) return 'high';
      if (this.keywords.priority.medium.includes(token)) return 'medium';
      if (this.keywords.priority.low.includes(token)) return 'low';
    }
    return 'medium';
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

  public processCommand(input: string): {
    action: string;
    task?: Task;
    message: string;
  } {
    const tokens = this.tokenize(input);
    const action = tokens.find(token => 
      this.keywords.actions.includes(token)
    ) || 'create';

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
      id: Date.now().toString(),
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
    const boxWidth = 60;
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
}

