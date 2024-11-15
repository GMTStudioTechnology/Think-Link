import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoDark from '../assets/GMTStudio_.png';
import logoLight from '../assets/Gicon.png';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (formData.email === 'GMTStudioTech@user.free.com' && formData.password === 'GMT001A_Free') {
        navigate('/thinklink');
      } else {
        setError('Invalid credentials');
      }
    } else {
      setError('Sign up is not available at this time');
    }
  };

  return (
    <motion.div 
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
        darkMode ? 'bg-black' : 'bg-white'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src={darkMode ? logoDark : logoLight} 
            alt="ThinkLink Logo" 
            className="w-12 h-12"
          />
          <span className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
            ThinkLink
          </span>
        </Link>
      </div>

      <div className={`w-full max-w-md relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-tr from-blue-400 to-purple-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-pink-400 to-red-600 rounded-full blur-3xl opacity-30"></div>

        <motion.div 
          className={`relative backdrop-blur-lg rounded-3xl p-10 shadow-2xl border ${
            darkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white/90 border-gray-200'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? 'Sign in to continue to ThinkLink' : 'Join us to enhance your productivity'}
            </p>
          </div>

          {error && (
            <motion.div 
              className="mb-4 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                       transition-colors duration-300 font-semibold text-lg shadow-md"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-600 font-semibold focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;
