import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaceRobot,
  Microphone,
  Cloud,
  PencilToSquare,
  Video,
  GearDot,
  Box
} from '@gravity-ui/icons';
import { BackgroundGradient } from './BackgroundGradient';

// Import the pages
import ChatPage from './pages/ChatPage';
import TasksPage from './pages/TasksPage';
import DiscoverPage from './pages/DiscoverPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

// Add a type for the valid page paths
type PagePath = 'chat' | 'tasks' | 'discover' | 'templates' | 'settings' | 'about';

const Advanced_ThinkLink: React.FC = () => {
  // Enhanced glassmorphism effect
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  } as const;

  // State to manage the current active page
  const [activePage, setActivePage] = useState<'chat' | 'tasks' | 'discover' | 'templates' | 'settings' | 'about'>('chat');

  // Function to render the selected page
  const renderPage = () => {
    switch (activePage) {
      case 'chat':
        return <ChatPage />;
      case 'tasks':
        return <TasksPage />;
      case 'discover':
        return <DiscoverPage />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black overflow-hidden">
      {/* Background with lower z-index */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/10 via-purple-500/5 to-transparent"></div>
      <div className="absolute inset-0 z-0">
        <BackgroundGradient />
      </div>
      
      {/* Main Content with higher z-index and isolation */}
      <div className="relative isolate z-10 p-6 md:p-8 lg:p-10">
        {/* Navigation with highest z-index */}
        <nav style={glassStyle} className="relative isolate z-30 mb-8 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-500/20" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  MazsAI & ThinkLink
                </h1>
              </div>
            </div>

            {/* Enhanced Navigation Tabs */}
            <div className=" ml-1hidden lg:flex space-x-2">
              {[
                { label: 'Chat', path: 'chat' },
                { label: 'Tasks', path: 'tasks' },
                { label: 'Discover', path: 'discover' },
                { label: 'Settings', path: 'settings' },
                { label: 'About', path: 'about' },
              ].map(({ label, path }) => (
                <button 
                  key={path}
                  onClick={() => setActivePage(path as PagePath)}
                  className={`
                    px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${activePage === path 
                      ? 'bg-white/10 text-white shadow-lg shadow-white/10' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative flex-1 max-w-md mx-6">
              <input 
                type="text"
                placeholder="Search anything..."
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 
                         focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-200"
              />
            </div>

            {/* Enhanced User Actions */}
            <div className="flex items-center space-x-5">
              <button className="p-3 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200">
                <Microphone className="w-5 h-5" />
              </button>
              <button className="p-3 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200">
                <Cloud className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/20" />
            </div>
          </div>
        </nav>

        {/* Content Layout with medium z-index */}
        <div className="relative z-20 flex gap-8">
          {/* Sidebar */}
          <motion.div
            style={glassStyle}
            className="relative isolate hidden lg:flex flex-col w-72 p-6 space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-white/90 text-lg font-semibold mb-6">Categories</h2>
              {[
                { icon: <FaceRobot />, label: 'Chat with MazsAI', path: 'chat' as PagePath },
                { icon: <PencilToSquare />, label: 'ThinkLink Tasks', path: 'tasks' as PagePath },
                { icon: <Video />, label: 'Discover', path: 'discover' as PagePath },
                { icon: <GearDot />, label: 'Settings', path: 'settings' as PagePath },
                { icon: <Box />, label: 'About', path: 'about' as PagePath },
              ].map(({ icon, label, path }) => (
                <button 
                  key={label}
                  onClick={() => setActivePage(path)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-white/80 hover:bg-white/10 rounded-lg transition ${activePage === path ? 'bg-white/10' : ''}`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            style={glassStyle}
            className="relative isolate flex-1 p-8"
          >
            {renderPage()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Advanced_ThinkLink;
