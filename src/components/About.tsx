import React from 'react';
import { Link } from 'react-router-dom';
import Gicon from '../assets/Gicon.png';
import AboutImage from '../assets/About.png';
const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header - Updated with glassmorphism */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-semibold tracking-tight">ThinkLink</span>
            </Link>
            <nav className="flex space-x-8">
              <Link to="/features" className="text-md font-medium hover:text-blue-500">
                Features
              </Link>
              <Link to="/pricing" className="text-md font-medium hover:text-blue-500">
                Pricing
              </Link>
              <Link to="/about" className="text-md font-medium text-blue-600">
                About
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-full text-md font-medium hover:bg-blue-700">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced with parallax effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white/90"></div>
          {/* Replace with your actual image */}
          <img 
            src="/path-to-office-image.jpg" 
            alt="Office" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            We're building the future of
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              task management
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl mx-auto">
            Empowering teams worldwide with intelligent productivity tools.
          </p>
        </div>
      </section>

      {/* Mission Statement - Redesigned */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="text-blue-600 font-medium tracking-wide">OUR MISSION</span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Making productivity 
                <span className="block">human-centered</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                At ThinkLink, we believe that technology should adapt to humans, not the other way around. Our AI-powered solutions are designed to understand your unique work patterns and help you achieve more with less effort.
              </p>
            </div>
            <div className="md:w-full mt-8 md:mt-0">
              {/* Replace with an appropriate image */}
              <img src={AboutImage} alt="Our Mission" className="w-[800px] h-[500px] object-cover rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Meet the Team</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Our dedicated team of professionals committed to delivering the best task management experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {/* Team Member 1 */}
            <div className="text-center">
              <img src={Gicon} alt="Team Member 1" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
              <h3 className="text-2xl font-semibold">Alston Chang</h3>
              <p className="text-gray-600">CEO & Founder</p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <img src={Gicon} alt="Team Member 2" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
              <h3 className="text-2xl font-semibold">Lucus yeh</h3>
              <p className="text-gray-600">CEO & Founder</p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <img src={Gicon} alt="Team Member 3" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
              <h3 className="text-2xl font-semibold">Willy Lin</h3>
              <p className="text-gray-600">CEO & Founder</p>
            </div>

            {/* Add more team members as needed */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
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

export default About; 