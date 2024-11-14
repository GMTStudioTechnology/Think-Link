import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';
import { FiMenu, FiX, FiPlus, FiSun, FiMoon } from 'react-icons/fi';

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
  
  // State for theme (light/dark)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleCommandSubmit = () => {
    if (currentCommand.trim()) {
      const result = nlpModel.current.processCommand(currentCommand);
      
      // Add command to history
      setCommandHistory(prev => [...prev, `> ${currentCommand}`]);
      
      if (result.action === 'create' && result.task) {
        setTasks(prev => {
          const updatedTasks = [...prev, result.task] as Task[];
          // Generate and add canvas after updating tasks
          const updatedCanvas = nlpModel.current.generateCanvas(updatedTasks);
          setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
          setCanvasContent(updatedCanvas);
          setCanvasVisible(true);
          return updatedTasks;
        });
      }
      
      if (result.action === 'list') {
        const currentCanvas = nlpModel.current.generateCanvas(tasks);
        setCommandHistory(prev => [...prev, result.message, currentCanvas]);
        setCanvasContent(currentCanvas);
        setCanvasVisible(true);
      }

      if (result.action === 'delete') {
        const taskId = currentCommand.split(' ').find(token => token.length === 13);
        if (taskId) {
          setTasks(prev => {
            const updatedTasks = prev.filter(task => task.id !== taskId);
            const updatedCanvas = nlpModel.current.generateCanvas(updatedTasks);
            setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
            setCanvasContent(updatedCanvas);
            setCanvasVisible(true);
            return updatedTasks;
          });
        } else {
          setCommandHistory(prev => [...prev, result.message]);
        }
      }
      
      // Handle other actions (e.g., update, complete) here
      
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
    setIsDarkMode(prev => !prev);
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

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen w-full p-6 flex transition-colors duration-500`}>
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
            <div className="text-gray-400 text-sm font-medium tracking-wide">ThinkLink Terminal</div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-gray-400 hover:text-yellow-400 transition-colors" title="Toggle Theme">
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-gray-400"
              title="Minimize"
            >−</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-gray-400"
              title="Maximize"
            >□</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              transition={expandTransition}
              className="text-gray-400"
              title="Close"
            >×</motion.button>
          </div>
        </div>

        {/* Terminal Body */}
        <div ref={terminalRef} className="flex-1 overflow-auto p-6 font-mono text-sm">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={expandTransition}
                className="text-gray-400 mb-6 leading-relaxed"
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
                ) : (
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cmd}</span>
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
            className={`w-[800px] h-full bg-${isDarkMode ? 'gray-800/90' : 'gray-100/90'} backdrop-blur-xl rounded-2xl shadow-2xl border border-${isDarkMode ? 'gray-700' : 'gray-300'}/50 p-4 overflow-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-${isDarkMode ? 'white' : 'gray-900'} text-lg font-semibold`}>ThinkLink Canvas</h2>
              <button onClick={toggleCanvas} className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} hover:text-${isDarkMode ? 'white' : 'black'}`} title="Close Canvas">
                <FiX size={20} />
              </button>
            </div>
            <div className="bg-gray-700/20 p-6 rounded-lg min-h-[60vh] w-full">
              <pre className={`text-${isDarkMode ? 'gray-300' : 'gray-800'} whitespace-pre-wrap text-base leading-relaxed`}>
                {canvasContent}
              </pre>
            </div>
            {/* Filters and Statistics */}
            <div className="mt-6">
              <h3 className={`text-${isDarkMode ? 'white' : 'gray-900'} font-medium mb-2`}>Filters</h3>
              <div className="flex flex-wrap gap-2">
                <button className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} hover:bg-${isDarkMode ? 'gray-700' : 'gray-200'}`}>
                  All
                </button>
                <button className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-red-500' : 'border-red-400'} hover:bg-${isDarkMode ? 'red-600' : 'red-200'}`}>
                  High Priority
                </button>
                <button className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-yellow-500' : 'border-yellow-400'} hover:bg-${isDarkMode ? 'yellow-600' : 'yellow-200'}`}>
                  Medium Priority
                </button>
                <button className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-green-500' : 'border-green-400'} hover:bg-${isDarkMode ? 'green-600' : 'green-200'}`}>
                  Low Priority
                </button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className={`text-${isDarkMode ? 'white' : 'gray-900'} font-medium mb-2`}>Statistics</h3>
              <div className="flex justify-between">
                <span className={`text-${isDarkMode ? 'gray-400' : 'gray-600'}`}>Total Tasks:</span>
                <span className={`text-${isDarkMode ? 'gray-200' : 'gray-800'}`}>{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-${isDarkMode ? 'gray-400' : 'gray-600'}`}>Completed:</span>
                <span className={`text-${isDarkMode ? 'gray-200' : 'gray-800'}`}>{tasks.filter(task => task.status === 'done').length}</span>
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
    </div>
  );
};

export default ThinkLink;
