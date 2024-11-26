import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
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
  const nlpModel = useRef<ThinkLinkNLP | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize NLP model once on component mount
  useEffect(() => {
    nlpModel.current = new ThinkLinkNLP();
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('thinklink_tasks');
    if (storedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        // Convert due dates from string to Date objects
        parsedTasks.forEach(task => {
          if (task.due) {
            task.due = new Date(task.due);
          }
          if (task.created) {
            task.created = new Date(task.created);
          }
        });
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Failed to parse tasks from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('thinklink_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to format dates as YYYY/MM/DD
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!input.trim() || !nlpModel.current) return;

    // Add user message
    const userMessage = { type: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    // Process input with the initialized NLP model
    const taskContent = nlpModel.current.extractTaskContent(input.split(' '));

    // Create new task if input seems task-related
    if (taskContent) {
      const processResult = nlpModel.current.processCommand(input);
      if (processResult.action === 'create' && processResult.task) {
        const newTask: Task = {
          id: processResult.task.id || Math.random().toString(36).substr(2, 9),
          content: processResult.task.content,
          priority: processResult.task.priority,
          category: processResult.task.category,
          created: processResult.task.created || new Date(),
          due: processResult.task.due ? new Date(processResult.task.due) : undefined,
          status: processResult.task.status || 'pending',
          type: processResult.task.type || 'task',
          context: processResult.task.context
        };
        setTasks(prev => [...prev, newTask]);

        // Add AI response
        let aiResponse = `I've created a new task: "${newTask.content}".`;
        if (processResult.suggestions && processResult.suggestions.length > 0) {
          aiResponse += ` ${processResult.suggestions.join(' ')}`;
        }
        setMessages(prev => [...prev, {
          type: 'ai',
          content: aiResponse
        }]);
      }
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

  // Optimize task filtering by memoizing filtered lists
  const filteredTasks = useMemo(() => ({
    done: tasks.filter(t => t.status === 'done'),
    pending: tasks.filter(t => t.status === 'pending'),
    highPriority: tasks.filter(t => t.priority === 'high')
  }), [tasks]);

  // Memoize taskStats using the filtered lists
  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: filteredTasks.done.length,
    pending: filteredTasks.pending.length,
    highPriority: filteredTasks.highPriority.length,
  }), [tasks.length, filteredTasks]);

  // Memoize the glass style
  const glassStyle = useMemo(() => ({
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }), []);

  // Optimize TaskItem by moving state handlers to useCallback
  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, status: task.status === 'pending' ? 'done' : 'pending' } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const editTask = useCallback((id: string, newContent: string) => {
    if (!nlpModel.current) return;
    const updatedContent = nlpModel.current.extractTaskContent(newContent.split(' '));
    if (updatedContent) {
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === id ? { ...t, content: updatedContent } : t
      ));
    }
  }, []);

  // Optimize TaskItem component
  const TaskItem = useMemo(() => memo(({ task }: { task: Task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={glassStyle}
      className="p-3 md:p-4 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={() => toggleTaskStatus(task.id)}
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
                <span>{formatDate(task.due)}</span>
              </div>
            )}
            <span className="text-white/30 text-xs md:text-sm hidden sm:inline">{task.category}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              const newContent = prompt("Edit task:", task.content);
              if (newContent) {
                editTask(task.id, newContent);
              }
            }}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
          >
            <FiEdit2 size={14} className="md:w-4 md:h-4" />
          </button>
          <button 
            onClick={() => deleteTask(task.id)}
            className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-400 transition-all"
          >
            <FiTrash2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )), [glassStyle, editTask, toggleTaskStatus, deleteTask]);

  // Optimize TasksList with virtualization
  const TasksList = useMemo(() => memo(() => {
    const itemHeight = 80; // Approximate height of each task item
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const itemsToRender = Math.ceil(windowHeight / itemHeight) + 2; // Add buffer

    return (
      <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-2 md:pr-4 custom-scrollbar">
        {tasks.slice(0, itemsToRender).map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    );
  }), [tasks, TaskItem]);

  // Optimize messages list with windowing if needed
  const MessagesList = memo(() => (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
      <AnimatePresence mode="popLayout">
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
  ));

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6">
      {/* Task Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: 'Total Tasks', value: taskStats.total, color: 'from-blue-500 to-indigo-600' },
          { label: 'Completed', value: taskStats.completed, color: 'from-green-500 to-emerald-600' },
          { label: 'In Progress', value: taskStats.pending, color: 'from-amber-500 to-orange-600' },
          { label: 'High Priority', value: taskStats.highPriority, color: 'from-red-500 to-rose-600' },
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
              <button
                onClick={() => {
                  // Prompt user for new task input
                  const newTaskInput = prompt("Enter new task:");
                  if (newTaskInput && nlpModel.current) {
                    const taskContent = nlpModel.current.extractTaskContent(newTaskInput.split(' '));
                    if (taskContent) {
                      const processResult = nlpModel.current.processCommand(newTaskInput);
                      if (processResult.action === 'create' && processResult.task) {
                        const newTask: Task = {
                          id: processResult.task.id || Math.random().toString(36).substr(2, 9),
                          content: processResult.task.content,
                          priority: processResult.task.priority,
                          category: processResult.task.category,
                          created: processResult.task.created || new Date(),
                          due: processResult.task.due ? new Date(processResult.task.due) : undefined,
                          status: processResult.task.status || 'pending',
                          type: processResult.task.type || 'task',
                          context: processResult.task.context
                        };
                        setTasks(prev => [...prev, newTask]);
                      }
                    }
                  }
                }}
                className="p-2 md:px-4 md:py-2 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white transition-all text-sm md:text-base"
              >
                + New
              </button>
            </div>
          </div>

          <TasksList />
        </motion.div>

        {/* Chat Assistant */}
        <motion.div
          style={glassStyle}
          className="w-full md:w-96 flex flex-col"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Task Assistant</h2>
          </div>

          <MessagesList />

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