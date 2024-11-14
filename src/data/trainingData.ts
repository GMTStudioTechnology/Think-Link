export interface ExpectedOutput {
  priority: 'high' | 'medium' | 'low';
  category: string;
  type: 'task' | 'event' | 'note';
}

export interface TrainingData {
  input: string;
  expectedOutput: ExpectedOutput;
}

export const trainingData: TrainingData[] = [
  {
    input: "Create an urgent meeting with the marketing team tomorrow",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "event"
    }
  },
  {
    input: "Add a low priority note about grocery shopping",
    expectedOutput: {
      priority: "low",
      category: "shopping",
      type: "note"
    }
  },
  {
    input: "Schedule a doctor's appointment next week",
    expectedOutput: {
      priority: "medium",
      category: "health",
      type: "event"
    }
  },
  {
    input: "Finish the finance report by Friday",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Organize a family dinner for Sunday",
    expectedOutput: {
      priority: "medium",
      category: "family",
      type: "event"
    }
  },
  {
    input: "Create a new project plan for the upcoming launch",
    expectedOutput: {
      priority: "high",
      category: "project",
      type: "task"
    }
  },
  {
    input: "Add a note to buy gym equipment",
    expectedOutput: {
      priority: "low",
      category: "fitness",
      type: "note"
    }
  },
  {
    input: "Set a reminder for the team meeting next Monday",
    expectedOutput: {
      priority: "medium",
      category: "meeting",
      type: "event"
    }
  },
  {
    input: "Update the work calendar with upcoming deadlines",
    expectedOutput: {
      priority: "high",
      category: "calendar",
      type: "task"
    }
  },
  {
    input: "Delete the old notes from last month's review",
    expectedOutput: {
      priority: "low",
      category: "note",
      type: "task"
    },
  },
  {
    input: "Schedule a dentist appointment for next week",
    expectedOutput: {
      priority: "high",
      category: "health",
      type: "task"
    }
  },
  {
    input: "Buy groceries for the week",
    expectedOutput: {
      priority: "medium", 
      category: "shopping",
      type: "task"
    }
  },
  {
    input: "Submit quarterly financial report",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Plan weekend getaway with family",
    expectedOutput: {
      priority: "medium",
      category: "travel",
      type: "event"
    }
  },
  {
    input: "Review project proposal documents",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Call mom on her birthday",
    expectedOutput: {
      priority: "high",
      category: "family",
      type: "event"
    }
  },
  {
    input: "Take vitamins daily",
    expectedOutput: {
      priority: "medium",
      category: "health",
      type: "task"
    }
  },
  {
    input: "Clean garage this weekend",
    expectedOutput: {
      priority: "low",
      category: "home",
      type: "task"
    }
  },
  {
    input: "Study for certification exam",
    expectedOutput: {
      priority: "high",
      category: "study",
      type: "task"
    }
  },
  {
    input: "Pay monthly utility bills",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Attend team building workshop",
    expectedOutput: {
      priority: "medium",
      category: "work",
      type: "event"
    }
  },
  {
    input: "Start daily meditation practice",
    expectedOutput: {
      priority: "low",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Research new project management tools",
    expectedOutput: {
      priority: "medium",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Schedule annual car maintenance",
    expectedOutput: {
      priority: "medium",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Prepare presentation for client meeting",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Order new office supplies",
    expectedOutput: {
      priority: "low",
      category: "shopping",
      type: "task"
    }
  },
  {
    input: "Update personal resume",
    expectedOutput: {
      priority: "medium",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Plan department budget for next quarter",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Schedule weekly team standup",
    expectedOutput: {
      priority: "medium",
      category: "meeting",
      type: "event"
    }
  },
  {
    input: "Buy birthday gift for spouse",
    expectedOutput: {
      priority: "high",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Set up home office equipment",
    expectedOutput: {
      priority: "medium",
      category: "home",
      type: "task"
    }
  },
  {
    input: "Review insurance policies",
    expectedOutput: {
      priority: "medium",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Start new workout routine",
    expectedOutput: {
      priority: "medium",
      category: "fitness",
      type: "task"
    }
  },
  {
    input: "Plan summer vacation",
    expectedOutput: {
      priority: "low",
      category: "travel",
      type: "task"
    }
  },
  {
    input: "Schedule annual health checkup",
    expectedOutput: {
      priority: "high",
      category: "health",
      type: "task"
    }
  },
  {
    input: "Organize digital files and folders",
    expectedOutput: {
      priority: "low",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Research investment opportunities",
    expectedOutput: {
      priority: "medium",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Plan holiday party",
    expectedOutput: {
      priority: "medium",
      category: "event",
      type: "event"
    }
  },
  {
    input: "Schedule car wash",
    expectedOutput: {
      priority: "low",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Update emergency contact information",
    expectedOutput: {
      priority: "high",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Buy new running shoes",
    expectedOutput: {
      priority: "low",
      category: "shopping",
      type: "task"
    }
  },
  {
    input: "Schedule quarterly performance reviews",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Plan weekly meal prep",
    expectedOutput: {
      priority: "medium",
      category: "health",
      type: "task"
    }
  },
  {
    input: "Set up automatic bill payments",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Organize family photo albums",
    expectedOutput: {
      priority: "low",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Schedule home repairs",
    expectedOutput: {
      priority: "medium",
      category: "home",
      type: "task"
    }
  },
  {
    input: "Review and update business plan",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Plan weekly grocery list",
    expectedOutput: {
      priority: "medium",
      category: "shopping",
      type: "task"
    }
  },
  {
    input: "Schedule pet vaccination",
    expectedOutput: {
      priority: "high",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Research new phone plans",
    expectedOutput: {
      priority: "low",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Plan team building activities",
    expectedOutput: {
      priority: "medium",
      category: "work",
      type: "event"
    }
  },
  {
    input: "Schedule dental cleaning",
    expectedOutput: {
      priority: "medium",
      category: "health",
      type: "task"
    }
  },
  {
    input: "Update software licenses",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Plan birthday celebration",
    expectedOutput: {
      priority: "medium",
      category: "personal",
      type: "event"
    }
  },
  {
    input: "Review retirement savings plan",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Schedule carpet cleaning",
    expectedOutput: {
      priority: "low",
      category: "home",
      type: "task"
    }
  },
  {
    input: "Create weekly status report",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  },
  {
    input: "Plan weekend hiking trip",
    expectedOutput: {
      priority: "low",
      category: "fitness",
      type: "event"
    }
  },
  {
    input: "Schedule annual AC maintenance",
    expectedOutput: {
      priority: "medium",
      category: "home",
      type: "task"
    }
  },
  {
    input: "Update password manager",
    expectedOutput: {
      priority: "high",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Research new recipes for dinner",
    expectedOutput: {
      priority: "low",
      category: "personal",
      type: "note"
    }
  },
  {
    input: "Schedule oil change for car",
    expectedOutput: {
      priority: "medium",
      category: "personal",
      type: "task"
    }
  },
  {
    input: "Plan monthly budget review",
    expectedOutput: {
      priority: "high",
      category: "finance",
      type: "task"
    }
  },
  {
    input: "Set up new employee onboarding",
    expectedOutput: {
      priority: "high",
      category: "work",
      type: "task"
    }
  }
]; 