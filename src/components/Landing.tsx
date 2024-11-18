import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CircleCheck, 
  Gear, 
  Rocket, 
  ChevronRight,
  Clock,
  ArrowRight,
  Star,
  Shield,
  Person,
} from '@gravity-ui/icons';
import logoDark from '../assets/GMTStudio_.png';
import logoLight from '../assets/Gicon.png';
import ThinkLink from '../assets/ThinkLink_1.png';

const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced dark theme colors
  const darkThemeColors = {
    background: 'bg-black',
    text: 'text-white',
    accent: 'bg-blue-600',
    card: 'bg-zinc-900',
    border: 'border-zinc-800',
    hover: 'hover:bg-zinc-800'
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${
      darkMode ? darkThemeColors.background : 'bg-white'
    } font-sans`}>
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 
                   z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className={`fixed inset-0 bg-black z-50 transition-opacity duration-500 
                      flex items-center justify-center ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-500" />
          <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 
                         border-2 border-purple-500 opacity-50" />
        </div>
      </div>

      <nav className={`fixed w-full backdrop-blur-xl z-40 transition-all duration-700 
        ${darkMode ? 'bg-black/90 border-b border-zinc-800' : 'bg-white/90'}
        ${scrollProgress > 10 ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img 
                src={darkMode ? logoDark : logoLight}
                alt="ThinkLink Logo" 
                className="w-12 h-12" 
              />
              <span className="ml-3 text-2xl font-semibold tracking-tight">ThinkLink</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className={`text-md font-medium hover:text-blue-500 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Features
              </Link>
              <Link to="/pricing" className={`text-md font-medium hover:text-blue-500 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Pricing
              </Link>
              <Link to="/about" className={`text-md font-medium hover:text-blue-500 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                About
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-full text-md font-medium 
                                           hover:bg-blue-700 transition-all duration-300 ease-in-out">
                Get Started
              </Link>
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

      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="animate-float inline-flex items-center px-6 py-3 rounded-full 
                            bg-gradient-to-r from-blue-500 to-purple-600 
                            backdrop-blur-md shadow-lg transition-transform transform hover:scale-105">
                <Clock className="w-6 h-6 text-white" />
                <span className="ml-4 text-lg font-semibold text-white">
                  Boost Your Productivity
                </span>
              </div>
              
              <h1 className={`animate-fade-in text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                Transform thoughts into
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {' '}actionable tasks
                </span>
              </h1>
              
              <p className={`text-xl lg:text-2xl leading-relaxed max-w-2xl ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                We (GMTStudio) are developing a new AI tools, by using Mazs AI v1.5.0 anatra  and ThinkLink AI v1.0.0 Model.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Link to="/signup" className="group flex items-center justify-center px-10 py-4 
                                 bg-blue-600 text-white rounded-full text-lg font-medium
                                 hover:bg-blue-700 transition-all duration-300 
                                 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105">
                  Start Free Trial
                  <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link to="/demo" className={`flex items-center justify-center px-10 py-4 
                                  rounded-full text-lg font-medium transition-transform transform hover:scale-105
                                  ${darkMode 
                                    ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-md' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md'
                                  }`}>
                  Watch Demo
                </Link>
              </div>
            </div>

            <div className="relative group mt-12 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-500 
                            rounded-3xl blur-3xl opacity-30 group-hover:opacity-40 
                            transition-all duration-700 animate-pulse"></div>
              <div className={`relative rounded-3xl p-12 backdrop-blur-lg transition-colors duration-700 
                            border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                            ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
                <div className="aspect-w-16 aspect-h-9 rounded-xl shadow-xl overflow-hidden">
                  <img
                    src={ThinkLink}
                    alt="ThinkLink App Screenshot"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply 
                         filter blur-xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply 
                         filter blur-xl animate-blob animation-delay-2000" />
        </div>
      </section>

      <div className="absolute top-40 right-10 animate-float-slow">
        <div className="bg-blue-500/10 backdrop-blur-lg rounded-full p-3">
          <Star className="w-6 h-6 text-blue-500" />
        </div>
      </div>
      <div className="absolute top-60 left-10 animate-float-delayed">
        <div className="bg-purple-500/10 backdrop-blur-lg rounded-full p-3">
          <Shield className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      <section className={`py-32 transition-colors duration-700 ${
        darkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-black'
            }`}>Why Choose ThinkLink?</h2>
            <p className={`text-xl ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } max-w-3xl mx-auto`}>
              Experience the future of task management with our cutting-edge features
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            {features.map((feature, index) => (
              <div key={index} className={`group p-10 rounded-3xl backdrop-blur-md 
                transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl 
                relative overflow-hidden ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50'
                }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-600 bg-opacity-10 rounded-xl flex items-center justify-center mb-8">
                    {feature.icon}
                  </div>
                  <h3 className={`text-3xl font-semibold mb-4 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>{feature.title}</h3>
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-500 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-500">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-20 ${
        darkMode 
          ? 'bg-gray-900 text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className={`text-6xl font-extrabold mb-4 ${
                  darkMode ? 'text-white' : 'text-black'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-xl font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-24 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-black'
            }`}>Trusted by Industry Leaders</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
              {companies.map((company, index) => (
                <div key={index} className="flex items-center">
                  <Person className="w-6 h-6 mr-2" />
                  <span className={`text-xl font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {company}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`py-20 ${
        darkMode 
          ? 'bg-gray-900'
          : 'bg-blue-50'
      }`}>
        <div className="max-w-5xl mx-auto text-center px-6 lg:px-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                          blur-3xl opacity-30 rounded-full" />
            <div className="relative">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                Ready to transform your productivity?
              </h2>
              <p className={`text-2xl mb-12 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Join thousands of users who have already revolutionized their task management.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                <Link to="/signup" className={`inline-block px-12 py-4 rounded-full text-xl font-semibold 
                                           shadow-lg transition-transform transform hover:scale-110 ${
                                             darkMode
                                               ? 'bg-white text-blue-600 hover:bg-blue-100'
                                               : 'bg-blue-600 text-white hover:bg-blue-700'
                                           }`}>
                  Get Started Now
                </Link>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    ))}
                  </div>
                  <span className={`text-sm ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    Join <span className="font-bold text-blue-600">2,000+</span> other teams
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-16">
            <div>
              <div className="flex items-center text-white mb-6">
                <img 
                  src={darkMode ? logoDark : logoLight} 
                  alt="ThinkLink Logo" 
                  className="w-10 h-10"
                />
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
  { value: "100K+", label: "Active Users" },
  { value: "2M+", label: "Tasks Created" },
  { value: "99.9%", label: "Uptime" }
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

const companies = [
  "TechCorp",
  "InnovateLabs",
  "FutureWorks",
  "NextGen Solutions"
];

export default Landing;
