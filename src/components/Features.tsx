import React from 'react';
import { Link } from 'react-router-dom';
import { Display, Bulb, CirclesIntersection, ArrowRight } from '@gravity-ui/icons'; // Importing Gravity UI Icons

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header - Updated for dark theme */}
      <header className="fixed w-full bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-semibold tracking-tight">ThinkLink</span>
            </Link>
            <nav className="flex space-x-8">
              <Link to="/features" className="text-md font-medium text-white">
                Features
              </Link>
              <Link to="/pricing" className="text-md font-medium text-gray-400 hover:text-white">
                Pricing
              </Link>
              <Link to="/about" className="text-md font-medium text-gray-400 hover:text-white">
                About
              </Link>
              <Link to="/signup" className="bg-white text-black px-6 py-2 rounded-full text-md font-medium hover:bg-gray-200">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Updated for dark theme */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl lg:text-7xl font-bold mb-8 text-white animate-fade-in">
            Features
          </h1>
          <p className="text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Discover how ThinkLink transforms your productivity with intelligent task management.
          </p>
        </div>
      </section>

      {/* Feature Grid - Updated for dark theme */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Feature Cards - Updated design */}
            <div className="group hover:scale-105 transition-transform duration-300 bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:border-gray-700">
              <div className="bg-white rounded-2xl p-6 mb-8 transform group-hover:-rotate-3 transition-transform duration-300">
                <Display className="text-black w-16 h-16" />
                <h3 className="text-2xl font-semibold mb-4 text-black">Intuitive Interface</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A thoughtfully designed interface that adapts to your workflow. Every interaction is crafted for efficiency and delight.
              </p>
            </div>

            {/* Additional Feature Cards follow same pattern */}
            <div className="group hover:scale-105 transition-transform duration-300 bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:border-gray-700">
              <div className="bg-white rounded-2xl p-6 mb-8 transform group-hover:-rotate-3 transition-transform duration-300">
                <Bulb className="text-black w-16 h-16" />
                <h3 className="text-2xl font-semibold mb-4 text-black">AI-Powered Insights</h3>
              </div>

              <p className="text-gray-400 leading-relaxed">
                Advanced machine learning algorithms that understand your patterns and suggest optimal task organization.
              </p>
            </div>

            <div className="group hover:scale-105 transition-transform duration-300 bg-gray-900 rounded-3xl p-8 border border-gray-800 hover:border-gray-700">
              <div className="bg-white rounded-2xl p-6 mb-8 transform group-hover:-rotate-3 transition-transform duration-300">
                <CirclesIntersection className="text-black w-16 h-16" />
                <h3 className="text-2xl font-semibold mb-4 text-black">Seamless Integration</h3>
              </div>

              <p className="text-gray-400 leading-relaxed">
                Connect with your favorite tools effortlessly. Works perfectly with your existing workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section - Updated for dark theme */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-white">
                Beautiful Analytics
                <span className="block text-gray-300">That Drive Results</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed mb-8">
                Visualize your productivity with stunning charts and actionable insights. Understanding your work patterns has never been more beautiful or intuitive.
              </p>
              <Link to="/signup" className="inline-flex items-center px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors">
                Try it free
                <ArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-3xl bg-gray-800 aspect-video w-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Already dark, just needs slight adjustments */}
      <footer className="bg-black text-gray-400 py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-16">
            <div>
              <div className="flex items-center text-white mb-6">
                <span className="text-lg font-bold">ThinkLink</span>
              </div>
              <p className="text-sm max-w-xs">
                Transforming the way you manage tasks with AI-powered intelligence.
              </p>
            </div>
            {/* Footer Links */}
            {/* Repeat similar structure as in Landing.tsx */}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ThinkLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features; 