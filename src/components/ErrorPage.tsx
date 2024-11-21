import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { ArrowLeft } from '@gravity-ui/icons';

const ErrorPage: React.FC = () => {
  interface RouteError {
    status?: number;
    statusText?: string;
    message?: string;
  }

  const error = useRouteError() as RouteError;
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-blue-600">
            {error?.status || '404'}
          </h1>
          <h2 className="text-3xl font-semibold">
            {error?.statusText || 'Page Not Found'}
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error?.message || "Sorry, we couldn't find the page you're looking for."}
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-full text-white bg-blue-600 
                     hover:bg-blue-700 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage; 