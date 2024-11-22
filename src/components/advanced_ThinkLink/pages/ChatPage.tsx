import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlane, Microphone, Picture, Paperclip } from '@gravity-ui/icons';
import { MazsAI } from '../../MazsAI';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ai = useRef(new MazsAI());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const response = await ai.current.processInput(inputText);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-17rem)] md:h-[calc(100vh-17rem)] sm:h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto mb-4 pr-4 md:pr-4 sm:pr-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2 md:mb-4`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-white rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white/10 p-4 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/10 p-2 md:p-4 rounded-2xl backdrop-blur-lg border border-white/10">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-1.5 md:p-2 text-white/80 hover:text-white transition hidden md:block">
            <Picture className="w-5 h-5" />
          </button>
          <button className="p-1.5 md:p-2 text-white/80 hover:text-white transition hidden md:block">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Chat with Mazs AI v1.5 anatra "
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm md:text-base"
          />
          <button className="p-1.5 md:p-2 text-white/80 hover:text-white transition hidden md:block">
            <Microphone className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            className="p-1.5 md:p-2 bg-transparent rounded-xl text-white/80 hover:text-white transition"
          >
            <PaperPlane className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 