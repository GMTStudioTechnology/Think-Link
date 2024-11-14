import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';
import { FiMenu, FiX, FiPlus, FiFilter, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';
import classNames from 'classnames';

interface CommandResult {
  action: 'create' | 'list' | 'delete' | 'update' | 'complete' | string;
  task?: Task;
  message: string;
  suggestions?: string[];
}

// Add new interface for tutorial content
interface TutorialStep {
  title: string;
  description: string;
  example: string;
}

const ThinkLink: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const nlpModel = useRef(new ThinkLinkNLP());
  
  // State for canvas
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  
  // Filter State
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  // Add new state for tutorials
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Add tutorial content
  const tutorials: TutorialStep[] = [
    {
      title: "Creating Tasks",
      description: "Use natural language to create tasks. You can specify priority, category, and due date in a single command.",
      example: "create high priority work task meeting with client tomorrow"
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
    }
  ];
  
  // Memoize filteredTasks to optimize performance and satisfy ESLint
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'all') return true;
      return task.priority === filter;
    });
  }, [tasks, filter]);
  
  // Update canvasContent when filteredTasks change
  useEffect(() => {
    const currentCanvas = nlpModel.current.generateAdvancedCanvas(filteredTasks);
    setCanvasContent(currentCanvas);
    if (filteredTasks.length > 0) {
      setCanvasVisible(true);
    }
  }, [filteredTasks]); // Include filteredTasks in dependencies
  
  // Scroll to bottom when command history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleCommandSubmit = () => {
    if (currentCommand.trim()) {
      const result: CommandResult = nlpModel.current.processCommand(currentCommand);
      
      // Add command to history
      setCommandHistory(prev => [...prev, `> ${currentCommand}`]);
      
      if (result.action === 'create' && result.task) {
        setTasks(prev => {
          const updatedTasks = [...prev, result.task] as Task[];
          // Generate and add advanced canvas after updating tasks
          const updatedCanvas = nlpModel.current.generateAdvancedCanvas(updatedTasks);
          setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
          setCanvasContent(updatedCanvas);
          setCanvasVisible(true);
          return updatedTasks;
        });
        if (result.suggestions && Array.isArray(result.suggestions)) {
          const suggestions = result.suggestions; // Assign to local variable
          setCommandHistory(prev => [...prev, `Suggestions: ${suggestions.join(', ')}`]);
        }
      }
      
      if (result.action === 'list') {
        const currentCanvas = nlpModel.current.generateAdvancedCanvas(tasks);
        setCommandHistory(prev => [...prev, result.message, currentCanvas]);
        setCanvasContent(currentCanvas);
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
              setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
              setCanvasContent(updatedCanvas);
              setCanvasVisible(true);
              return updatedTasks;
            } else {
              // If task doesn't exist, add error message to command history
              setCommandHistory(prev => [...prev, `Error: Task with ID ${taskId} not found`]);
              return prev; // Return unchanged tasks array
            }
          });
        } else {
          setCommandHistory(prev => [...prev, result.message]);
        }
      }

      if (result.action === 'update' && result.task) {
        setTasks(prev => {
          const updatedTasks = prev.map(task => task.id === result.task!.id ? result.task! : task);
          const updatedCanvas = nlpModel.current.generateAdvancedCanvas(updatedTasks);
          setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
          setCanvasContent(updatedCanvas);
          setCanvasVisible(true);
          return updatedTasks;
        });
        if (result.suggestions && Array.isArray(result.suggestions)) {
          const suggestions = result.suggestions; // Assign to local variable
          setCommandHistory(prev => [...prev, `Suggestions: ${suggestions.join(', ')}`]);
        }
      }
      if (result.action === 'complete' && result.task?.id) {
        setTasks(prev => {
          const updatedTasks = prev.map(task => 
            task.id === result.task?.id ? { ...task, status: 'pending' as const } : task
          );
          // Sort tasks to move completed ones to the bottom
          const sortedTasks = [
            ...updatedTasks.filter(task => task.status === 'pending'),
            ...updatedTasks.filter(task => task.status === 'done')
          ];
          return sortedTasks;
        });
      }
      
      // Handle other actions (e.g., schedule) here
      
      setCurrentCommand('');
      setShowWelcome(false);
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
            "absolute bottom-24 left-6 w-96 backdrop-blur-sm rounded-lg shadow-xl p-6 z-50 bg-black border border-white text-white"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold`}>
              Tutorial ({currentTutorialStep + 1}/{tutorials.length})
            </h3>
            <button
              onClick={() => setShowTutorial(false)}
              className={`hover:text-white`}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <h4 className={`font-medium`}>
              {tutorials[currentTutorialStep].title}
            </h4>
            <p className={`text-white`}>
              {tutorials[currentTutorialStep].description}
            </p>
            <div className={classNames(
              "p-3 rounded-md backdrop-blur-sm",
              {
                "bg-black text-goldenHour": true,
                "bg-black text-goldenHour border border-white": true
              }
            )}>
              <code>
                {tutorials[currentTutorialStep].example}
              </code>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => currentTutorialStep > 0 && setCurrentTutorialStep(prev => prev - 1)}
                className={classNames(
                  "px-4 py-2 rounded-md transition-colors",
                  {
                    "bg-black hover:bg-black text-white border hover:border-white": currentTutorialStep > 0,
                    "bg-black hover:bg-black text-white hover:border-white ": currentTutorialStep > 0,
                    "opacity-50 cursor-not-allowed": currentTutorialStep === 0
                  }
                )}
                disabled={currentTutorialStep === 0}
              >
                Previous
              </button>
              <button
                onClick={nextTutorialStep}
                className="px-4 py-2 bg-black text-white rounded-md border hover:border-white transition-colors"
              >
                {currentTutorialStep < tutorials.length - 1 ? 'Next' : 'Got it!'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Update tutorial toggle button position
  const renderTutorialButton = () => (
    <button
      onClick={() => setShowTutorial(true)}
      className={classNames(
        "absolute bottom-24 left-6 text-black bg-white p-3 rounded-full shadow-lg focus:outline-none hover:opacity-80 z-50"
      )}
      title="Show Tutorial"
    >
      <FiMenu size={20} />
    </button>
  );

  return (
    <div className="h-screen w-full p-6 flex transition-colors duration-500 overflow-hidden bg-black text-white">
      <motion.div
        variants={terminalVariants}
        animate={canvasVisible ? 'expanded' : 'collapsed'}
        initial="collapsed"
        className="h-[calc(100vh-3rem)] backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col flex-1 bg-black border border-white"
      >
        {/* Terminal Header */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-white">
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                transition={expandTransition}
                className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
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
            >−</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              transition={expandTransition}
              className="text-white hover:opacity-80"
              title="Maximize"
            >□</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              transition={expandTransition}
              className="text-white hover:opacity-80" 
              title="Close"
            >×</motion.button>
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
                Type 'help' to see available commands
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
            <span className="text-emerald-400">➜</span>
            <span className="ml-1 text-blue-400">~/thinklink</span>
            <span className="ml-1 text-white">$</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 ml-2 bg-transparent outline-none caret-emerald-400 font-mono text-white"
              placeholder="Use Natural language to give commands"
              autoFocus
              spellCheck={false}
            />
            <button 
              onClick={handleCommandSubmit} 
              className="ml-2 text-green-500 hover:opacity-80" 
              title="Submit Command"
            >
              <FiPlus size={18} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Canvas Sidebar */}
      <AnimatePresence mode="wait">
        {canvasVisible && (
          <motion.div
            initial={{ x: 800 }}
            animate={{ x: 0 }}
            exit={{ x: 800, transition: { duration: 0 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[800px] h-full backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-y-auto flex flex-col bg-black border border-white"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">ThinkLink Canvas</h2>
              <button 
                onClick={toggleCanvas} 
                className="text-white hover:opacity-80" 
                title="Close Canvas"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="bg-black p-6 rounded-lg flex-1 overflow-y-auto mb-6">
              <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-300">
                {canvasContent}
              </pre>
            </div>
            {/* Filters and Statistics */}
            <div className="mt-6">
              <h3 className="font-medium mb-2 flex items-center">
                <FiFilter className="mr-2" /> Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full border border-white ${
                    filter === 'all' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('high')}
                  className={`px-3 py-1 rounded-full border border-white flex items-center ${
                    filter === 'high' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <FiCheck className="inline mr-1" /> High Priority
                </button>
                <button 
                  onClick={() => setFilter('medium')}
                  className={`px-3 py-1 rounded-full border border-white flex items-center ${
                    filter === 'medium' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <FiEdit2 className="inline mr-1" /> Medium Priority
                </button>
                <button 
                  onClick={() => setFilter('low')}
                  className={`px-3 py-1 rounded-full border border-white flex items-center ${
                    filter === 'low' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <FiTrash2 className="inline mr-1" /> Low Priority
                </button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-medium mb-2">Training Statistics</h3>
              <div className="flex justify-between mb-2">
                <span>Samples Count:</span>
                <span>{nlpModel.current.getTrainingStats().samplesCount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Average Accuracy:</span>
                <span>
                  {(nlpModel.current.getTrainingStats().averageAccuracy * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            {/* Task Dependencies */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Task Dependencies</h3>
              <div className="bg-black p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-base leading-relaxed text-gray-300">
                  {nlpModel.current.visualizeDependencies(tasks)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={toggleCanvas}
        className="fixed bottom-6 right-6 text-black bg-white p-3 rounded-full shadow-lg focus:outline-none hover:opacity-80 z-50"
        title={canvasVisible ? 'Hide Canvas' : 'Show Canvas'}
      >
        {canvasVisible ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      
      {/* Add tutorial components */}
      {renderTutorial()}
      {!showTutorial && renderTutorialButton()}
    </div>
  );
};

export default ThinkLink;
