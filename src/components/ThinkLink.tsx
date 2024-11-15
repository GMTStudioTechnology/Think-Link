import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';
import { MazsAI } from './MazsAI';
import { FiMenu, FiX, FiPlus, FiFilter, FiCheck, FiTrash2, FiEdit2, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import classNames from 'classnames';

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

const ThinkLink: React.FC = () => {
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
      await new Promise(resolve => setTimeout(resolve,15)); // Adjust typing speed here (ms per character)
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

  // Update the tutorial toggle button position
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
            <span className="text-emerald-400">➜</span>
            <span className="ml-1 text-blue-400">~/thinklink</span>
            <span className="ml-1 text-white">$</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 ml-2 bg-transparent outline-none caret-emerald-400 font-mono text-white"
              placeholder="use Natural Language to give commands "
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
            className="w-full md:w-[400px] lg:w-[600px] h-full backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-y-auto flex flex-col bg-black border border-white"
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
            {/* Search Bar */}
            <div className="mb-4 flex items-center bg-gray-800 rounded-md p-2">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none text-sm text-white flex-1"
                placeholder="Search tasks..."
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <FiX className="text-gray-400" />
                </button>
              )}
            </div>
            {/* Filters and Statistics */}
            <div className="mb-4">
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
            {/* Task List */}
            <div className="flex-1 overflow-y-auto">
              {Object.keys(groupedTasks).length > 0 ? (
                Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                  <div key={category} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-medium text-goldenHour capitalize">{category}</h3>
                      <button onClick={() => toggleCategory(category)}>
                        {collapsedCategories[category] ? <FiChevronDown /> : <FiChevronUp />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {!collapsedCategories[category] && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
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
                                    📅 Due: {new Date(task.due).toLocaleDateString()}
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
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => handleEditTask(task.id)}
                                  className="text-blue-400 hover:opacity-80"
                                  title="Edit Task"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-400 hover:opacity-80"
                                  title="Delete Task"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No tasks available. Start adding some!</div>
              )}
            </div>
            {/* Training Statistics */}
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
