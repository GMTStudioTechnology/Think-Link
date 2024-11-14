import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkLinkNLP, Task } from './ThinkLink_model';

const ThinkLink: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const nlpModel = useRef(new ThinkLinkNLP());

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      const result = nlpModel.current.processCommand(currentCommand);
      
      // Add command to history
      setCommandHistory(prev => [...prev, `> ${currentCommand}`]);
      if (result.action === 'create' && result.task) {
        setTasks(prev => {
          const updatedTasks = [...prev, result.task] as Task[];
          // Generate and add canvas after updating tasks
          const updatedCanvas = nlpModel.current.generateCanvas(updatedTasks);
          setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
          return updatedTasks;
        });
      }
      
      if (result.action === 'list') {
        const currentCanvas = nlpModel.current.generateCanvas(tasks);
        setCommandHistory(prev => [...prev, result.message, currentCanvas]);
      }

      if (result.action === 'delete') {
        const taskId = currentCommand.split(' ').find(token => token.length === 13);
        if (taskId) {
          setTasks(prev => {
            const updatedTasks = prev.filter(task => task.id !== taskId);
            const updatedCanvas = nlpModel.current.generateCanvas(updatedTasks);
            setCommandHistory(prevHistory => [...prevHistory, result.message, updatedCanvas]);
            return updatedTasks;
          });
        } else {
          setCommandHistory(prev => [...prev, result.message]);
        }
      }
      
      setCurrentCommand('');
      setShowWelcome(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-3rem)] backdrop-blur-xl bg-black/80 rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden flex flex-col"
      >
        {/* Terminal Header */}
        <div className="bg-gray-900/90 px-6 py-3 flex items-center justify-between border-b border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
              />
            </div>
            <div className="text-gray-400 text-sm font-medium tracking-wide">ThinkLink Terminal</div>
          </div>
          <div className="flex space-x-6">
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              className="text-gray-400 transition-colors"
            >−</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              className="text-gray-400 transition-colors"
            >□</motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#fff' }}
              className="text-gray-400 transition-colors"
            >×</motion.button>
          </div>
        </div>

        {/* Terminal Body - Scrollable Area */}
        <div ref={terminalRef} className="flex-1 overflow-auto p-6 font-mono text-sm">
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
                className="text-gray-300 group whitespace-pre-wrap"
              >
                {cmd.startsWith('>') ? (
                  <span className="text-yellow-400">{cmd}</span>
                ) : (
                  <span className="text-gray-300">{cmd}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm p-4">
          <motion.div 
            initial={false}
            animate={{ y: 0 }}
            className="flex items-center group"
          >
            <span className="text-emerald-400">➜</span>
            <span className="text-blue-400"> ~/thinklink</span>
            <span className="text-gray-300"> $</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 ml-2 bg-transparent text-gray-300 outline-none caret-emerald-400 font-mono placeholder-gray-600"
              placeholder="Type your command..."
              autoFocus
              spellCheck={false}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThinkLink;
