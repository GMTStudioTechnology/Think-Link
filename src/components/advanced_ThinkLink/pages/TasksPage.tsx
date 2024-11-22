import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiCalendar,
} from 'react-icons/fi';

// Import the Task type and NLP model
import { Task, ThinkLinkNLP } from '../../ThinkLink_model';

const TasksPage: React.FC = () => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai', content: string }>>([]);
  const [input, setInput] = useState('');
  const nlpModel = useRef(new ThinkLinkNLP());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    // Process input directly with NLP model's public method
    const taskContent = nlpModel.current.extractTaskContent(input.split(' '));

    // Create new task if input seems task-related
    if (taskContent) {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        content: taskContent,
        priority: 'medium',
        category: 'personal',
        created: new Date(),
        status: 'pending'
      };
      setTasks(prev => [...prev, newTask]);

      // Add AI response
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `I've created a new task: "${taskContent}". Would you like to set a priority or due date for this task?`
      }]);
    } else {
      // Generic AI response
      setMessages(prev => [...prev, {
        type: 'ai',
        content: "I understand you want to manage your tasks. Try saying something like 'Create a new task to review project proposal' or 'Show me my high priority tasks'."
      }]);
    }

    setInput('');
    setTimeout(scrollToBottom, 100);
  };

  // Enhanced glassmorphism style to match parent
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6">
      {/* Task Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'from-blue-500 to-indigo-600' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, color: 'from-green-500 to-emerald-600' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'pending').length, color: 'from-amber-500 to-orange-600' },
          { label: 'High Priority', value: tasks.filter(t => t.priority === 'high').length, color: 'from-red-500 to-rose-600' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            style={glassStyle}
            className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${stat.color}`}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-white/70 text-xs md:text-sm">{stat.label}</h3>
            <p className="text-xl md:text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Tasks List */}
        <motion.div
          style={glassStyle}
          className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col h-[calc(100vh-24rem)] md:h-[calc(100vh-24rem)] sm:h-[calc(100vh-32rem)]"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">Tasks Overview</h2>
            <div className="flex space-x-2">
              <button className="p-2 md:px-4 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all">
                <FiCalendar className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="p-2 md:px-4 md:py-2 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white transition-all text-sm md:text-base">
                + New
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-2 md:pr-4 custom-scrollbar">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={glassStyle}
                className="p-3 md:p-4 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <button 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${task.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/30 hover:border-white group-hover:scale-110'
                      }`}
                  >
                    {task.status === 'done' && <FiCheck className="text-white" size={14} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm md:text-base text-white/90 truncate ${task.status === 'done' ? 'line-through text-white/50' : ''}`}>
                      {task.content}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                      <span className={`px-2 py-0.5 md:py-1 rounded-lg text-xs
                        ${task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'}`}>
                        {task.priority}
                      </span>
                      {task.due && (
                        <div className="flex items-center space-x-1 text-white/50 text-xs md:text-sm">
                          <FiCalendar size={12} />
                          <span>{task.due.toLocaleDateString()}</span>
                        </div>
                      )}
                      <span className="text-white/30 text-xs md:text-sm hidden sm:inline">{task.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 md:space-x-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all">
                      <FiEdit2 size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-all">
                      <FiTrash2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Assistant */}
        <motion.div
          style={glassStyle}
          className="w-full md:w-96 flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Task Assistant</h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-indigo-500/80 text-white ml-8'
                      : 'bg-white/5 text-white/90 mr-8'
                  }`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Type to manage tasks..."
                className="flex-1 bg-white/5 text-white rounded-xl px-4 py-3 
                          placeholder-white/30 focus:outline-none focus:ring-2 
                          focus:ring-indigo-500/50 border border-white/10"
              />
              <button
                onClick={handleSubmit}
                className="p-3 bg-indigo-500/80 hover:bg-indigo-500 
                         rounded-xl transition-all text-white"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add this CSS to your global styles


export default TasksPage; 