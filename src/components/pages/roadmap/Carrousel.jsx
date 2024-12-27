import React from 'react';
import { motion } from 'framer-motion';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaGithub, FaCode, FaBug, FaBook, FaServer, FaShieldAlt, FaRocket, FaCogs } from 'react-icons/fa';
import HeroSection from './HeroSection';

const Carrousel = () => {
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
  };

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
      rewards: {
        bounty: "Up to 200 POL",
        incentives: "Performance bonuses",
        benefits: "GitHub Copilot access"
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
      rewards: {
        bounty: "Up to 200 POL",
        incentives: "Feature bonuses",
        benefits: "Premium tools access"
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
      rewards: {
        bounty: "Up to 200 POL",
        incentives: "Reliability bonuses",
        benefits: "Infrastructure access"
      }
    }
  ];

  return (
    <div className="relative overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />

        <motion.div 
          className="mt-4 sm:mt-8 md:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Slider {...carouselSettings} className="hero-carousel">
            {slides.map((slide, index) => (
              <div key={index} className="focus:outline-none px-2 py-1 sm:px-3">
                <div className="card-purple-gradient card-purple-wrapper">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl w-14 h-14 flex items-center justify-center bg-purple-900/20 rounded-xl border border-purple-500/20">
                      {slide.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
                      <p className="text-purple-300">{slide.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-6 text-lg">{slide.description}</p>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {slide.features.map((feature, i) => (
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
                        {slide.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            <span className="text-gray-300 text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rewards Section */}
                  <div className="border-t border-purple-500/20 pt-6 mt-6 bg-purple-900/5 rounded-b-xl">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">Rewards</h3>
                        <div className="space-y-1">
                          <p className="text-purple-300 text-sm">Bounty: {slide.rewards.bounty}</p>
                          <p className="text-purple-300 text-sm">+ {slide.rewards.incentives}</p>
                          <p className="text-purple-300 text-sm">+ {slide.rewards.benefits}</p>
                        </div>
                      </div>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2">
                        <FaGithub />
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          <style>{`
            .hero-carousel .slick-dots {
              bottom: -35px;
              margin-top: 1rem;
              padding-bottom: 1rem;
            }
            .hero-carousel .slick-dots li {
              margin: 0 4px;
            }
            .hero-carousel .slick-dots li button:before {
              color: #a855f7;
              font-size: 6px;
              opacity: 0.5;
              transition: all 0.3s ease;
            }
            .hero-carousel .slick-dots li.slick-active button:before {
              color: #7c3aed;
              opacity: 1;
              transform: scale(1.2);
            }
            @media (min-width: 640px) {
              .hero-carousel .slick-dots {
                bottom: -45px;
              }
              .hero-carousel .slick-dots li {
                margin: 0 6px;
              }
              .hero-carousel .slick-dots li button:before {
                font-size: 8px;
              }
            }
          `}</style>
        </motion.div>
      </div>
    </div>
  );
};

export default Carrousel;