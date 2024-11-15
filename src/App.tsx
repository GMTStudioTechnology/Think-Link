import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Features from './components/Features';
import Pricing from './components/Pricing';
import About from './components/About';
import Signup from './components/Signup';
import ThinkLink from './components/ThinkLink';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/thinklink" element={<ThinkLink />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
