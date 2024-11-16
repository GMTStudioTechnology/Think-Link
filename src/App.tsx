import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Features from './components/Features';
import Pricing from './components/Pricing';
import About from './components/About';
import Signup from './components/Signup';
import Login from './components/Login';
import ThinkLink from './components/ThinkLink';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/thinklink"
            element={
              <PrivateRoute>
                <ThinkLink />
              </PrivateRoute>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
