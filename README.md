
# 🎨 Color Extractor

A professional-grade color extraction tool built with React and Vite. Extract accurate color palettes from any image using multiple advanced algorithms.

![Screenshot 2025-01-03 160332](https://github.com/user-attachments/assets/404d58b5-38e8-4cba-b21e-c8b314083bc8)

## ✨ Features

### 🚀 **7 Advanced Algorithms**
- **Vibrant (Enhanced)**: node-vibrant with optimized settings
- **K-Means Clustering**: Machine learning with LAB color space
- **Median-Cut**: Recursive color space splitting
- **Octree Quantization**: Hierarchical color reduction
- **Weighted K-Means**: Spatial-aware clustering
- **Fast Average**: Quick single-color extraction
- **Combined**: All algorithms in parallel for maximum accuracy

### 🎯 **Smart Analysis**
- **Perceptual Color Space**: LAB color space for human-vision accuracy
- **Grayscale Detection**: Proper black & white image handling
- **Color Validation**: Filters noise and invalid colors
- **Multiple Formats**: HEX, RGB, HSL support
- **Export Features**: JSON download with metadata

### 🛠️ **Image Processing**
- **Smart Resizing**: Automatic optimization
- **Blur Filter**: Noise reduction
- **Contrast Enhancement**: Better color distinction
- **Transparency Support**: PNG alpha channel handling

## 🛠️ **Technologies**

- **React 18** + **Vite** + **Tailwind CSS**
- **node-vibrant** + **fast-average-color**
- **Framer Motion** + **React Hot Toast**
- **Custom Algorithms**: K-Means, Median-Cut, Octree, Weighted K-Means

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 **Usage**

1. **Upload Image**: Drag and drop or click to browse
2. **Select Algorithm**: Choose from 7 extraction methods
3. **Configure Settings**: Adjust preprocessing options
4. **Extract Colors**: Get accurate color palettes
5. **Export Results**: Copy colors or download as JSON

### **Algorithm Guide**
- **Combined**: Maximum accuracy (all algorithms)
- **Vibrant**: Artistic images with bold colors
- **K-Means**: Photos with distinct color regions
- **Median-Cut**: Color quantization
- **Octree**: Complex images with many variations
- **Weighted K-Means**: Portraits and centered compositions
- **Fast Average**: Quick single-color extraction

## 🔧 **Technical Features**

- **LAB Color Space**: Perceptual accuracy with Delta E calculations
- **Parallel Processing**: Multiple algorithms run simultaneously
- **Smart Validation**: Filters noise and invalid colors
- **Grayscale Detection**: Proper black & white image handling
- **Memory Optimization**: Efficient processing with cleanup

## 📁 **Project Structure**
```
src/
├── components/ImageColorAnalyzer.jsx
├── index.css
├── main.jsx
└── App.jsx
```

## 📱 **Browser Support**
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

**Built with ❤️ for designers, developers, and color enthusiasts**
