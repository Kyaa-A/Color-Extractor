import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/20 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center"
            >
              <Link to="/" aria-label="Home" className="inline-flex items-center gap-3">
                {/* Icon mark - mobile & desktop */}
                <img
                  src="/TINTA_logo.webp"
                  alt="TINTA icon"
                  className="block md:hidden h-9 sm:h-10 w-auto"
                />
                {/* Wordmark - desktop only for combo */}
                <img
                  src="/TINTA_darkmode.webp"
                  alt="TINTA"
                  className="hidden md:block h-8 lg:h-9 w-auto"
                />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link 
                to="/extract"
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Try Now
              </Link>
            </motion.div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Extract Colors from
                <span className="block text-indigo-300">Any Image</span>
              </h1>
              <div className="mb-6">
                <span className="inline-block bg-white/10 text-indigo-100 px-3 py-1 rounded-full text-xs sm:text-sm tracking-wide">
                  TINTA — Tools for Inspiring New Tones & Art
                </span>
              </div>
              <p className="text-xl mb-8 text-gray-100 leading-relaxed">
                Professional color extraction tool with advanced algorithms. 
                Get accurate color palettes, analyze color relationships, 
                and export your findings instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/extract"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Start Extracting Colors
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200">
                  Watch Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map((color, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="aspect-square rounded-xl shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-center text-white">
                  <p className="text-sm opacity-80">Sample Color Palette</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Real-World Impact
            </h2>
            <p className="text-xl text-gray-200">
              See how professionals use Color Extractor in their workflow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Case Study: Design Workflow Optimization</h3>
              <p className="text-gray-200 text-lg">How a design team increased their productivity by 40%</p>
            </div>
            
            <div className="flex justify-center">
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="/caseStudy.webp"
                alt="Color Extractor Case Study"
                className="max-w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-200 text-lg">
                "Color Extractor transformed our design process. What used to take hours now takes minutes."
              </p>
              <p className="text-gray-300 mt-2">- Sarah Chen, Lead Designer at TechCorp</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Color Analysis
            </h2>
            <p className="text-xl text-gray-200">
              Advanced algorithms for accurate color extraction
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ),
                title: "Multiple Algorithms",
                description: "K-means, Median-Cut, Octree, and more for the most accurate results"
              },
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                ),
                title: "Smart Analysis",
                description: "Get complementary colors, color temperature, and saturation analysis"
              },
              {
                icon: (
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                ),
                title: "Export & Share",
                description: "Export palettes as JSON, copy colors, and save your favorites"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-indigo-300 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Extract Colors?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Upload any image and discover its color palette in seconds
            </p>
            <Link
              to="/extract"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Now - It's Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <p className="text-gray-300">
              © 2024 Color Extractor, Built by Asnari.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
