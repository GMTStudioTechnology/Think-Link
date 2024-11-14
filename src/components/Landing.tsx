    import React, { useEffect, useState } from 'react';
    import { Link } from 'react-router-dom';
    import { 
      CircleCheck, 
      Gear, 
      Rocket, 
      ChevronRight,
      CodeCompare,
      Clock
    } from '@gravity-ui/icons';
    
    const Landing: React.FC = () => {
      const [darkMode, setDarkMode] = useState(false);
    
      useEffect(() => {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setDarkMode(true);
        }
      }, []);
    
      return (
        <div className={`min-h-screen transition-colors duration-500 ${
          darkMode ? 'bg-black text-white' : 'bg-white text-black '
        } font-sans`}>
          {/* Navigation - Apple-like minimalistic styling */}
          <nav className={`fixed w-full backdrop-blur-md z-50 transition-colors duration-500 ${
            darkMode 
              ? 'bg-gray-900/80' 
              : 'bg-white/80'
          } shadow-lg`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center">
                  <CodeCompare className="w-8 h-8 text-blue-500" />
                  <span className="ml-3 text-2xl font-semibold tracking-tight">ThinkLink</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  {/* Navigation links with subtle hover animations */}
                  <Link to="/features" className="text-md font-medium text-black dark:text-gray-300 hover:text-blue-500 transition-colors duration-300">
                    Features
                  </Link>
                  <Link to="/pricing" className="text-md font-medium text-black dark:text-gray-300 hover:text-blue-500 transition-colors duration-300">
                    Pricing
                  </Link>
                  <Link to="/about" className="text-md font-medium text-black dark:text-gray-300 hover:text-blue-500 transition-colors duration-300">
                    About
                  </Link>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-md font-medium 
                                   hover:bg-blue-700 transition-all duration-300 ease-in-out">
                    Get Started
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-full transition-colors duration-300 focus:outline-none 
                      ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-black'}
                      hover:bg-gray-600 hover:text-yellow-300
                    `}
                    aria-label="Toggle Dark Mode"
                  >
                    {darkMode ? '🌙' : '☀️'}
                  </button>
                </div>
              </div>
            </div>
          </nav>
    
          {/* Hero Section - Sleek and spacious design */}
          <section className="pt-40 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="lg:grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                  {/* Elegant pill badge */}
                  <div className="inline-flex items-center px-6 py-3 rounded-full 
                                bg-gradient-to-r from-blue-500 to-purple-600 
                                backdrop-blur-md shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                    <span className="ml-4 text-lg font-semibold text-white">
                      Boost Your Productivity
                    </span>
                  </div>
                  
                  {/* Refined typography */}
                  <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                    Transform thoughts into
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      {' '}actionable tasks
                    </span>
                  </h1>
                  
                  <p className={`text-xl lg:text-2xl leading-relaxed max-w-2xl ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    Harness the power of AI to convert your natural language into organized, 
                    structured tasks and workflows seamlessly.
                  </p>
    
                  {/* Modern and streamlined buttons */}
                  <div className="flex flex-col sm:flex-row gap-6 pt-8">
                    <Link to="/signup" className="group flex items-center justify-center px-10 py-4 
                                     bg-blue-600 text-white rounded-full text-lg font-medium
                                     hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md">
                      Start Free Trial
                      <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <Link to="/demo" className={`flex items-center justify-center px-10 py-4 
                                      rounded-full text-lg font-medium transition-transform transform hover:scale-105
                                      ${darkMode 
                                        ? 'bg-black text-white hover:bg-gray-600 shadow-md' 
                                        : 'bg-white text-black hover:bg-gray-300 shadow-md'
                                      }`}>
                      Watch Demo
                    </Link>
                  </div>
                </div>
    
                {/* Enhanced preview container with refined glass effect */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-500 
                                rounded-3xl blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className={`relative rounded-3xl p-12 backdrop-blur-lg transition-colors duration-500 
                                border border-gray-200 dark:border-gray-700 ${
                                  darkMode ? 'bg-black' : 'bg-white'
                                } shadow-2xl`}>
                    <div className="aspect-video rounded-xl shadow-xl overflow-hidden">
                      {/* App screenshot placeholder with subtle animation */}
                      <div className={`w-full h-full animate-pulse ${
                        darkMode ? 'bg-black' : 'bg-white'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          {/* Features section - Clean and intuitive cards */}
          <section className={`py-32 transition-colors duration-500 ${
            darkMode ? 'bg-black' : 'bg-white'
          }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">Why Choose ThinkLink?</h2>
                <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                  Experience the future of task management with our cutting-edge features
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-16">
                {features.map((feature, index) => (
                  <div key={index} className={`p-10 rounded-3xl backdrop-blur-md transition-transform duration-300 
                    transform hover:-translate-y-3 hover:shadow-2xl ${
                      darkMode 
                        ? 'bg-black hover:bg-gray-800/70' 
                        : 'bg-white hover:bg-white'
                    }`}>
                      <div className="w-16 h-16 bg-white dark:bg-black rounded-xl flex items-center justify-center mb-8">
                        {feature.icon}
                      </div>
                      <h3 className="text-2.5xl font-semibold mb-4">{feature.title}</h3>
                      <p className={`text-lg ${
                        darkMode ? 'text-white' : 'text-black'
                      }`}>
                        {feature.description}
                      </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
    
          {/* Stats Section - Sleek and informative */}
          <section className={`py-20 ${
            darkMode 
              ? 'bg-gradient-to-r from-black to-black text-white'
              : 'bg-gradient-to-r from-gray-100 to-white text-gray-900'
          }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid md:grid-cols-3 gap-16 text-center">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className={`text-6xl font-extrabold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{stat.value}</div>
                    <div className={`text-xl font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'  
                    }`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
    
          {/* CTA Section - Prominent and inviting */}
          <section className={`py-20 ${
            darkMode 
              ? 'bg-gradient-to-r from-black to-gray-900'
              : 'bg-gradient-to-r from-blue-50 to-white'
          }`}>
            <div className="max-w-5xl mx-auto text-center px-6 lg:px-12">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to transform your productivity?
              </h2>
              <p className={`text-2xl mb-12 ${
                darkMode ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Join thousands of users who have already revolutionized their task management.
              </p>
              <Link to="/signup" className={`inline-block px-12 py-4 rounded-full text-xl font-semibold 
                                 shadow-lg transition-transform transform hover:scale-110 ${
                                   darkMode
                                     ? 'bg-white text-blue-600 hover:bg-blue-50'
                                     : 'bg-blue-600 text-white hover:bg-blue-700'
                                 }`}>
                Get Started Now
              </Link>
            </div>
          </section>
    
          {/* Footer - Minimalistic and organized */}
          <footer className="bg-gray-950 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid md:grid-cols-4 gap-16">
                <div>
                  <div className="flex items-center text-white mb-6">
                    <CodeCompare className="w-6 h-6" />
                    <span className="ml-3 text-lg font-bold">ThinkLink</span>
                  </div>
                  <p className="text-sm max-w-xs">
                    Transforming the way you manage tasks with AI-powered intelligence.
                  </p>
                </div>
                {footerLinks.map((column, index) => (
                  <div key={index}>
                    <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                    <ul className="space-y-3">
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link to={link.href} className="hover:text-white transition-colors duration-300">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} ThinkLink. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      );
    };
    
    // Data
    const features = [
      {
        icon: <CircleCheck className="w-6 h-6 text-blue-600" />,
        title: "AI-Powered Task Processing",
        description: "Transform your thoughts into actionable tasks with our advanced natural language processing engine."
      },
      {
        icon: <Gear className="w-6 h-6 text-blue-600" />,
        title: "Smart Automation",
        description: "Automate task organization and prioritization based on your preferences."
      },
      {
        icon: <Rocket className="w-6 h-6 text-blue-600" />,
        title: "Seamless Integration",
        description: "Connect with your favorite tools and enhance your workflow."
      }
    ];
    
    const stats = [
      { value: "100K+", label: "Active Users", increment: true },
      { value: "2M+", label: "Tasks Created", increment: true },
      { value: "99.9%", label: "Uptime", increment: false }
    ];
    
    const footerLinks = [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Updates", href: "/updates" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" }
        ]
      },
      {
        title: "Resources",
        links: [
          { label: "Documentation", href: "/docs" },
          { label: "Blog", href: "/blog" },
          { label: "Support", href: "/support" }
        ]
      }
    ];
    
    export default Landing;
