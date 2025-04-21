import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaCode, FaBug, FaBook, FaServer, FaShieldAlt, FaRocket, FaCogs, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Tooltip from '../../ui/Tooltip';
import ApplicationModal from '../../modals/ApplicationModal';

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Nuvos Roadmap
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Our journey to building the future of decentralized finance
          </p>
          
          <div className="flex justify-center space-x-4 text-purple-400">
            {/* Add any icons you need here without using SiPolygon */}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Carrousel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      icon: "👨‍💻",
      title: "Core Development",
      subtitle: "Smart Contract & Protocol Enhancement",
      description: "Contribute to the core infrastructure of our DeFi protocol. Work on smart contracts, security improvements, and protocol optimizations.",
      features: [
        { icon: <FaCode />, text: "Smart Contract Development" },
        { icon: <FaShieldAlt />, text: "Security Auditing" },
        { icon: <FaBug />, text: "Bug Fixes & Testing" },
        { icon: <FaBook />, text: "Technical Documentation" }
      ],
      keyPoints: [
        "Implement new protocol features",
        "Optimize gas consumption",
        "Enhance security measures",
        "Write comprehensive tests"
      ],
      requirements: [
        "Solidity expertise",
        "DeFi protocol knowledge",
        "Testing experience",
        "Security best practices"
      ],
      bounty: {
        amount: "25 POL",
        description: "Fixed bounty for core development tasks. Additional rewards based on task complexity and impact."
      }
    },
    {
      icon: "🎨",
      title: "Frontend Innovation",
      subtitle: "User Experience & Interface Design",
      description: "Shape the future of DeFi interfaces. Create intuitive, accessible, and powerful experiences for our users.",
      features: [
        { icon: <FaRocket />, text: "Performance Optimization" },
        { icon: <FaCode />, text: "Component Development" },
        { icon: <FaCogs />, text: "UI/UX Improvements" },
        { icon: <FaServer />, text: "API Integration" }
      ],
      keyPoints: [
        "Build responsive interfaces",
        "Implement Web3 features",
        "Optimize loading times",
        "Create interactive components"
      ],
      requirements: [
        "React expertise",
        "Web3.js/Ethers.js",
        "Performance optimization",
        "Mobile-first design"
      ],
      bounty: {
        amount: "20 POL",
        description: "Standard bounty for frontend development tasks. Bonus rewards for exceptional UI/UX improvements."
      }
    },
    {
      icon: "⚡",
      title: "Infrastructure & DevOps",
      subtitle: "System Reliability & Scaling",
      description: "Build and maintain the backbone of our protocol. Focus on performance, reliability, and scalability improvements.",
      features: [
        { icon: <FaServer />, text: "Server Optimization" },
        { icon: <FaShieldAlt />, text: "Security Hardening" },
        { icon: <FaCogs />, text: "Automation Tools" },
        { icon: <FaRocket />, text: "Performance Scaling" }
      ],
      keyPoints: [
        "Optimize network performance",
        "Implement monitoring solutions",
        "Automate deployment processes",
        "Enhance system reliability"
      ],
      requirements: [
        "DevOps experience",
        "Cloud infrastructure",
        "Security protocols",
        "Monitoring systems"
      ],
      bounty: {
        amount: "30 POL",
        description: "Base bounty for infrastructure tasks. Additional incentives for significant performance improvements."
      }
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Auto-play functionality
  useEffect(() => {
    let intervalId;
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        nextSlide();
      }, 10000); // 10 seconds, matching the original autoplaySpeed
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const handleApplyClick = (title) => {
    setSelectedRole(title);
    setIsModalOpen(true);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden pt-12 sm:pt-16 pb-8 sm:pb-12">
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <HeroSection />

        <motion.div 
          className="mt-4 sm:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div 
            className="custom-carousel relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Carousel navigation buttons */}
            <button 
              onClick={prevSlide} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-purple-800/70 hover:bg-purple-700 p-3 rounded-full text-white focus:outline-none"
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>
            
            <button 
              onClick={nextSlide} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-purple-800/70 hover:bg-purple-700 p-3 rounded-full text-white focus:outline-none"
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
            
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="px-2 py-1 sm:px-3"
                >
                  <div className="card-purple-gradient card-purple-wrapper">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl w-14 h-14 flex items-center justify-center bg-purple-900/20 rounded-xl border border-purple-500/20">
                        {slides[currentSlide].icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{slides[currentSlide].title}</h2>
                        <p className="text-purple-300">{slides[currentSlide].subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-6 text-lg">{slides[currentSlide].description}</p>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Features */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {slides[currentSlide].features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-purple-400">{feature.icon}</span>
                              <span className="text-gray-300 text-sm">{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {slides[currentSlide].requirements.map((req, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                              <span className="text-gray-300 text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Updated Rewards Section */}
                    <div className="border-t border-purple-500/20 pt-4 mt-6 bg-purple-900/5 rounded-b-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">Base Bounty:</h3>
                          <span className="text-purple-300 text-lg font-bold">{slides[currentSlide].bounty.amount}</span>
                          <Tooltip content={slides[currentSlide].bounty.description}>
                            <FaInfoCircle className="text-purple-400 cursor-help ml-2" />
                          </Tooltip>
                        </div>
                        <button 
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => handleApplyClick(slides[currentSlide].title)}
                        >
                          <FaGithub />
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Dots navigation */}
            <div className="flex justify-center mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 w-2 mx-1 rounded-full transition-all ${
                    currentSlide === index ? 'bg-purple-600 w-3' : 'bg-purple-400/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roleTitle={selectedRole}
      />
    </div>
  );
};

export default Carrousel;