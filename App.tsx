import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './src/components/Dashboard';
import AnalysisStudio from './src/components/AnalysisStudio';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis/:topicId" element={<AnalysisStudio />} />
          <Route path="/analysis" element={<AnalysisStudio />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
