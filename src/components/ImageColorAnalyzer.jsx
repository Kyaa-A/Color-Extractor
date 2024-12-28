import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import * as Vibrant from "node-vibrant";
import toast from "react-hot-toast";

const ImageColorAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        Vibrant.from(e.target.result)
          .quality(1)
          .maxColorCount(10)
          .getPalette((err, palette) => {
            if (palette) {
              let extractedColors = Object.entries(palette)
                .filter(([_, swatch]) => swatch)
                .sort((a, b) => b[1].population - a[1].population)
                .map(([_, swatch]) => swatch.getHex());

              extractedColors = extractedColors.slice(0, 6);
              while (extractedColors.length < 6) {
                extractedColors.push("#FFFFFF");
              }

              setColorPalette(extractedColors);
            }
          });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard
      .writeText(color)
      .then(() => {
        toast("Color copied to clipboard!", {
          icon: "📋",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className={`image-color-analyzer ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1 className="title">Color Extractor</h1>
      <div className="dark-mode-toggle">
        <button onClick={toggleDarkMode} className="mode-switch">
          <motion.div
            className="switch-track"
            animate={{ backgroundColor: isDarkMode ? "#4B5563" : "#D1D5DB" }}
          >
            <motion.div
              className="switch-thumb"
              animate={{
                x: isDarkMode ? 22 : 2,
                backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
              }}
            >
              <span className="mode-icon">{isDarkMode ? '🌙' : '☀️'}</span>
            </motion.div>
          </motion.div>
        </button>
      </div>
      <motion.div
        className="upload-area"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <label htmlFor="imageUpload" className="upload-label">
          <div className="upload-icon">🎨</div>
          <p>Drop your image here or click to browse</p>
          <p className="file-types">Supports JPG, PNG, SVG</p>
        </label>
      </motion.div>
      {selectedImage && (
        <motion.img
          src={selectedImage}
          alt="Uploaded"
          className="uploaded-image"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {colorPalette.length > 0 && (
        <div className="color-palette">
          {colorPalette.map((color, index) => (
            <motion.div
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => copyToClipboard(color)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            ></motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageColorAnalyzer;