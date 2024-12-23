import React from 'react';
import { motion } from 'framer-motion';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useStaking } from '../../../context/StakingContext';
import { ethers } from 'ethers';
import '../../../styles/gradients.css';

const HeroSection = () => {
  const { state } = useStaking();
  
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

  const formatValue = (value) => {
    if (!value || value === '0') return 'N/A';
    try {
      // Si el valor es muy grande, intentamos formatearlo de manera segura
      if (typeof value === 'number' && value > 1e15) {
        return (value / 1e18).toFixed(2);
      }
      
      // Para valores BigInt
      if (typeof value === 'bigint') {
        return Number(value / BigInt(1e9) / BigInt(1e9)).toFixed(2);
      }

      // Si es una cadena que representa un número grande
      if (typeof value === 'string' && value.length > 15) {
        return (Number(value) / 1e18).toFixed(2);
      }

      // Para otros casos, usar formatEther normalmente
      return ethers.formatEther(value);
    } catch (err) {
      console.warn('Error formatting value:', err);
      return 'N/A';
    }
  };

  const getValueColor = (value, isStatus = false) => {
    // Para estados especiales (trend)
    if (isStatus) {
      const activeStates = ['Live', 'Active', 'Monitoring', 'Users', 'Distributed', 'All Time', '24h'];
      return activeStates.includes(String(value)) ? 'text-green-400' : 'text-red-400';
    }

    // Para valores numéricos y otros
    try {
      // Si es un número válido mayor que 0
      if (!isNaN(value) && Number(value) > 0) return 'text-green-400';
      
      const stringValue = String(value).toLowerCase();
      
      // Lista de valores que indican "no disponible"
      if (
        stringValue === '0' ||
        stringValue === 'n/a' ||
        stringValue.includes('coming') ||
        stringValue.includes('launching') ||
        stringValue === 'undefined' ||
        stringValue === 'null' ||
        stringValue === ''
      ) {
        return 'text-red-400';
      }

      // Por defecto, si tiene algún valor, mostrar en verde
      return stringValue.length > 0 ? 'text-green-400' : 'text-red-400';
    } catch (err) {
      return 'text-red-400'; // En caso de error, mostrar en rojo
    }
  };

  const slides = [
    {
      icon: "👨‍💻",
      title: "Contribute & Earn",
      subtitle: "Developer Rewards Program",
      description: "Join our open-source development community. Earn POL tokens by contributing code, fixing bugs, and improving our protocol's infrastructure.",
      features: [
        "Smart Contract Development",
        "Frontend Improvements",
        "Bug Fixes & Testing",
        "Documentation Writing"
      ],
      stats: [
        { 
          label: "Active Contributors", 
          value: state.uniqueUsersCount?.toString() || "0", 
          trend: "Users" 
        },
        { 
          label: "Total Rewards", 
          value: formatValue(state.poolMetrics?.rewardsDistributed) || "0", 
          trend: "Distributed" 
        },
        { 
          label: "Open Tasks", 
          value: "0", 
          trend: "Coming Soon" 
        }
      ],
      metrics: {
        avgReward: formatValue(state.poolMetrics?.rewardsDistributed / (state.uniqueUsersCount || 1)) || "N/A",
        openIssues: "0",
        mergedPRs: "0"
      },
      cta: "Coming Soon",
      ctaSecondary: "View Docs"
    },
    {
      icon: "🔍",
      title: "Research & Design",
      subtitle: "Protocol Enhancement",
      description: "Help shape the future of DeFi by proposing protocol improvements, researching new features, and designing innovative solutions.",
      features: [
        "Technical Research",
        "Architecture Design",
        "Security Analysis",
        "Performance Optimization"
      ],
      stats: [
        { 
          label: "Treasury Balance", 
          value: formatValue(state.treasuryMetrics?.balance), 
          trend: "Active" 
        },
        { 
          label: "Daily Growth", 
          value: state.treasuryMetrics?.dailyGrowth?.toFixed(2) + '%' || "0", 
          trend: "Live" 
        },
        { 
          label: "Health Score", 
          value: state.treasuryMetrics?.healthScore?.toFixed(1) + '%' || 'N/A', 
          trend: "Monitoring" 
        }
      ],
      metrics: {
        dailyVolume: formatValue(state.poolMetrics?.dailyVolume) || "N/A",
        proposals: "0",
        researchers: "Coming Soon"
      },
      cta: "Coming Soon",
      ctaSecondary: "Learn More"
    },
    {
      icon: "🛠️",
      title: "Build & Deploy",
      subtitle: "Infrastructure Growth",
      description: "Deploy and maintain critical infrastructure components. Earn rewards for developing tools, bots, and integration solutions.",
      features: [
        "API Development",
        "Node Operations",
        "Integration Tools",
        "Monitoring Systems"
      ],
      stats: [
        { 
          label: "Total TVL", 
          value: formatValue(state.totalPoolBalance), 
          trend: "Live" 
        },
        { 
          label: "Total Withdrawn", 
          value: formatValue(state.poolMetrics?.totalWithdrawn), 
          trend: "All Time" 
        },
        { 
          label: "Daily Commission", 
          value: formatValue(state.treasuryMetrics?.dailyCommissions), 
          trend: "24h" 
        }
      ],
      metrics: {
        uptime: "99.9%",
        nodes: "Coming Soon",
        apiCalls: "N/A"
      },
      cta: "Coming Soon",
      ctaSecondary: "View Status"
    }
  ];

  return (
    <div className="relative overflow-hidden pt-16   sm:pt-20 pb-12 sm:pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12 sm:mb-16 md:mb-20 px-3 sm:px-0" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-8 font-bold mb-6 sm:mb-8 gradient-text leading-tight">
            Build With Us
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
            Join our developer community and earn POL tokens while building the future of DeFi
          </p>
        </motion.div>

        <motion.div 
          className="mt-6 sm:mt-8 md:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Slider {...carouselSettings} className="hero-carousel">
            {slides.map((slide, index) => (
              <div key={index} className="focus:outline-none px-2 py-1 sm:px-3">
                <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 min-h-[450px] sm:min-h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 h-full">
                    {/* Left Column */}
                    <div className="md:col-span-7 flex flex-col space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="text-4xl sm:text-5xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-purple-900/30 rounded-xl border border-purple-500/20">
                          {slide.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                            {slide.title}
                          </h2>
                          <p className="text-purple-300 font-medium text-sm sm:text-base">
                            {slide.subtitle}
                          </p>
                          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                            {Object.entries(slide.metrics).map(([key, value]) => (
                              <div key={key} className="text-xs sm:text-sm">
                                <span className="text-gray-400">{key.toUpperCase()}: </span>
                                <span className={`font-medium ${getValueColor(value)}`}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 text-lg leading-relaxed line-clamp-2">{slide.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        {slide.features.map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-4 mt-auto">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-purple-500/25">
                          {slide.cta}
                        </button>
                        <button className="border border-purple-500/30 hover:border-purple-500/60 text-purple-300 px-6 py-2.5 rounded-lg transition-all duration-300">
                          {slide.ctaSecondary}
                        </button>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-5 flex flex-col justify-between mt-4 md:mt-0">
                      <div className="grid grid-cols-1 gap-3">
                        {slide.stats.map((stat, i) => (
                          <div key={i} className="bg-purple-900/30 hover:bg-purple-900/40 p-4 rounded-xl border border-purple-500/10 transition-all duration-300">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                                <div className={`text-xl font-bold ${getValueColor(stat.value)}`}>
                                  {stat.value}
                                </div>
                              </div>
                              <div className={`text-sm font-medium ${getValueColor(stat.trend, true)}`}>
                                {stat.trend}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default HeroSection;