import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion, useAnimation } from 'framer-motion';
import { FaShieldAlt, FaCubes, FaFingerprint, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { RiRocketLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { IoAnalyticsSharp, IoTrophySharp } from 'react-icons/io5';
import { throttle, debounce } from 'lodash';

const Header = ({ openUpdatesModal }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Carousel state
  const [activeFeature, setActiveFeature] = useState(0);
  const carouselRef = useRef(null);
  const carouselControls = useAnimation();

  // State for auto-scrolling control
  const [isPaused, setIsPaused] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrolled(window.scrollY > 50);
    }, 100);

    const checkMobile = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);

    // Check on mount and on resize
    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle carousel navigation
  const handleNextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  const handlePrevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  // Update carousel position when activeFeature changes
  useEffect(() => {
    carouselControls.start({
      x: `${-activeFeature * 100}%`,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    });
  }, [activeFeature, carouselControls]);

  // Auto-scroll timer
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        handleNextFeature();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused, activeFeature]);

  // Pausing handlers
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleTouchStart = useCallback(() => setIsPaused(true), []);
  const handleTouchEnd = useCallback(() => setIsPaused(false), []);

  // Memoize the animation condition
  const shouldUseSimpleAnimation = useMemo(
    () => prefersReducedMotion || isMobile,
    [prefersReducedMotion, isMobile]
  );

  // Memoize feature card hover effect
  const featureCardVariants = useMemo(
    () => ({
      hover: {
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        transition: { duration: 0.3 }
      }
    }),
    []
  );

  // Memoize scroll down animation
  const scrollDownVariants = useMemo(
    () => ({
      initial: { y: 0 },
      animate: {
        y: [0, 10, 0],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop"
        }
      }
    }),
    []
  );

  // Memoize statistics data
  const statistics = useMemo(
    () => [
      { value: '+10', label: 'Product' },
      { value: 'Q4 2025', label: 'Big anouncment' },
      { value: 'Nuvos NFTs', label: 'Coming Soon' }
    ],
    []
  );

  // Memoize features data
  const features = useMemo(
    () => [
      {
        icon: <FaShieldAlt className="text-purple-400" aria-hidden="true" />,
        title: "Secure Services",
        description:
          "Built on decentralized blockchain infrastructure for unmatched security and transparency"
      },
      {
        icon: <FaCubes className="text-purple-400" aria-hidden="true" />,
        title: "Smart Integration",
        description:
          "Connecting digital assets with physical products through intelligent synchronization"
      },
      {
        icon: <FaFingerprint className="text-purple-400" aria-hidden="true" />,
        title: "Unique Ecosystem",
        description:
          "Staking, P2E gaming, and AI tools forming a comprehensive financial environment"
      },
      {
        icon: <RiMoneyDollarCircleLine className="text-purple-400" aria-hidden="true" />,
        title: "Revenue Amplification",
        description:
          "Unlock new revenue streams by transforming your physical products into digital assets with up to 35% increased profit margins"
      },
      {
        icon: <IoAnalyticsSharp className="text-purple-400" aria-hidden="true" />,
        title: "Customer Insights Revolution",
        description:
          "Gain unprecedented data on product lifecycle and customer behavior patterns, driving strategic decisions that outperform competitors"
      },
      {
        icon: <IoTrophySharp className="text-purple-400" aria-hidden="true" />,
        title: "Market Leadership Positioning",
        description:
          "Join the elite 7% of businesses leveraging tokenization today, establishing your brand as an innovative industry leader"
      }
    ],
    []
  );

  // Memoize carousel card variants
  const carouselItemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5 }
      }
    }),
    []
  );

  // Define animation variants for staggered children
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
      }
    }),
    []
  );

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Background Elements */}

        {/* Stats Banner */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14 bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 shadow-lg"
        >
          <div className="grid grid-cols-3 gap-4">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <m.div
            initial={{
              opacity: prefersReducedMotion ? 1 : 0,
              x: prefersReducedMotion ? 0 : -20
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 1,
              delay: prefersReducedMotion ? 0 : 0.5
            }}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              <span className="inline-block pb-2">The Future is</span>
              <br />
              <span className="text-transparent gradient-text">Blockchain</span>
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed">
              Nuvos Cloud is a minimalist platform that leverages blockchain technology to deliver
              intelligent services with unmatched security, performance and efficiency.
            </p>

            <div className="pt-6 flex flex-wrap gap-5">
              <m.a
                href="#get-started"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all flex items-center"
              >
                <RiRocketLine className="mr-2 text-lg" />
                <span>Get Started</span>
              </m.a>
              <m.button
                onClick={openUpdatesModal}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(139, 92, 246, 0.15)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-transparent border border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all flex items-center"
              >
                <span>Last Updates</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </m.button>
            </div>
          </m.div>

          {/* Features Carousel */}
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-black/30 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden shadow-xl shadow-purple-500/10 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Carousel Container */}
            <div 
              className="relative overflow-hidden" 
              ref={carouselRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <m.div className="flex" animate={carouselControls} style={{ willChange: 'transform' }}>
                {features.map((item, index) => (
                  <m.div
                    key={index}
                    variants={carouselItemVariants}
                    className="min-w-full p-6 cursor-pointer relative overflow-hidden group/card bg-black/30"
                    whileHover={{
                      backgroundColor: "rgba(139, 92, 246, 0.15)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-start relative z-10 h-full">
                      <div className="text-3xl mr-5 mt-1">
                        <m.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {item.icon}
                        </m.div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-2">{item.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </m.div>
                ))}
              </m.div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute inset-x-0 bottom-4 flex justify-between items-center px-4 z-10">
              <m.button
                onClick={handlePrevFeature}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-purple-400 hover:bg-purple-500/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous feature"
              >
                <FaChevronLeft />
              </m.button>

              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeFeature ? "bg-purple-500" : "bg-purple-500/30"
                    }`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>

              <m.button
                onClick={handleNextFeature}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-purple-400 hover:bg-purple-500/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next feature"
              >
                <FaChevronRight />
              </m.button>
            </div>
          </m.div>
        </div>

        <m.div
          className="flex justify-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <m.a
            href="#get-started"
            className="text-purple-400 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity"
            variants={scrollDownVariants}
            initial="initial"
            animate="animate"
            aria-label="Scroll down to learn more"
          >
            <span className="text-sm mb-2">Discover More</span>
            <FaChevronDown />
          </m.a>
        </m.div>
      </section>
    </LazyMotion>
  );
};

export default React.memo(Header);