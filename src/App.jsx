import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ImageColorAnalyzer from "./components/ImageColorAnalyzer";
import "./index.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="bottom-center" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/extract" element={<ImageColorAnalyzer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
