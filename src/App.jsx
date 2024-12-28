import React from "react";
import ImageColorAnalyzer from "./components/ImageColorAnalyzer";
import "./index.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <Toaster position="bottom-center" />
      <ImageColorAnalyzer />
    </div>
  );
}

export default App;
