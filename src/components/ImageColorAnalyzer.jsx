import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import * as Vibrant from "node-vibrant";
import { FastAverageColor } from "fast-average-color";
import toast from "react-hot-toast";

const ImageColorAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [extractionMethod, setExtractionMethod] = useState('vibrant');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [colorFormat, setColorFormat] = useState('hex');
  const [showHexCodes, setShowHexCodes] = useState(true);
  const [preprocessingOptions, setPreprocessingOptions] = useState({
    resize: true,
    blur: false,
    contrast: false
  });
  const [showColorAnalysis, setShowColorAnalysis] = useState(false);
  const [colorHistory, setColorHistory] = useState([]);

  // Color conversion utilities
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const formatColor = (hex, format) => {
    const { r, g, b } = hexToRgb(hex);
    switch (format) {
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`;
      case 'hsl':
        const hsl = rgbToHsl(r, g, b);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      case 'hex':
      default:
        return hex;
    }
  };

  // Color analysis functions
  const getComplementaryColor = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  };

  const getAnalogousColors = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const h = hsl.h;
    
    const color1 = hslToHex((h + 30) % 360, hsl.s, hsl.l);
    const color2 = hslToHex((h - 30 + 360) % 360, hsl.s, hsl.l);
    
    return [color1, color2];
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const getTriadicColors = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const h = hsl.h;
    
    const color1 = hslToHex((h + 120) % 360, hsl.s, hsl.l);
    const color2 = hslToHex((h + 240) % 360, hsl.s, hsl.l);
    
    return [color1, color2];
  };

  const analyzeColorPalette = (colors) => {
    if (colors.length === 0) return null;
    
    const analysis = {
      dominantColor: colors[0],
      complementary: getComplementaryColor(colors[0]),
      analogous: getAnalogousColors(colors[0]),
      triadic: getTriadicColors(colors[0]),
      colorCount: colors.length,
      isWarm: false,
      isCool: false,
      isGrayscale: false,
      averageSaturation: 0,
      averageLightness: 0
    };

    // Check if image is grayscale
    const isGrayscale = colors.every(color => {
      const { r, g, b } = hexToRgb(color);
      return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
    });
    
    analysis.isGrayscale = isGrayscale;

    // Analyze color temperature and properties
    let totalSaturation = 0;
    let totalLightness = 0;
    let warmCount = 0;
    let coolCount = 0;

    colors.forEach(color => {
      const { r, g, b } = hexToRgb(color);
      const hsl = rgbToHsl(r, g, b);
      
      totalSaturation += hsl.s;
      totalLightness += hsl.l;
      
      // For grayscale images, determine temperature based on lightness
      if (isGrayscale) {
        if (hsl.l > 60) warmCount++; // Light grays are "warm"
        else if (hsl.l < 40) coolCount++; // Dark grays are "cool"
      } else {
        // Determine if warm or cool for colored images
        if (hsl.h >= 0 && hsl.h <= 60) warmCount++; // Red to Yellow
        if (hsl.h >= 180 && hsl.h <= 240) coolCount++; // Cyan to Blue
      }
    });

    analysis.averageSaturation = Math.round(totalSaturation / colors.length);
    analysis.averageLightness = Math.round(totalLightness / colors.length);
    analysis.isWarm = warmCount > coolCount;
    analysis.isCool = coolCount > warmCount;

    return analysis;
  };

  // Image preprocessing
  const preprocessImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for better performance
        const maxSize = preprocessingOptions.resize ? 800 : img.width;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply blur if enabled
        if (preprocessingOptions.blur) {
          ctx.filter = 'blur(1px)';
          ctx.drawImage(canvas, 0, 0);
        }
        
        // Apply contrast if enabled
        if (preprocessingOptions.contrast) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        resolve(canvas.toDataURL());
      };
      img.src = imageSrc;
    });
  };

  // Advanced color distance calculation using perceptual color space
  const colorDistance = (color1, color2) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    // Convert to LAB color space for perceptual accuracy
    const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
    const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);
    
    // Calculate Delta E (CIE76) for perceptual color difference
    const deltaL = lab1.l - lab2.l;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  };

  // Convert RGB to LAB color space for perceptual accuracy
  const rgbToLab = (r, g, b) => {
    // Normalize RGB values
    let red = r / 255;
    let green = g / 255;
    let blue = b / 255;

    // Apply gamma correction
    red = red > 0.04045 ? Math.pow((red + 0.055) / 1.055, 2.4) : red / 12.92;
    green = green > 0.04045 ? Math.pow((green + 0.055) / 1.055, 2.4) : green / 12.92;
    blue = blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92;

    // Convert to XYZ color space
    let x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
    let y = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 1.00000;
    let z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;

    // Convert to LAB
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const labB = 200 * (y - z);

    return { l, a, b: labB };
  };

  // Advanced color validation with grayscale support
  const isValidColor = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    
    // Filter out very dark or very light colors that might be noise
    if (hsl.l < 5 || hsl.l > 95) return false;
    
    // For grayscale images, allow desaturated colors
    // For colored images, filter out very desaturated colors
    const isGrayscale = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
    
    if (!isGrayscale && hsl.s < 10) return false;
    
    // Filter out colors that are too close to pure black/white
    const distanceFromBlack = Math.sqrt(r*r + g*g + b*b);
    const distanceFromWhite = Math.sqrt((255-r)*(255-r) + (255-g)*(255-g) + (255-b)*(255-b));
    
    if (distanceFromBlack < 30 || distanceFromWhite < 30) return false;
    
    return true;
  };

  // Helper function to remove exact duplicates first
  const removeExactDuplicates = (colors) => {
    return [...new Set(colors)];
  };

  // Advanced color filtering with perceptual accuracy
  const filterSimilarColors = (colors, threshold = 15) => {
    // First remove exact duplicates
    const uniqueColors = removeExactDuplicates(colors);
    
    // Filter out invalid colors (noise, grays, etc.)
    const validColors = uniqueColors.filter(color => isValidColor(color));
    
    // Sort by color importance (saturation and lightness)
    const sortedColors = validColors.sort((a, b) => {
      const hslA = rgbToHsl(...Object.values(hexToRgb(a)));
      const hslB = rgbToHsl(...Object.values(hexToRgb(b)));
      
      // Prioritize colors with good saturation and mid-range lightness
      const scoreA = hslA.s * (1 - Math.abs(hslA.l - 50) / 50);
      const scoreB = hslB.s * (1 - Math.abs(hslB.l - 50) / 50);
      
      return scoreB - scoreA;
    });
    
    const filtered = [];
    for (const color of sortedColors) {
      const isSimilar = filtered.some(existingColor => 
        colorDistance(color, existingColor) < threshold
      );
      if (!isSimilar) {
        filtered.push(color);
      }
    }
    return filtered;
  };

  // Helper function to ensure no duplicates in final palette
  const ensureUniquePalette = (colors, targetCount = 6) => {
    // Remove exact duplicates first
    let uniqueColors = removeExactDuplicates(colors);
    
    // Filter similar colors
    uniqueColors = filterSimilarColors(uniqueColors);
    
    // If we have enough unique colors, return them
    if (uniqueColors.length >= targetCount) {
      return uniqueColors.slice(0, targetCount);
    }
    
    // If we don't have enough, generate additional unique colors
    const result = [...uniqueColors];
    const usedColors = new Set(uniqueColors);
    
    // Generate additional colors by slightly varying existing ones
    while (result.length < targetCount) {
      const baseColor = uniqueColors[result.length % uniqueColors.length] || "#808080";
      const { r, g, b } = hexToRgb(baseColor);
      
      // Create variations by adjusting RGB values
      const variation = Math.floor(Math.random() * 60) - 30; // -30 to +30
      const newR = Math.max(0, Math.min(255, r + variation));
      const newG = Math.max(0, Math.min(255, g + variation));
      const newB = Math.max(0, Math.min(255, b + variation));
      
      const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      
      // Only add if it's not already used
      if (!usedColors.has(newColor)) {
        result.push(newColor);
        usedColors.add(newColor);
      } else {
        // If we can't generate a unique color, break to avoid infinite loop
        break;
      }
    }
    
    return result;
  };

  // Enhanced Vibrant extraction with advanced settings
  const extractWithVibrant = async (imageSrc) => {
    return new Promise((resolve, reject) => {
      Vibrant.from(imageSrc)
          .quality(1)
        .maxColorCount(24) // Increased for more color options
          .getPalette((err, palette) => {
            if (err) {
              console.error('Vibrant error:', err);
              reject(err);
              return;
            }
            if (palette) {
              let extractedColors = Object.entries(palette)
                .filter(([_, swatch]) => swatch)
                .sort((a, b) => b[1].population - a[1].population)
              .map(([_, swatch]) => swatch.getHex())
              .filter(color => isValidColor(color)); // Filter out invalid colors
            
            // Enhanced sorting by color importance
            extractedColors = extractedColors.sort((a, b) => {
              const hslA = rgbToHsl(...Object.values(hexToRgb(a)));
              const hslB = rgbToHsl(...Object.values(hexToRgb(b)));
              
              // Score based on saturation, lightness, and population
              const scoreA = hslA.s * (1 - Math.abs(hslA.l - 50) / 50);
              const scoreB = hslB.s * (1 - Math.abs(hslB.l - 50) / 50);
              
              return scoreB - scoreA;
            });
            
            // Ensure unique palette with no duplicates
            const uniquePalette = ensureUniquePalette(extractedColors, 6);
            resolve(uniquePalette);
          } else {
            console.warn('No palette returned from Vibrant');
            resolve([]);
          }
        });
    });
  };

  // Simple fallback color extraction
  const extractSimpleColors = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const pixels = imageData.data;
        const colors = [];
        
        // Sample colors from the image
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colors.push(hex);
        }
        
        // Get unique colors and limit to 6
        const uniqueColors = [...new Set(colors)].slice(0, 6);
        resolve(uniqueColors);
      };
      img.src = imageSrc;
    });
  };

  // Fast Average Color extraction
  const extractWithFastAverage = async (imageSrc) => {
    try {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(imageSrc);
      if (!color || !color.hex) {
        console.warn('No color returned from Fast Average Color');
        return [];
      }
      const uniquePalette = ensureUniquePalette([color.hex], 6);
      return uniquePalette;
    } catch (error) {
      console.error('Fast Average Color extraction failed:', error);
      return [];
    }
  };

  // Median-cut algorithm for better color quantization
  const extractWithMedianCut = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const pixels = [];
        
        // Collect all pixels
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) { // Skip transparent pixels
            pixels.push([data[i], data[i + 1], data[i + 2]]);
          }
        }
        
        // Median-cut algorithm
        const buckets = [pixels];
        const targetBuckets = 6;
        
        while (buckets.length < targetBuckets && buckets.length < pixels.length) {
          let maxRange = 0;
          let bucketIndex = 0;
          
          // Find bucket with largest range
          buckets.forEach((bucket, index) => {
            if (bucket.length > 1) {
              const ranges = [0, 0, 0]; // R, G, B ranges
              for (let channel = 0; channel < 3; channel++) {
                const values = bucket.map(pixel => pixel[channel]);
                ranges[channel] = Math.max(...values) - Math.min(...values);
              }
              const maxChannelRange = Math.max(...ranges);
              if (maxChannelRange > maxRange) {
                maxRange = maxChannelRange;
                bucketIndex = index;
              }
            }
          });
          
          if (maxRange === 0) break;
          
          // Find channel with largest range
          const bucket = buckets[bucketIndex];
          const ranges = [0, 0, 0];
          for (let channel = 0; channel < 3; channel++) {
            const values = bucket.map(pixel => pixel[channel]);
            ranges[channel] = Math.max(...values) - Math.min(...values);
          }
          const maxChannel = ranges.indexOf(Math.max(...ranges));
          
          // Sort by the channel with largest range
          bucket.sort((a, b) => a[maxChannel] - b[maxChannel]);
          
          // Split at median
          const median = Math.floor(bucket.length / 2);
          const bucket1 = bucket.slice(0, median);
          const bucket2 = bucket.slice(median);
          
          buckets.splice(bucketIndex, 1, bucket1, bucket2);
        }
        
        // Calculate average color for each bucket
        const colors = buckets
          .filter(bucket => bucket.length > 0)
          .map(bucket => {
            const avgR = Math.round(bucket.reduce((sum, p) => sum + p[0], 0) / bucket.length);
            const avgG = Math.round(bucket.reduce((sum, p) => sum + p[1], 0) / bucket.length);
            const avgB = Math.round(bucket.reduce((sum, p) => sum + p[2], 0) / bucket.length);
            return `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
          })
          .filter(color => isValidColor(color));
        
        const uniquePalette = ensureUniquePalette(colors, 6);
        resolve(uniquePalette);
      };
      img.src = imageSrc;
    });
  };

  // Octree quantization for efficient color reduction
  const extractWithOctree = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Build octree
        class OctreeNode {
          constructor(level = 0) {
            this.level = level;
            this.children = new Array(8).fill(null);
            this.pixelCount = 0;
            this.red = 0;
            this.green = 0;
            this.blue = 0;
            this.isLeaf = false;
          }
          
          addColor(r, g, b) {
            this.pixelCount++;
            this.red += r;
            this.green += g;
            this.blue += b;
          }
          
          getAverageColor() {
            if (this.pixelCount === 0) return null;
            return {
              r: Math.round(this.red / this.pixelCount),
              g: Math.round(this.green / this.pixelCount),
              b: Math.round(this.blue / this.pixelCount)
            };
          }
        }
        
        const root = new OctreeNode();
        const maxLevel = 6;
        const maxColors = 6;
        
        // Add colors to octree
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            let node = root;
            for (let level = 0; level < maxLevel; level++) {
              const index = ((r >> (7 - level)) & 1) << 2 | 
                          ((g >> (7 - level)) & 1) << 1 | 
                          ((b >> (7 - level)) & 1);
              
              if (!node.children[index]) {
                node.children[index] = new OctreeNode(level + 1);
              }
              node = node.children[index];
            }
            node.addColor(r, g, b);
            node.isLeaf = true;
          }
        }
        
        // Reduce colors
        const leafNodes = [];
        const collectLeaves = (node) => {
          if (node.isLeaf) {
            leafNodes.push(node);
          } else {
            node.children.forEach(child => {
              if (child) collectLeaves(child);
            });
          }
        };
        collectLeaves(root);
        
        // Sort by pixel count and take top colors
        leafNodes.sort((a, b) => b.pixelCount - a.pixelCount);
        const topNodes = leafNodes.slice(0, maxColors);
        
        const colors = topNodes
          .map(node => {
            const avg = node.getAverageColor();
            if (avg) {
              return `#${avg.r.toString(16).padStart(2, '0')}${avg.g.toString(16).padStart(2, '0')}${avg.b.toString(16).padStart(2, '0')}`;
            }
            return null;
          })
          .filter(color => color && isValidColor(color));
        
        const uniquePalette = ensureUniquePalette(colors, 6);
        resolve(uniquePalette);
      };
      img.src = imageSrc;
    });
  };

  // Weighted K-means with spatial awareness
  const extractWithWeightedKMeans = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const pixels = [];
        
        // Sample pixels with spatial weighting
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            
            // Weight pixels by distance from center (center pixels are more important)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
            const weight = 1 - (distance / maxDistance) * 0.5; // Center pixels get higher weight
            
            pixels.push({
              r: data[i],
              g: data[i + 1],
              b: data[i + 2],
              weight: weight
            });
          }
        }
        
        // Weighted K-means
        const k = 6;
        const centroids = [];
        
        // Initialize with weighted random selection
        const totalWeight = pixels.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let currentWeight = 0;
        let selectedPixel = pixels[0];
        
        for (const pixel of pixels) {
          currentWeight += pixel.weight;
          if (currentWeight >= random) {
            selectedPixel = pixel;
            break;
          }
        }
        centroids.push([selectedPixel.r, selectedPixel.g, selectedPixel.b]);
        
        // Initialize remaining centroids
        for (let i = 1; i < k; i++) {
          const distances = pixels.map(pixel => {
            let minDist = Infinity;
            centroids.forEach(centroid => {
              const dist = Math.sqrt(
                Math.pow(pixel.r - centroid[0], 2) +
                Math.pow(pixel.g - centroid[1], 2) +
                Math.pow(pixel.b - centroid[2], 2)
              );
              minDist = Math.min(minDist, dist);
            });
            return minDist * minDist * pixel.weight; // Weight by distance and pixel importance
          });
          
          const sum = distances.reduce((a, b) => a + b, 0);
          random = Math.random() * sum;
          currentWeight = 0;
          selectedPixel = pixels[0];
          
          for (const pixel of pixels) {
            currentWeight += distances[pixels.indexOf(pixel)];
            if (currentWeight >= random) {
              selectedPixel = pixel;
              break;
            }
          }
          centroids.push([selectedPixel.r, selectedPixel.g, selectedPixel.b]);
        }
        
        // Weighted K-means iterations
        for (let iter = 0; iter < 15; iter++) {
          const clusters = Array(k).fill().map(() => []);
          const weights = Array(k).fill(0);
          
          pixels.forEach(pixel => {
            let minDist = Infinity;
            let closestCentroid = 0;
            
            centroids.forEach((centroid, i) => {
              const dist = Math.sqrt(
                Math.pow(pixel.r - centroid[0], 2) +
                Math.pow(pixel.g - centroid[1], 2) +
                Math.pow(pixel.b - centroid[2], 2)
              );
              if (dist < minDist) {
                minDist = dist;
                closestCentroid = i;
              }
            });
            
            clusters[closestCentroid].push(pixel);
            weights[closestCentroid] += pixel.weight;
          });
          
          // Update centroids with weighted average
          let converged = true;
          centroids.forEach((centroid, i) => {
            if (clusters[i].length > 0) {
              const totalWeight = weights[i];
              const avgR = clusters[i].reduce((sum, p) => sum + p.r * p.weight, 0) / totalWeight;
              const avgG = clusters[i].reduce((sum, p) => sum + p.g * p.weight, 0) / totalWeight;
              const avgB = clusters[i].reduce((sum, p) => sum + p.b * p.weight, 0) / totalWeight;
              
              const newCentroid = [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
              const distance = Math.sqrt(
                Math.pow(centroid[0] - newCentroid[0], 2) +
                Math.pow(centroid[1] - newCentroid[1], 2) +
                Math.pow(centroid[2] - newCentroid[2], 2)
              );
              
              if (distance > 1) converged = false;
              centroid[0] = newCentroid[0];
              centroid[1] = newCentroid[1];
              centroid[2] = newCentroid[2];
            }
          });
          
          if (converged) break;
        }
        
        const colors = centroids
          .filter(centroid => !isNaN(centroid[0]))
          .map(centroid => {
            return `#${centroid[0].toString(16).padStart(2, '0')}${centroid[1].toString(16).padStart(2, '0')}${centroid[2].toString(16).padStart(2, '0')}`;
          })
          .filter(color => isValidColor(color));
        
        const uniquePalette = ensureUniquePalette(colors, 6);
        resolve(uniquePalette);
      };
      img.src = imageSrc;
    });
  };

  // Advanced K-means clustering with improved accuracy
  const extractWithKMeans = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use higher resolution for better accuracy
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const pixels = [];
        
        // Sample pixels with better distribution
        for (let i = 0; i < data.length; i += 8) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Skip transparent pixels
          if (a > 128) {
            pixels.push([r, g, b]);
          }
        }
        
        // Advanced K-means with better initialization
        const k = 8; // Start with more clusters
        const centroids = [];
        
        // K-means++ initialization for better starting points
        centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
        
        for (let i = 1; i < k; i++) {
          const distances = pixels.map(pixel => {
            let minDist = Infinity;
            centroids.forEach(centroid => {
              const dist = Math.sqrt(
                Math.pow(pixel[0] - centroid[0], 2) +
                Math.pow(pixel[1] - centroid[1], 2) +
                Math.pow(pixel[2] - centroid[2], 2)
              );
              minDist = Math.min(minDist, dist);
            });
            return minDist * minDist;
          });
          
          const sum = distances.reduce((a, b) => a + b, 0);
          let random = Math.random() * sum;
          let index = 0;
          while (random > distances[index]) {
            random -= distances[index];
            index++;
          }
          centroids.push([...pixels[index]]);
        }
        
        // Enhanced K-means with more iterations
        for (let iter = 0; iter < 20; iter++) {
          const clusters = Array(k).fill().map(() => []);
          
          // Assign pixels to closest centroid using perceptual distance
          pixels.forEach(pixel => {
            let minDist = Infinity;
            let closestCentroid = 0;
            
            centroids.forEach((centroid, i) => {
              const pixelHex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
              const centroidHex = `#${centroid[0].toString(16).padStart(2, '0')}${centroid[1].toString(16).padStart(2, '0')}${centroid[2].toString(16).padStart(2, '0')}`;
              const dist = colorDistance(pixelHex, centroidHex);
              
              if (dist < minDist) {
                minDist = dist;
                closestCentroid = i;
              }
            });
            
            clusters[closestCentroid].push(pixel);
          });
          
          // Update centroids with weighted average
          let converged = true;
          centroids.forEach((centroid, i) => {
            if (clusters[i].length > 0) {
              const avgR = clusters[i].reduce((sum, p) => sum + p[0], 0) / clusters[i].length;
              const avgG = clusters[i].reduce((sum, p) => sum + p[1], 0) / clusters[i].length;
              const avgB = clusters[i].reduce((sum, p) => sum + p[2], 0) / clusters[i].length;
              
              const newCentroid = [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
              const distance = Math.sqrt(
                Math.pow(centroid[0] - newCentroid[0], 2) +
                Math.pow(centroid[1] - newCentroid[1], 2) +
                Math.pow(centroid[2] - newCentroid[2], 2)
              );
              
              if (distance > 1) converged = false;
              centroid[0] = newCentroid[0];
              centroid[1] = newCentroid[1];
              centroid[2] = newCentroid[2];
            }
          });
          
          if (converged) break;
        }
        
        // Convert centroids to hex and filter
        const colors = centroids
          .filter(centroid => !isNaN(centroid[0]) && isValidColor(`#${centroid[0].toString(16).padStart(2, '0')}${centroid[1].toString(16).padStart(2, '0')}${centroid[2].toString(16).padStart(2, '0')}`))
          .map(centroid => {
            return `#${centroid[0].toString(16).padStart(2, '0')}${centroid[1].toString(16).padStart(2, '0')}${centroid[2].toString(16).padStart(2, '0')}`;
          });
        
        // Ensure unique palette with no duplicates
        const uniquePalette = ensureUniquePalette(colors, 6);
        resolve(uniquePalette);
      };
      img.src = imageSrc;
    });
  };

  // Combined extraction method with all algorithms
  const extractWithCombined = async (imageSrc) => {
    const [vibrantColors, averageColor, kmeansColors, medianCutColors, octreeColors, weightedKmeansColors] = await Promise.all([
      extractWithVibrant(imageSrc),
      extractWithFastAverage(imageSrc),
      extractWithKMeans(imageSrc),
      extractWithMedianCut(imageSrc),
      extractWithOctree(imageSrc),
      extractWithWeightedKMeans(imageSrc)
    ]);
    
    // Combine all colors and ensure unique palette
    const combined = [...vibrantColors, ...averageColor, ...kmeansColors, ...medianCutColors, ...octreeColors, ...weightedKmeansColors];
    const uniquePalette = ensureUniquePalette(combined, 6);
    
    return uniquePalette;
  };

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      await processImageFile(file);
    }
  }, [extractionMethod, preprocessingOptions, colorHistory]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processImageFile = useCallback(async (file) => {
    if (file && file.type.substr(0, 5) === "image") {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        setSelectedImage(e.target.result);
        
        try {
          console.log('Starting image processing...');
          
          // Preprocess image if options are enabled
          const processedImage = await preprocessImage(e.target.result);
          console.log('Image preprocessed successfully');
          
          // Extract colors based on selected method
          let extractedColors = [];
          console.log('Extracting colors with method:', extractionMethod);
          
          try {
            switch (extractionMethod) {
              case 'vibrant':
                extractedColors = await extractWithVibrant(processedImage);
                break;
              case 'fast-average':
                extractedColors = await extractWithFastAverage(processedImage);
                break;
              case 'kmeans':
                extractedColors = await extractWithKMeans(processedImage);
                break;
              case 'median-cut':
                extractedColors = await extractWithMedianCut(processedImage);
                break;
              case 'octree':
                extractedColors = await extractWithOctree(processedImage);
                break;
              case 'weighted-kmeans':
                extractedColors = await extractWithWeightedKMeans(processedImage);
                break;
              case 'combined':
                extractedColors = await extractWithCombined(processedImage);
                break;
              default:
                extractedColors = await extractWithVibrant(processedImage);
                }
          } catch (extractionError) {
            console.error('Extraction method failed, trying fallback:', extractionError);
            // Fallback to simple color extraction
            extractedColors = await extractSimpleColors(processedImage);
          }
              
          console.log('Colors extracted:', extractedColors);

              setColorPalette(extractedColors);
          
          // Hide controls after successful extraction
          setShowControls(false);
          
          // Save to color history
          const historyEntry = {
            id: Date.now(),
            colors: extractedColors,
            method: extractionMethod,
            timestamp: new Date().toLocaleString(),
          };
          setColorHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

          // Analyze colors
          const analysis = analyzeColorPalette(extractedColors);
          setColorAnalysis(analysis);

          toast.success(`Successfully extracted ${extractedColors.length} colors!`, {
            icon: "🎨",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Failed to process image. Please try again.', {
            icon: "❌",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [extractionMethod, preprocessingOptions, colorHistory]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.substr(0, 5) === "image") {
        await processImageFile(file);
      }
    }
  }, [processImageFile]);


  const copyToClipboard = (color) => {
    const formattedColor = formatColor(color, colorFormat);
    navigator.clipboard
      .writeText(formattedColor)
      .then(() => {
        toast(`${formattedColor} copied to clipboard!`, {
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

  const copyAllColors = () => {
    const allColors = colorPalette.map(color => formatColor(color, colorFormat)).join('\n');
    navigator.clipboard
      .writeText(allColors)
      .then(() => {
        toast("All colors copied to clipboard!", {
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

  const exportPalette = () => {
    const paletteData = {
      colors: colorPalette,
      method: extractionMethod,
      timestamp: new Date().toISOString(),
      analysis: analyzeColorPalette(colorPalette)
    };
    
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-palette-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast("Palette exported successfully!", {
      icon: "📥",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
      });
  };

  return (
    <div className="color-extractor-page">
      {/* Back to Home Button - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          to="/" 
          className="bg-white/20 backdrop-blur-md text-white hover:text-indigo-300 font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/30"
        >
          ← Back to Home
        </Link>
      </div>

    <div className="image-color-analyzer">
      <h1 className="title">Color Extractor</h1>
      
      {/* Controls Panel - Only show when showControls is true */}
      {showControls && (
        <div className="controls-panel">
        {/* Extraction Method Selector */}
        <div className="control-group">
          <label htmlFor="extractionMethod" className="control-label">
            Extraction Method:
          </label>
          <select
            id="extractionMethod"
            value={extractionMethod}
            onChange={(e) => setExtractionMethod(e.target.value)}
            className="control-select"
          >
            <option value="vibrant">Vibrant (Enhanced)</option>
            <option value="fast-average">Fast Average</option>
            <option value="kmeans">K-Means Clustering</option>
            <option value="median-cut">Median-Cut Algorithm</option>
            <option value="octree">Octree Quantization</option>
            <option value="weighted-kmeans">Weighted K-Means</option>
            <option value="combined">Combined (All Algorithms)</option>
          </select>
        </div>

        {/* Color Format Selector */}
        <div className="control-group">
          <label htmlFor="colorFormat" className="control-label">
            Color Format:
          </label>
          <select
            id="colorFormat"
            value={colorFormat}
            onChange={(e) => setColorFormat(e.target.value)}
            className="control-select"
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>

        {/* Preprocessing Options */}
        <div className="control-group">
          <label className="control-label">Image Preprocessing:</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preprocessingOptions.resize}
                onChange={(e) => setPreprocessingOptions(prev => ({ ...prev, resize: e.target.checked }))}
              />
              Resize for performance
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preprocessingOptions.blur}
                onChange={(e) => setPreprocessingOptions(prev => ({ ...prev, blur: e.target.checked }))}
              />
              Apply blur
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preprocessingOptions.contrast}
                onChange={(e) => setPreprocessingOptions(prev => ({ ...prev, contrast: e.target.checked }))}
              />
              Enhance contrast
            </label>
          </div>
        </div>

        {/* Display Options */}
        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showHexCodes}
              onChange={(e) => setShowHexCodes(e.target.checked)}
            />
            Show color codes
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showColorAnalysis}
              onChange={(e) => setShowColorAnalysis(e.target.checked)}
            />
            Show color analysis
          </label>
        </div>
        </div>
      )}

      {/* Extract Again Button - Show when controls are hidden */}
      {!showControls && (
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <button
            onClick={() => {
              setShowControls(true);
              setSelectedImage(null);
              setColorPalette([]);
              setColorAnalysis(null);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-500 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12H4A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
            </svg>
            Extract Again
          </button>
          <div></div>
        </div>
      )}

      {!selectedImage && (
      <motion.div
          className={`upload-area ${isDragOver ? 'border-indigo-500 bg-indigo-50' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
          disabled={isProcessing}
          aria-label="Upload image for color extraction"
          aria-describedby="file-help"
        />
        <label htmlFor="imageUpload" className="upload-label">
          <div className="upload-icon">
            {isProcessing ? "⏳" : "🎨"}
          </div>
            <p>{isProcessing ? "Processing colors..." : isDragOver ? "Drop your image here!" : "Drop your image here or click to browse"}</p>
          <p className="file-types" id="file-help">Supports JPG, PNG, SVG</p>
          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}
        </label>
      </motion.div>
      )}
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
      {colorPalette.length > 0 ? (
        <div className="color-palette-container">
          <div className="palette-header">
            <h3 className="palette-title">Extracted Colors</h3>
            <div className="palette-actions">
              <button
                className="export-btn"
                onClick={() => exportPalette()}
                title="Export palette"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Export
              </button>
              <button
                className="copy-all-btn"
                onClick={() => copyAllColors()}
                title="Copy all colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                </svg>
                Copy All
              </button>
            </div>
          </div>
        <div className="color-palette">
          {colorPalette.map((color, index) => (
            <motion.div
              key={index}
                className="color-swatch-container"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => copyToClipboard(color)}
                ></div>
                {showHexCodes && (
                  <div className="color-code">
                    {formatColor(color, colorFormat)}
                  </div>
                )}
              </motion.div>
          ))}
        </div>
          
          {showColorAnalysis && (
            <div className="color-analysis">
              <h4 className="analysis-title">Color Analysis</h4>
              {analyzeColorPalette(colorPalette) && (
                <div className="analysis-content">
                  <div className="analysis-row">
                    <span className="analysis-label">Dominant Color:</span>
                    <div className="analysis-color" style={{ backgroundColor: analyzeColorPalette(colorPalette).dominantColor }}>
                      {formatColor(analyzeColorPalette(colorPalette).dominantColor, colorFormat)}
                    </div>
                  </div>
                  <div className="analysis-row">
                    <span className="analysis-label">Complementary:</span>
                    <div className="analysis-color" style={{ backgroundColor: analyzeColorPalette(colorPalette).complementary }}>
                      {formatColor(analyzeColorPalette(colorPalette).complementary, colorFormat)}
                    </div>
                  </div>
                  <div className="analysis-row">
                    <span className="analysis-label">Image Type:</span>
                    <span className="analysis-value">
                      {analyzeColorPalette(colorPalette).isGrayscale ? '⚫ Grayscale' : analyzeColorPalette(colorPalette).isWarm ? '🔥 Warm' : analyzeColorPalette(colorPalette).isCool ? '❄️ Cool' : '⚖️ Neutral'}
                    </span>
                  </div>
                  <div className="analysis-row">
                    <span className="analysis-label">Saturation:</span>
                    <span className="analysis-value">{analyzeColorPalette(colorPalette).averageSaturation}%</span>
                  </div>
                  <div className="analysis-row">
                    <span className="analysis-label">Lightness:</span>
                    <span className="analysis-value">{analyzeColorPalette(colorPalette).averageLightness}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : selectedImage && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Colors Found</h3>
          <p className="text-gray-500 mb-4">Try a different image or extraction method</p>
          <button
            onClick={() => {
              setSelectedImage(null);
              setColorPalette([]);
              setColorAnalysis(null);
              setShowControls(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Try Another Image
          </button>
        </motion.div>
      )}
      </div>
    </div>
  );
};

export default ImageColorAnalyzer;