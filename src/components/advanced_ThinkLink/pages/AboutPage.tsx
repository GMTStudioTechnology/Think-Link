import React from 'react';
import { motion } from 'framer-motion';
import {  Heart, } from '@gravity-ui/icons';
import {ArrowRight} from '@gravity-ui/icons';
import {LogoMacos} from '@gravity-ui/icons';
const AboutPage: React.FC = () => {
  const features = [
    {
      title: 'AI-Powered Assistant',
      description: 'Advanced natural language processing for intelligent conversations and task management',
      icon: '🤖'
    },
    {
      title: 'Smart Task Management',
      description: 'Organize and prioritize your tasks with AI-driven insights',
      icon: '✓'
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with team members across projects',
      icon: '👥'
    },
    {
      title: 'Intelligent Analytics',
      description: 'Gain valuable insights with advanced data visualization',
      icon: '📊'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Welcome to MazsAI & ThinkLink
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          An intelligent workspace where AI meets productivity. Streamline your workflow, 
          enhance collaboration, and unlock new possibilities with our cutting-edge platform.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-white/70">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-8 py-8 border-y border-white/10">
        {[
          { label: 'Active Users', value: '10K+' },
          { label: 'Tasks Completed', value: '1M+' },
          { label: 'Team Satisfaction', value: '99%' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-white/60">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="flex flex-col items-center space-y-6">
        <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white 
                         hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/20">
          Get Started Now
        </button>
        
        {/* Social Links */}
        <div className="flex space-x-4">
          {[
            { icon: <LogoMacos className="w-5 h-5" />, label: 'GitHub' },
            { icon: <Heart className="w-5 h-5" />, label: 'Sponsor' },
          ].map((social) => (
            <button 
              key={social.label}
              className="p-3 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl 
                       transition-all duration-200 flex items-center space-x-2"
            >
              {social.icon}
              <span>{social.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 