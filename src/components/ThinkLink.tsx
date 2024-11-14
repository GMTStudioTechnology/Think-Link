import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';
import { FiMenu, FiX, FiPlus, FiSun, FiMoon, FiFilter, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';

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
  
  // State for theme (light/dark/system)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  
  // Filter State
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  // Add new state for tutorials
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // Add tutorial content
  const tutorials: TutorialStep[] = [
    {
      title: "Creating Tasks",
      description: "Use natural language to create tasks. You can specify priority, category, and due date.",
      example: "create high priority work task meeting with client tomorrow"
    },
    {
      title: "Task Categories",
      description: "Available categories: work, personal, shopping, health, study, finance, home, family, project, meeting, travel, fitness",
      example: "add shopping task buy groceries"
    },
    {
      title: "Setting Priority",
      description: "Use words like 'urgent', 'important', 'later', or explicitly state priority.",
      example: "create urgent task finish report by friday"
    },
    {
      title: "Time Management",
      description: "Use natural date expressions: today, tomorrow, next week, or specific days.",
      example: "add task gym workout next monday"
    },
    {
      title: "Task Management",
      description: "Use commands like 'complete', 'delete', or 'show' to manage tasks.",
      example: "complete task <task-id>"
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark');
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

  // Determine theme classes
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Add tutorial navigation
  const nextTutorialStep = () => {
    if (currentTutorialStep < tutorials.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  // Add tutorial component
  const renderTutorial = () => (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed bottom-20 left-6 right-6 md:left-auto md:right-24 md:w-96 bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-xl p-6 border border-${isDarkMode ? 'gray-700' : 'gray-200'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-${isDarkMode ? 'white' : 'gray-900'} font-semibold`}>
              Tutorial ({currentTutorialStep + 1}/{tutorials.length})
            </h3>
            <button
              onClick={() => setShowTutorial(false)}
              className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} hover:text-${isDarkMode ? 'white' : 'black'}`}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <h4 className={`text-${isDarkMode ? 'white' : 'gray-900'} font-medium`}>
              {tutorials[currentTutorialStep].title}
            </h4>
            <p className={`text-${isDarkMode ? 'gray-300' : 'gray-600'}`}>
              {tutorials[currentTutorialStep].description}
            </p>
            <div className={`bg-${isDarkMode ? 'gray-900' : 'gray-100'} p-3 rounded-md`}>
              <code className={`text-${isDarkMode ? 'green-400' : 'green-600'}`}>
                {tutorials[currentTutorialStep].example}
              </code>
            </div>
            <button
              onClick={nextTutorialStep}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors`}
            >
              {currentTutorialStep < tutorials.length - 1 ? 'Next Tip' : 'Got it!'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add tutorial toggle button
  const renderTutorialButton = () => (
    <button
      onClick={() => setShowTutorial(true)}
      className={`fixed bottom-6 left-6 bg-${isDarkMode ? 'blue-600' : 'blue-500'} text-white p-3 rounded-full shadow-lg hover:bg-${isDarkMode ? 'blue-700' : 'blue-600'} focus:outline-none transition-colors duration-300`}
      title="Show Tutorial"
    >
      <FiMenu size={20} />
    </button>
  );

  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} h-screen w-full p-6 flex transition-colors duration-500 overflow-hidden`}>
      <motion.div
        variants={terminalVariants}
        animate={canvasVisible ? 'expanded' : 'collapsed'}
        initial="collapsed"
        className={`h-[calc(100vh-3rem)] backdrop-blur-xl bg-${isDarkMode ? 'black/80' : 'white/80'} rounded-2xl shadow-2xl border border-${isDarkMode ? 'gray-800' : 'gray-300'}/50 overflow-hidden flex flex-col flex-1`}
      >
        {/* Terminal Header */}
        <div className={`px-6 py-3 flex items-center justify-between border-b border-${isDarkMode ? 'gray-800' : 'gray-300'}/50 backdrop-blur-sm`}>
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
            <button onClick={toggleTheme} className="text-white hover:text-yellow-400 transition-colors" title="Toggle Theme">
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-white"
              title="Minimize"
            >−</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-white"
              title="Maximize"
            >□</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-white"
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
                  <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>{cmd}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className={`border-t border-${isDarkMode ? 'gray-800' : 'gray-300'}/50 bg-${isDarkMode ? 'gray-900/30' : 'gray-200/30'} backdrop-blur-sm p-4`}>
          <motion.div 
            initial={false}
            animate={{ y: 0 }}
            transition={expandTransition}
            className="flex items-center group"
          >
            <span className="text-emerald-400">➜</span>
            <span className={`ml-1 text-${isDarkMode ? 'blue-400' : 'blue-600'}`}>~/thinklink</span>
            <span className={`ml-1 text-${isDarkMode ? 'gray-300' : 'gray-700'}`}>$</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 ml-2 bg-transparent outline-none caret-emerald-400 font-mono placeholder-${isDarkMode ? 'gray-600' : 'gray-500'}`}
              placeholder="Use Natural language to give commands"
              autoFocus
              spellCheck={false}
            />
            <button onClick={handleCommandSubmit} className="ml-2 text-green-500 hover:text-green-400" title="Submit Command">
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
            className={`w-[800px] h-full bg-${isDarkMode ? 'gray-800/90' : 'gray-100/90'} backdrop-blur-xl rounded-2xl shadow-2xl border border-${isDarkMode ? 'gray-700' : 'gray-300'}/50 p-6 overflow-y-auto flex flex-col`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-${isDarkMode ? 'white' : 'gray-900'} text-lg font-semibold`}>ThinkLink Canvas</h2>
              <button onClick={toggleCanvas} className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} hover:text-${isDarkMode ? 'white' : 'black'}`} title="Close Canvas">
                <FiX size={20} />
              </button>
            </div>
            <div className="bg-black p-6 rounded-lg flex-1 overflow-y-auto mb-6">
              <pre className={`text-${isDarkMode ? 'gray-300' : 'gray-800'} whitespace-pre-wrap text-base leading-relaxed`}>
                {canvasContent}
              </pre>
            </div>
            {/* Filters and Statistics */}
            <div className="mt-6">
              <h3 className={`text-${isDarkMode ? 'white' : 'gray-900'} font-medium mb-2 flex items-center`}>
                <FiFilter className="mr-2" /> Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-black' : 'border-white'} 
                  ${filter === 'all' ? `bg-${isDarkMode ? 'gray-700' : 'gray-200'}` : `hover:bg-${isDarkMode ? 'gray-700' : 'gray-200'}`}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('high')}
                  className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-red-500' : 'border-red-400'} 
                  ${filter === 'high' ? `bg-${isDarkMode ? 'red-600' : 'red-200'}` : `hover:bg-${isDarkMode ? 'red-600' : 'red-200'}`}`}
                >
                  <FiCheck className="inline mr-1" /> High Priority
                </button>
                <button 
                  onClick={() => setFilter('medium')}
                  className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-yellow-500' : 'border-yellow-400'} 
                  ${filter === 'medium' ? `bg-${isDarkMode ? 'yellow-600' : 'yellow-200'}` : `hover:bg-${isDarkMode ? 'yellow-600' : 'yellow-200'}`}`}
                >
                  <FiEdit2 className="inline mr-1" /> Medium Priority
                </button>
                <button 
                  onClick={() => setFilter('low')}
                  className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-green-500' : 'border-green-400'} 
                  ${filter === 'low' ? `bg-${isDarkMode ? 'green-600' : 'green-200'}` : `hover:bg-${isDarkMode ? 'green-600' : 'green-200'}`}`}
                >
                  <FiTrash2 className="inline mr-1" /> Low Priority
                </button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className={`text-${isDarkMode ? 'white' : 'black'} font-medium mb-2`}>Training Statistics</h3>
              <div className="flex justify-between mb-2">
                <span className={`text-${isDarkMode ? 'white' : 'black'}`}>Samples Count:</span>
                <span className={`text-${isDarkMode ? 'white' : 'black'}`}>{nlpModel.current.getTrainingStats().samplesCount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className={`text-${isDarkMode ? 'white' : 'black'}`}>Average Accuracy:</span>
                <span className={`text-${isDarkMode ? 'white' : 'black'}`}>
                  {(nlpModel.current.getTrainingStats().averageAccuracy * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            {/* Task Dependencies */}
            <div className="mt-6">
              <h3 className={`text-${isDarkMode ? 'white' : 'black'} font-medium mb-2`}>Task Dependencies</h3>
              <div className="bg-black p-4 rounded-lg">
                <pre className={`text-${isDarkMode ? 'gray-300' : 'gray-800'} whitespace-pre-wrap text-base leading-relaxed`}>
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
        className={`fixed bottom-6 right-6 bg-${isDarkMode ? 'blue-600' : 'blue-500'} text-white p-3 rounded-full shadow-lg hover:bg-${isDarkMode ? 'blue-700' : 'blue-600'} focus:outline-none transition-colors duration-300`}
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
