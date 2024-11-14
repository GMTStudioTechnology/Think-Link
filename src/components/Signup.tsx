import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CodeCompare } from '@gravity-ui/icons';

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
        navigate('/ThinkLink');
      } else {
        setError('Invalid credentials');
      }
    } else {
      setError('Sign up is not available at this time');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center space-x-2">
          <CodeCompare className="w-8 h-8 text-blue-500" />
          <span className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ThinkLink
          </span>
        </Link>
      </div>

      <div className={`w-full max-w-md relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

        {/* Main card */}
        <div className={`relative backdrop-blur-xl rounded-3xl p-8 shadow-xl border ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Login' : 'Create Account'}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLogin ? 'Welcome back to ThinkLink' : 'Join ThinkLink to boost your productivity'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200">
              {error}
            </div>
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
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter your email"
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
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Create a password"
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
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 
                       transition-colors duration-300 font-medium text-lg"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
