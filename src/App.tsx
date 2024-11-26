import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Features from './components/Features';
import Pricing from './components/Pricing';
import About from './components/About';
import Signup from './components/Signup';
import Login from './components/Login';
import ErrorPage from './components/ErrorPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Advanced_ThinkLink from './components/advanced_ThinkLink/Advanced_ThinkLink';
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} errorElement={<ErrorPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/advanced-thinklink" element={<Advanced_ThinkLink />} />
          <Route
            path="/advanced-thinklink"
            element={
              <PrivateRoute>
                <Advanced_ThinkLink />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
