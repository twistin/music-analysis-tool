import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AnalysisStudio from "./components/AnalysisStudio";
import PracticeStudio from "./components/PracticeStudio";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis/:topicId" element={<AnalysisStudio />} />
        <Route path="/practice" element={<PracticeStudio />} />
      </Routes>
    </BrowserRouter>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
