import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';
import { MazsAI } from './MazsAI';
import {
  FiMenu,
  FiX,
  FiPlus,
  FiFilter,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiLogOut,
  FiChevronRight,
  FiChevronLeft,
  FiCheckSquare,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiPlay,
  FiPause,
  FiSquare,
  FiDownload,
  FiUpload,
  FiMic,
} from 'react-icons/fi';
import classNames from 'classnames';
import { AuthContext } from '../context/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { enUS } from 'date-fns/locale/en-US';
import { saveAs } from 'file-saver';
import VoiceAssistantModal from './VoiceAssistantModal';
import { initializeTrainingData } from '../data/NLP';

interface CommandResult {
  action: 'create' | 'list' | 'delete' | 'update' | 'complete' | 'chat' | string;
  task?: Task;
  message: string;
  suggestions?: string[];
  aiResponse?: string;
}

// Add new interface for tutorial content
interface TutorialStep {
  title: string;
  description: string;
  example: string;
}

// Add new interfaces
interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
}

// Add new interface for sidebar apps
interface SidebarApp {
  id: string;
  name: string;
  icon: JSX.Element;
  component: () => JSX.Element;
}

// Add new interfaces
interface StoredData {
  tasks: Task[];
  commandHistory: string[];
  pomodoroHistory: PomodoroSession[];
  calendarEvents: CalendarEvent[];
  settings: UserSettings;
}

interface UserSettings {
  pomodoroSettings: PomodoroSettings;
  theme?: 'light' | 'dark';
  // Add other user settings as needed
}

interface PomodoroSession {
  date: Date;
  duration: number;
  type: 'work' | 'shortBreak' | 'longBreak';
}

const ThinkLink: React.FC = () => {
  const { logout } = useContext(AuthContext);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const nlpModel = useRef(new ThinkLinkNLP());
  const aiModel = useRef(new MazsAI());

  // State for canvas
  const [canvasVisible, setCanvasVisible] = useState(false);

  // Filter State
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Add new state for tutorials
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsed Categories State
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Pomodoro State
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(1500); // 25 minutes in seconds
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add new state for enhanced Pomodoro
  const [pomodoroSettings] = useState<PomodoroSettings>({
    workDuration: 1500, // 25 minutes
    shortBreakDuration: 300, // 5 minutes
    longBreakDuration: 900, // 15 minutes
    sessionsBeforeLongBreak: 4
  });
  const [pomodoroSessionCount, setPomodoroSessionCount] = useState(0);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [showPomodoroStats, setShowPomodoroStats] = useState(false);
  const [pomodoroHistory, setPomodoroHistory] = useState<Array<{
    date: Date;
    duration: number;
    type: 'work' | 'shortBreak' | 'longBreak';
  }>>([]);

  // Add calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar localizer setup
  const locales = { 'en-US': enUS };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  // Enhanced Pomodoro functions
  const handlePomodoroComplete = useCallback(() => {
    // Record session in history
    setPomodoroHistory(prev => [...prev, {
      date: new Date(),
      duration: pomodoroSettings.workDuration,
      type: pomodoroMode
    }]);

    // Update session count and determine next mode
    if (pomodoroMode === 'work') {
      const newSessionCount = pomodoroSessionCount + 1;
      setPomodoroSessionCount(newSessionCount);
      
      if (newSessionCount % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setPomodoroMode('longBreak');
        setPomodoroTimeLeft(pomodoroSettings.longBreakDuration);
      } else {
        setPomodoroMode('shortBreak');
        setPomodoroTimeLeft(pomodoroSettings.shortBreakDuration);
      }
    } else {
      setPomodoroMode('work');
      setPomodoroTimeLeft(pomodoroSettings.workDuration);
    }

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(`${pomodoroMode === 'work' ? 'Break' : 'Work'} time!`, {
        body: `Time to ${pomodoroMode === 'work' ? 'take a break' : 'focus'}!`,
        icon: '/path-to-your-icon.png'
      });
    }
  }, [pomodoroMode, pomodoroSessionCount, pomodoroSettings]);

  // Calendar functions
  const handleAddTaskToCalendar = (taskId: string, start: Date, end: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: task.content,
        start,
        end,
        taskId
      };
      setCalendarEvents(prev => [...prev, newEvent]);
    }
  };

  // Render calendar view
  const renderCalendar = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
    >
      <div className="bg-black border border-white rounded-lg p-6 w-full max-w-4xl h-[90vh] md:h-[80vh] overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Task Calendar</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const selectedTask = tasks[0]; // Replace with actual task selection
                if (selectedTask) {
                  handleAddTaskToCalendar(
                    selectedTask.id,
                    new Date(),
                    new Date(Date.now() + 3600000)
                  );
                }
              }}
              className="px-4 py-2 rounded-md bg-white text-black text-sm flex items-center space-x-1"
            >
              <FiPlus size={16} />
              <span>Add Event</span>
            </button>
            <button onClick={() => setShowCalendar(false)} className="text-white hover:text-gray-300">
              <FiX size={24} />
            </button>
          </div>
        </div>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(80vh - 100px)' }}
          className="bg-black text-white border border-gray-700"
        />
      </div>
    </motion.div>
  );

  // Render Pomodoro statistics
  const renderPomodoroStats = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed top-20 right-6 bg-gray-800 p-6 rounded-lg shadow-lg sm:w-80 w-72 z-50"
    >
      <h3 className="text-lg font-semibold mb-4">Pomodoro Statistics</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Total Sessions:</span>
          <span>{pomodoroHistory.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Work Sessions:</span>
          <span>{pomodoroHistory.filter(h => h.type === 'work').length}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Focus Time:</span>
          <span>{Math.round(
            pomodoroHistory.reduce((acc, curr) => 
              curr.type === 'work' ? acc + curr.duration : acc, 0) / 60
          )} minutes</span>
        </div>
      </div>
      <button
        onClick={() => setShowPomodoroStats(false)}
        className="mt-6 text-white underline text-sm flex items-center"
      >
        <FiX size={16} className="mr-1"/> Close
      </button>
    </motion.div>
  );

  // Add tutorial content
  const tutorials: TutorialStep[] = [
    {
      title: "Creating Tasks",
      description: "Use natural language to create tasks. You can specify priority, category, and due date in a single command.",
      example: "create high priority work task meeting with client tomorrow"
    },
    {
      title: "Chat with AI",
      description: "Use '/chat' followed by your message to interact with the AI.",
      example: "/chat Hello, how are you?"
    },
    {
      title: "Task Categories",
      description: "Organize tasks by categories. Available options: work, personal, shopping, health, study, finance, home, family, project, meeting, travel, fitness",
      example: "add shopping task buy groceries"
    },
    {
      title: "Setting Priority",
      description: "Set task priority using natural language. Use words like 'urgent', 'important', 'later', or explicitly state priority level.",
      example: "create urgent task finish report by friday"
    },
    {
      title: "Time Management",
      description: "Specify due dates using natural expressions: today, tomorrow, next week, or specific days of the week.",
      example: "add task gym workout next monday"
    },
    {
      title: "Task Management",
      description: "Manage your tasks using simple commands. Use task IDs for specific actions.",
      example: "complete task <task-id>\ndelete task <task-id>\nshow all tasks"
    },
    {
      title: "Smart Features",
      description: "ThinkLink AI understands context and can suggest better task organization.",
      example: "create meeting with boss about project deadline"
    },
    {
      title: "Task Dependencies",
      description: "Create tasks that depend on others using natural language.",
      example: "add task review report after task <task-id>"
    },
    {
      title: "Quick Commands",
      description: "Use shortcuts for common actions:\n- 'show' or 'list' to view tasks\n- 'done' or 'complete' to mark as finished\n- 'del' or 'remove' to delete",
      example: "show high priority tasks"
    },
  ];
  
  // Memoize filteredTasks to optimize performance and satisfy ESLint
  const filteredTasks = useMemo(() => {
    let tempTasks = tasks.filter(task => {
      if (filter === 'all') return true;
      return task.priority === filter;
    });

    if (searchQuery.trim()) {
      tempTasks = tempTasks.filter(task =>
        task.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.context && task.context.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return tempTasks;
  }, [tasks, filter, searchQuery]);
  
  // Update canvasVisible when filteredTasks change
  useEffect(() => {
    if (filteredTasks.length > 0) {
      setCanvasVisible(true);
    }
  }, [filteredTasks]);
  
  // Scroll to bottom when command history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Typing Animation Function
  const typeText = async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      setCommandHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = text.slice(0, i);
        return newHistory;
      });
      await new Promise(resolve => setTimeout(resolve,0.001)); // Adjust typing speed here (ms per character)
    }
  };

  const handleCommandSubmit = () => {
    const trimmedCommand = currentCommand.trim();

    if (trimmedCommand) {
      // Add command to history
      setCommandHistory(prev => [...prev, `> ${trimmedCommand}`]);

      // Check if the command is a chat command
      if (trimmedCommand.startsWith('/chat')) {
        const chatMessage = trimmedCommand.substring(5).trim(); // Remove '/chat' prefix
        if (chatMessage.length === 0) {
          setCommandHistory(prev => [...prev, "Error: Please provide a message for the chat."]);
        } else {
          const aiResponse = aiModel.current.processInput(chatMessage);
          // Append an empty string as a placeholder for the AI response
          setCommandHistory(prev => [...prev, ""]);
          // Start typing animation for AI response
          typeText(aiResponse);
        }
        setCurrentCommand('');
        setShowWelcome(false);
        return;
      }

      // Otherwise, process as a task command
      const result: CommandResult = nlpModel.current.processCommand(trimmedCommand);
      
      // Get AI response for additional insights or suggestions
      const aiResponse = aiModel.current.processInput(trimmedCommand);
      
      if (['create', 'list', 'delete', 'update', 'complete'].includes(result.action)) {
        // Handle task-related commands
        if (result.action === 'create' && result.task) {
          setTasks(prev => {
            const updatedTasks = [...prev, result.task] as Task[];
            const updatedCanvas = nlpModel.current.generateAdvancedCanvas(updatedTasks);
            
            setCommandHistory(prevHistory => [
              ...prevHistory, 
              result.message, 
              aiResponse, // Add AI commentary
              updatedCanvas
            ]);
            
            setCanvasVisible(true);
            return updatedTasks;
          });
          if (result.suggestions && Array.isArray(result.suggestions)) {
            setCommandHistory(prev => [...prev, `Suggestions: ${result.suggestions?.join(', ')}`]);
          }
        }
        
        if (result.action === 'list') {
          const currentCanvas = nlpModel.current.generateAdvancedCanvas(tasks);
          setCommandHistory(prev => [...prev, result.message, aiResponse, currentCanvas]);
          setCanvasVisible(true);
        }

        if (result.action === 'delete') {
          const taskId = result.task?.id;
          if (taskId) {
            setTasks(prev => {
              // Remove dashes from both the input ID and stored task IDs for comparison
              const normalizedInputId = taskId.replace(/-/g, '');
              const taskExists = prev.find(task => task.id.replace(/-/g, '') === normalizedInputId);
              
              if (taskExists) {
                const updatedTasks = prev.filter(task => task.id.replace(/-/g, '') !== normalizedInputId);
                const updatedCanvas = nlpModel.current.generateAdvancedCanvas(updatedTasks);
                setCommandHistory(prevHistory => [...prevHistory, result.message, aiResponse, updatedCanvas]);
                setCanvasVisible(true);
                return updatedTasks;
              } else {
                // If task doesn't exist, add error message to command history
                setCommandHistory(prev => [...prev, `Error: Task with ID ${taskId} not found`]);
                return prev; // Return unchanged tasks array
              }
            });
          } else {
            setCommandHistory(prev => [...prev, result.message, aiResponse]);
          }
        }

        if (result.action === 'update' && result.task) {
          setTasks(prev => {
            const updatedTasks = prev.map(task => task.id === result.task!.id ? result.task! : task);
            const updatedCanvas = nlpModel.current.generateAdvancedCanvas(updatedTasks);
            setCommandHistory(prevHistory => [...prevHistory, result.message, aiResponse, updatedCanvas]);
            setCanvasVisible(true);
            return updatedTasks;
          });
          if (result.suggestions && Array.isArray(result.suggestions)) {
            setCommandHistory(prev => [...prev, `Suggestions: ${result.suggestions?.join(', ')}`]);
          }
        }

        if (result.action === 'complete' && result.task?.id) {
          setTasks(prev => {
            const updatedTasks = prev.map(task => 
              task.id === result.task?.id ? { ...task, status: 'done' as const } : task
            );
            // Sort tasks to move completed ones to the bottom
            const sortedTasks = [
              ...updatedTasks.filter(task => task.status === 'pending'),
              ...updatedTasks.filter(task => task.status === 'done')
            ];
            return sortedTasks;
          });
          setCommandHistory(prev => [...prev, result.message, aiResponse]);
        }
        
        // Handle other actions (e.g., schedule) here
        
        setCurrentCommand('');
        setShowWelcome(false);
      } else {
        // If not a recognized task action, treat it as a general chat
        const aiResponse = aiModel.current.processInput(trimmedCommand);
        setCommandHistory(prev => [...prev, ""]); // Placeholder for AI response
        typeText(aiResponse);
        setCurrentCommand('');
        setShowWelcome(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    }
  };

  const toggleCanvas = () => {
    setCanvasVisible(prev => !prev);
  };

  // Define separate spring transitions for expanding and collapsing
  const expandTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
    mass: 1
  };

  const collapseTransition = {
    type: 'spring' as const,
    stiffness: 500,
    damping: 40,
    mass: 1
  };

  // Define variants for the main terminal panel
  const terminalVariants = {
    expanded: {
      marginRight: 50,
      transition: expandTransition
    },
    collapsed: {
      marginRight: 0,
      transition: collapseTransition
    }
  };

  // Add tutorial navigation
  const nextTutorialStep = () => {
    if (currentTutorialStep < tutorials.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  // Modify the tutorial component
  const renderTutorial = () => (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={classNames(
            "fixed bottom-24 left-2 md:left-6 w-[calc(100%-1rem)] md:w-96 backdrop-blur-sm rounded-lg shadow-xl p-6 z-50 bg-black border border-white text-white"
          )}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-xl">
              Tutorial ({currentTutorialStep + 1}/{tutorials.length})
            </h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="hover:text-white"
              aria-label="Close Tutorial"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-lg mb-2">
                {tutorials[currentTutorialStep].title}
              </h4>
              <p className="whitespace-pre-line">
                {tutorials[currentTutorialStep].description}
              </p>
            </div>
            <div className="p-4 rounded-md backdrop-blur-sm bg-black text-goldenHour border border-white">
              <code className="whitespace-pre-wrap">
                {tutorials[currentTutorialStep].example}
              </code>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => currentTutorialStep > 0 && setCurrentTutorialStep(prev => prev - 1)}
                className={classNames(
                  "px-4 py-2 rounded-md transition-colors flex items-center space-x-2",
                  {
                    "bg-black text-white border border-white hover:bg-gray-800": currentTutorialStep > 0,
                    "opacity-50 cursor-not-allowed": currentTutorialStep === 0
                  }
                )}
                disabled={currentTutorialStep === 0}
              >
                <FiChevronLeft /> <span>Previous</span>
              </button>
              <button
                onClick={nextTutorialStep}
                className="px-4 py-2 bg-black text-white rounded-md border border-white hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <span>{currentTutorialStep < tutorials.length - 1 ? 'Next' : 'Got it!'}</span>
                {currentTutorialStep < tutorials.length - 1 ? <FiChevronRight /> : null}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Update the tutorial toggle button position
  const renderTutorialButton = () => (
    <button
      onClick={() => setShowTutorial(true)}
      className="absolute bottom-24 left-6 text-black bg-white p-3 rounded-full shadow-lg focus:outline-none hover:opacity-80 z-50 md:hidden flex items-center justify-center"
      title="Show Tutorial"
      aria-label="Show Tutorial"
    >
      <FiMenu size={20} />
    </button>
  );

  // Utility function to group tasks by category
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  // Add these functions near the top of your component, with other state/handlers
  const handleEditTask = (taskId: string) => {
    // For now, we'll just log - you can implement the edit UI later
    console.log('Edit task:', taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    // Implement delete functionality using the existing command processor
    const result = nlpModel.current.processCommand(`delete task ${taskId}`);
    if (result.action === 'delete') {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setCommandHistory(prev => [...prev, result.message]);
    }
  };

  // Toggle category collapse
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Add AI model statistics to the canvas sidebar
  const renderAIStats = () => (
    <div className="mt-6 border-t border-white pt-4">
      <h3 className="font-medium mb-2">AI Assistant Statistics</h3>
      <div className="flex justify-between mb-2">
        <span>Vocabulary Size:</span>
        <span>{aiModel.current.getModelStats().vocabularySize}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Training Examples:</span>
        <span>{aiModel.current.getModelStats().trainingExamples}</span>
      </div>
    </div>
  );

  const handleLogout = () => {
    logout();
  };

  const handlePomodoroAction = (action: string) => {
    if (action === 'start') {
      if (!isPomodoroRunning) {
        setIsPomodoroRunning(true);
        const interval = setInterval(() => {
          setPomodoroTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsPomodoroRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        pomodoroIntervalRef.current = interval;
      }
    } else if (action === 'stop') {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
        pomodoroIntervalRef.current = null;
      }
      setIsPomodoroRunning(false);
      setPomodoroTimeLeft(1500);
    } else if (action === 'pause') {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current);
        pomodoroIntervalRef.current = null;
      }
      setIsPomodoroRunning(false);
    } else if (action === 'resume') {
      if (!isPomodoroRunning) {
        setIsPomodoroRunning(true);
        const interval = setInterval(() => {
          setPomodoroTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsPomodoroRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        pomodoroIntervalRef.current = interval;
      }
    }
  };

  useEffect(() => {
    if (pomodoroTimeLeft === 0 && isPomodoroRunning) {
      handlePomodoroComplete();
    }
  }, [pomodoroTimeLeft, isPomodoroRunning, handlePomodoroComplete]);

  // Use useEffect for initial Pomodoro setup if needed
  useEffect(() => {
    // Any initial Pomodoro setup can go here
  }, []); // Empty dependency array means this runs once on mount

  // Add new state for active app
  const [activeApp, setActiveApp] = useState<string>('tasks');

  // Define sidebar apps
  const sidebarApps: SidebarApp[] = [
    {
      id: 'tasks',
      name: 'Tasks',
      icon: <FiCheckSquare size={20} />,
      component: () => (
        <div className="h-full overflow-y-auto">
          {/* Search Bar */}
          <div className="mb-6 flex items-center bg-gray-800 rounded-md p-3">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 bg-transparent outline-none text-sm text-white flex-1"
              placeholder="Search tasks..."
              aria-label="Search Tasks"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white">
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Filters and Statistics */}
          <div className="mb-8">
            <h3 className="font-medium mb-4 flex items-center">
              <FiFilter className="mr-2" /> Filters
            </h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full border border-white ${
                  filter === 'all' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                } transition-colors`}
              >
                All
              </button>
              {/* ... other filter buttons ... */}
            </div>
          </div>

          {/* Task List */}
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
            <div key={category} className="mb-8">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-medium text-goldenHour capitalize">{category}</h3>
                <button onClick={() => toggleCategory(category)}>
                  {collapsedCategories[category] ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
                </button>
              </div>
              <AnimatePresence>
                {!collapsedCategories[category] && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 px-4"
                  >
                    {categoryTasks.map(task => (
                      <li key={task.id} className="flex items-start space-x-4">
                        <div className="mt-1">
                          {task.priority === 'high' && <FiCheck className="text-red-500" />}
                          {task.priority === 'medium' && <FiEdit2 className="text-yellow-500" />}
                          {task.priority === 'low' && <FiTrash2 className="text-green-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">{task.content}</span>
                            <span className="text-gray-400 text-xs">{task.status === 'done' ? '✅ Completed' : '🕒 Pending'}</span>
                          </div>
                          {task.due && (
                            <div className="text-gray-300 text-sm">
                              📅 Due: {typeof task.due === 'string' 
                                 ? new Date(task.due).toLocaleDateString() 
                                 : task.due instanceof Date 
                                   ? task.due.toLocaleDateString() 
                                   : 'Invalid Date'}
                            </div>
                          )}
                          {task.context && (
                            <div className="text-gray-500 text-xs mt-1">
                              {task.context}
                            </div>
                          )}
                          {/* Dependency Indicator */}
                          {task.context?.includes('depends on') && (
                            <div className="text-blue-400 text-xs mt-1">
                              Depends on Task ID: {task.context.split(': ')[1]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-3">
                          <button
                            onClick={() => handleEditTask(task.id)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit Task"
                            aria-label="Edit Task"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete Task"
                            aria-label="Delete Task"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Training Statistics */}
          <div className="mt-8 px-2">
            <h3 className="font-medium mb-4">Training Statistics</h3>
            <div className="flex justify-between mb-3">
              <span>Samples Count:</span>
              <span>{nlpModel.current.getTrainingStats().samplesCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Accuracy:</span>
              <span>
                {(nlpModel.current.getTrainingStats().averageAccuracy * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Task Dependencies */}
          <div className="mt-8 px-2">
            <h3 className="font-medium mb-4">Task Dependencies</h3>
            <div className="bg-black p-5 rounded-lg">
              {tasks.some(task => task.context?.includes('depends on')) ? (
                <ul className="list-disc list-inside text-gray-300">
                  {tasks
                    .filter(task => task.context?.includes('depends on'))
                    .map(task => (
                      <li key={task.id}>
                        <span className="text-white">{task.content}</span> depends on Task ID{' '}
                        <span className="text-yellow-400">
                          {task.context?.split(': ')[1] || 'Unknown'}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-gray-400">No dependencies found.</div>
              )}
            </div>
          </div>

          {/* AI Assistant Statistics */}
          {renderAIStats()}
        </div>
      )
    },
    {
      id: 'pomodoro',
      name: 'Pomodoro',
      icon: <FiClock size={20} />,
      component: () => (
        <div className="h-full p-6 flex flex-col items-center justify-center">
          <div className="text-6xl font-mono mb-8">
            {Math.floor(pomodoroTimeLeft / 60)
              .toString()
              .padStart(2, '0')}
            :
            {(pomodoroTimeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            {!isPomodoroRunning && pomodoroTimeLeft > 0 && (
              <button 
                onClick={() => handlePomodoroAction('resume')}
                className="w-full px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600 text-white transition-colors"
              >
                Resume
              </button>
            )}
            {isPomodoroRunning ? (
              <button 
                onClick={() => handlePomodoroAction('pause')}
                className="w-full px-6 py-3 bg-yellow-500 rounded-lg hover:bg-yellow-600 text-white transition-colors"
              >
                Pause
              </button>
            ) : (
              <button 
                onClick={() => handlePomodoroAction('start')}
                className="w-full px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors"
              >
                Start
              </button>
            )}
            <button 
              onClick={() => handlePomodoroAction('stop')}
              className="w-full px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 text-white transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <FiCalendar size={20} />,
      component: () => (
        <div className="h-full p-6">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100% - 2rem)' }}
            className="bg-black text-white border border-gray-700"
          />
        </div>
      )
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedData = localStorage.getItem('thinklink-data');
        if (storedData) {
          const parsedData: StoredData = JSON.parse(storedData, (key, value) => {
            // Convert stored date strings back to Date objects
            if (key === 'date' || key === 'start' || key === 'end') {
              return new Date(value);
            }
            return value;
          });

          setTasks(parsedData.tasks || []);
          setCommandHistory(parsedData.commandHistory || []);
          setPomodoroHistory(parsedData.pomodoroHistory || []);
          setCalendarEvents(parsedData.calendarEvents || []);
          // Load other stored data as needed
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToStore: StoredData = {
          tasks,
          commandHistory,
          pomodoroHistory,
          calendarEvents,
          settings: {
            pomodoroSettings,
            // Add other settings
          }
        };
        localStorage.setItem('thinklink-data', JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [tasks, commandHistory, pomodoroHistory, calendarEvents, pomodoroSettings]);

  // Add new functions for history management and data import/export
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear command history? This cannot be undone.')) {
      setCommandHistory([]);
    }
  };

  const exportData = () => {
    try {
      const dataToExport: StoredData = {
        tasks,
        commandHistory,
        pomodoroHistory,
        calendarEvents,
        settings: {
          pomodoroSettings,
          // Add other settings
        }
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      saveAs(blob, `thinklink-backup-${new Date().toISOString().slice(0, 10)}.json`);
    } catch (error) {
      console.error('Error exporting data:', error);
      setCommandHistory(prev => [...prev, 'Error: Failed to export data']);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData: StoredData = JSON.parse(e.target?.result as string, (key, value) => {
          // Convert stored date strings back to Date objects
          if (key === 'date' || key === 'start' || key === 'end') {
            return new Date(value);
          }
          return value;
        });

        // Validate imported data structure
        if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
          throw new Error('Invalid data format');
        }

        // Update state with imported data
        setTasks(importedData.tasks);
        setCommandHistory(importedData.commandHistory || []);
        setPomodoroHistory(importedData.pomodoroHistory || []);
        setCalendarEvents(importedData.calendarEvents || []);
        // Update other state as needed

        setCommandHistory(prev => [...prev, 'Successfully imported data']);
      } catch (error) {
        console.error('Error importing data:', error);
        setCommandHistory(prev => [...prev, 'Error: Failed to import data']);
      }
    };
    reader.readAsText(file);
  };

  // Add new UI elements for data management
  const renderDataManagement = () => (
    <div className="mt-6 border-t border-white pt-4">
      <h3 className="font-medium mb-4">Data Management</h3>
      <div className="space-y-3">
        <button
          onClick={clearHistory}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
        >
          <FiTrash2 size={16} />
          <span>Clear Command History</span>
        </button>
        
        <button
          onClick={exportData}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <FiDownload size={16} />
          <span>Export Data</span>
        </button>
        
        <label className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
          <FiUpload size={16} />
          <span>Import Data</span>
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  // Replace the existing renderSidebar function with this updated version
  const renderSidebar = () => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed md:relative top-0 right-0 w-full md:w-[400px] lg:w-[600px] h-full bg-black border-l border-white flex flex-col"
    >
      {/* Enhanced Sidebar Header */}
      <div className="p-4 border-b border-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {sidebarApps.map(app => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`p-3 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105 ${
                  activeApp === app.id 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                {app.icon}
                <span className="hidden md:inline font-medium">{app.name}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={toggleCanvas}
            className="text-white hover:text-gray-300 transition-transform hover:scale-110"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-gray-800 border border-gray-700 rounded-lg outline-none text-sm text-white transition-all focus:border-white"
            placeholder="Search tasks, categories, or priorities..."
            aria-label="Search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Enhanced App Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeApp}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeApp === 'tasks' && (
              <div className="h-full overflow-y-auto px-4 py-6 space-y-8">
                {/* Enhanced Task Categories */}
                {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div 
                      className="flex justify-between items-center mb-4 px-2 cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      <h3 className="text-xl font-medium text-goldenHour capitalize flex items-center space-x-2">
                        <span>{category}</span>
                        <span className="text-sm text-gray-400">({categoryTasks.length})</span>
                      </h3>
                      <motion.button
                        animate={{ rotate: collapsedCategories[category] ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                        className="opacity-60 group-hover:opacity-100"
                      >
                        <FiChevronDown size={20} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {!collapsedCategories[category] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="space-y-4">
                            {categoryTasks.map(task => (
                              <motion.div
                                key={task.id}
                                layoutId={task.id}
                                className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-all group"
                              >
                                <div className="flex items-start space-x-4">
                                  <div className="mt-1">
                                    {task.priority === 'high' && (
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-red-500"
                                      >
                                        <FiCheck size={20} />
                                      </motion.div>
                                    )}
                                    {/* ... other priority icons ... */}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h4 className="text-white font-medium truncate pr-4">
                                        {task.content}
                                      </h4>
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {task.status === 'done' ? '✅' : '🕒'}
                                      </span>
                                    </div>

                                    {task.due && (
                                      <div className="mt-2 text-sm text-gray-300 flex items-center">
                                        <FiCalendar className="mr-2" size={14} />
                                        {typeof task.due === 'string' 
                                          ? new Date(task.due).toLocaleDateString() 
                                          : task.due instanceof Date 
                                            ? task.due.toLocaleDateString() 
                                            : 'Invalid Date'}
                                      </div>
                                    )}

                                    {task.context && (
                                      <p className="mt-2 text-sm text-gray-500">
                                        {task.context}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      onClick={() => handleEditTask(task.id)}
                                      className="p-1 text-blue-400 hover:text-blue-300"
                                    >
                                      <FiEdit2 size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-red-400 hover:text-red-300"
                                    >
                                      <FiTrash2 size={16} />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Enhanced Statistics Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 p-4 border border-gray-800 rounded-lg"
                >
                  <h3 className="font-medium mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Total Tasks</div>
                      <div className="text-2xl font-medium">{tasks.length}</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Completed</div>
                      <div className="text-2xl font-medium">
                        {tasks.filter(t => t.status === 'done').length}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            
            {activeApp === 'pomodoro' && (
              <div className="h-full p-6 flex flex-col items-center justify-center">
                {/* Enhanced Pomodoro Timer */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full max-w-md"
                >
                  {/* Timer Display */}
                  <motion.div 
                    className="text-center mb-12"
                    animate={{ scale: isPomodoroRunning ? [1, 1.02, 1] : 1 }}
                    transition={{ repeat: isPomodoroRunning ? Infinity : 0, duration: 2 }}
                  >
                    <div className="text-7xl font-mono mb-4 tracking-wider">
                      {Math.floor(pomodoroTimeLeft / 60)
                        .toString()
                        .padStart(2, '0')}
                      <span className="animate-pulse">:</span>
                      {(pomodoroTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-400 text-lg capitalize">
                      {pomodoroMode} Mode
                    </div>
                  </motion.div>

                  {/* Control Buttons */}
                  <div className="space-y-4 w-full max-w-xs mx-auto">
                    {!isPomodoroRunning && pomodoroTimeLeft > 0 && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePomodoroAction('resume')}
                        className="w-full px-6 py-4 bg-green-500 rounded-lg hover:bg-green-600 text-white transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiPlay size={20} />
                        <span>Resume</span>
                      </motion.button>
                    )}
                    {isPomodoroRunning ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePomodoroAction('pause')}
                        className="w-full px-6 py-4 bg-yellow-500 rounded-lg hover:bg-yellow-600 text-white transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiPause size={20} />
                        <span>Pause</span>
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePomodoroAction('start')}
                        className="w-full px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiPlay size={20} />
                        <span>Start</span>
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePomodoroAction('stop')}
                      className="w-full px-6 py-4 bg-red-500 rounded-lg hover:bg-red-600 text-white transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiSquare size={20} />
                      <span>Stop</span>
                    </motion.button>
                  </div>

                  {/* Session Progress */}
                  <div className="mt-12 text-center">
                    <div className="text-gray-400 mb-2">Session Progress</div>
                    <div className="flex items-center justify-center space-x-2">
                      {Array.from({ length: pomodoroSettings.sessionsBeforeLongBreak }).map((_, index) => (
                        <motion.div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index < pomodoroSessionCount ? 'bg-white' : 'bg-gray-700'
                          }`}
                          initial={false}
                          animate={{ scale: index < pomodoroSessionCount ? 1.2 : 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Statistics Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowPomodoroStats(true)}
                    className="mt-8 px-4 py-2 border border-white rounded-lg text-sm hover:bg-white hover:text-black transition-colors mx-auto flex items-center space-x-2"
                  >
                    <FiBarChart2 size={16} />
                    <span>Pomodoro Statistics</span>
                  </motion.button>
                </motion.div>
              </div>
            )}
            
            {activeApp === 'calendar' && (
              <div className="h-full p-6">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 'calc(100% - 2rem)' }}
                  className="bg-black text-white border border-gray-700"
                />
              </div>
            )}

            {/* Add Data Management Section at the bottom */}
            <div className="px-6 pb-6">
              {renderDataManagement()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // Add new state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Add voice command handler with the correct reference to nlpModel
  const handleVoiceCommand = (command: string) => {
    setCurrentCommand(command); // Set the command to the input field
    handleCommandSubmit(); // Call without arguments as it uses currentCommand state
    setIsVoiceModalOpen(false);
  };

  // Generate training data
  const trainingData = useMemo(() => {
    return initializeTrainingData();
  }, []); // Empty dependency array means this will only be computed once

  return (
    <div className="h-screen w-full p-4 md:p-6 flex flex-col md:flex-row transition-colors duration-500 overflow-hidden bg-black text-white">
      {/* Terminal Section */}
      <motion.div
        variants={terminalVariants}
        animate={canvasVisible ? 'expanded' : 'collapsed'}
        initial="collapsed"
        className="flex-1 h-full backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-black border border-white"
      >
        {/* Terminal Header */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-white">
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
                aria-label="Close"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
                aria-label="Minimize"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
                aria-label="Maximize"
              />
            </div>
            <div className="text-white text-sm font-medium tracking-wide">ThinkLink Terminal</div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              transition={expandTransition}
              className="text-white hover:opacity-80"
              title="Minimize"
              aria-label="Minimize"
            >−</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              transition={expandTransition}
              className="text-white hover:opacity-80"
              title="Maximize"
              aria-label="Maximize"
            >□</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              transition={expandTransition}
              className="text-white hover:opacity-80" 
              title="Close"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <FiLogOut size={20} />
            </motion.button>
          </div>
        </div>

        {/* Terminal Body */}
        <div ref={terminalRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={expandTransition}
                className="text-white mb-6 leading-relaxed"
              >
                Welcome to ThinkLink Terminal v1.0.0
                <br />
                Type '/chat your message' to interact with the AI or use other commands to manage tasks.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Command History */}
          <div className="space-y-3">
            {commandHistory.map((cmd, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={expandTransition}
                className="whitespace-pre-wrap"
              >
                {cmd.startsWith('>') ? (
                  <span className="text-yellow-400">{cmd}</span>
                ) : cmd.startsWith('Suggestions:') ? (
                  <span className="text-blue-400 italic">{cmd}</span>
                ) : (
                  <span className="text-white">{cmd}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white p-4">
          <motion.div 
            initial={false}
            animate={{ y: 0 }}
            transition={expandTransition}
            className="flex items-center group"
          >
            <span className="text-emerald-400 hidden md:inline">➜</span>
            <span className="ml-1 text-blue-400 hidden md:inline">~/thinklink</span>
            <span className="ml-1 text-white hidden md:inline">$</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 ml-0 md:ml-2 bg-transparent outline-none caret-emerald-400 font-mono text-white text-sm md:text-base"
              placeholder="Enter Natural Language Command or chat with Mazs AI by using '/chat'"
              autoFocus
              spellCheck={false}
            />
            <button 
              onClick={handleCommandSubmit} 
              className="ml-2 text-green-500 hover:opacity-80" 
              title="Submit Command"
              aria-label="Submit Command"
            >
              <FiPlus size={18} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {canvasVisible && renderSidebar()}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleCanvas}
        className="fixed bottom-6 right-6 text-black bg-white p-4 rounded-full shadow-lg focus:outline-none hover:opacity-80 transition-opacity z-50"
        title={canvasVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        aria-label={canvasVisible ? 'Hide Sidebar' : 'Show Sidebar'}
      >
        {canvasVisible ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Tutorial components */}
      {renderTutorial()}
      {!showTutorial && renderTutorialButton()}

      {/* Add Pomodoro Stats to the UI */}
      {showPomodoroStats && renderPomodoroStats()}

      {/* Add Calendar Modal to the UI */}
      {showCalendar && renderCalendar()}

      {/* Voice Assistant Button */}
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-6 right-20 text-black bg-white p-4 rounded-full shadow-lg focus:outline-none hover:opacity-80 transition-opacity z-50"
        title="Voice Assistant"
        aria-label="Open Voice Assistant"
      >
        <FiMic size={24} />
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onCommand={handleVoiceCommand}
        aiModel={aiModel.current}
        trainingData={trainingData}
      />
    </div>
  );
};

export default ThinkLink;
