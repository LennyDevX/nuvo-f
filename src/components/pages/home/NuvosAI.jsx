import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { FaRobot, FaBrain, FaComments, FaArrowRight, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import { imageCache } from '../../../utils/blockchain/imageCache';

const NuvosAI = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const [isMobile, setIsMobile] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(0);

  // Lista de posibles rutas para la imagen
  const imageSources = [
    '/NuvosBotAI2.webp',
  ];

  // Detect mobile devices on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize animation condition to prevent recalculation
  const useSimpleAnimation = useMemo(() => 
    prefersReducedMotion || shouldReduceMotion || isMobile || isLowPerformance, 
    [prefersReducedMotion, shouldReduceMotion, isMobile, isLowPerformance]
  );

  // Memoize navigation handler
  const handleNavigateToAI = useCallback(() => {
    navigate('/ai');
  }, [navigate]);

  const handleNavigateToChat = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  // Handle image load with caching
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    setImageError(false);
    
    // Cache successful load
    const currentSrc = imageSources[currentImageSrc];
    if (currentSrc && imageCache) {
      imageCache.set(`ai-bot-${currentImageSrc}`, currentSrc);
    }
  }, [currentImageSrc]);

  // Handle image error - try next source with caching
  const handleImageError = useCallback(() => {
    if (currentImageSrc < imageSources.length - 1) {
      setCurrentImageSrc(prev => prev + 1);
    } else {
      setImageError(true);
      setIsImageLoaded(false);
    }
  }, [currentImageSrc, imageSources.length]);

  // Memoize animation properties based on device capability
  const containerAnimationProps = useMemo(() => ({
    initial: { opacity: 0, y: useSimpleAnimation ? 0 : 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: useSimpleAnimation ? 0.3 : 0.8 },
    viewport: { once: true, margin: "-100px" }
  }), [useSimpleAnimation]);

  // Memoize floating animation properties for the image
  const imageAnimationProps = useMemo(() => {
    if (useSimpleAnimation) {
      return {
        animate: { scale: [0.98, 1.02, 0.98] },
        transition: { 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      };
    } else {
      return {
        animate: {
          y: [0, -15, 0],
          scale: [0.98, 1.02, 0.98],
          rotate: [-1, 1, -1]
        },
        transition: { 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }
      };
    }
  }, [useSimpleAnimation]);

  // Memoize button hover animation
  const buttonHoverProps = useMemo(() => {
    if (useSimpleAnimation) {
      return {};
    }
    return {
      whileHover: { scale: 1.05, y: -2 },
      whileTap: { scale: 0.98 }
    };
  }, [useSimpleAnimation]);

  // Memoize AI features data
  const aiFeatures = useMemo(() => [
    {
      icon: <FaBrain className="w-5 h-5" />,
      title: "Smart Analytics",
      description: "AI-powered insights for your portfolio"
    },
    {
      icon: <FaComments className="w-5 h-5" />,
      title: "Chat Assistant",
      description: "24/7 AI support for all your questions"
    },
    {
      icon: <FaStar className="w-5 h-5" />,
      title: "Auto Optimization",
      description: "Intelligent staking and reward optimization"
    }
  ], []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20">
      {/* Mobile Layout - Single Row */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-6 mb-6">
          {/* Mobile Title - Left side */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
              <span className="block text-white">Meet Your</span>
              <span className="block text-transparent bg-clip-text bg-nuvo-gradient-text">
                AI Assistant
              </span>
            </h2>
          </div>

          {/* Mobile Image - Right side, larger */}
          <div className="flex-shrink-0">
            <m.div 
              {...imageAnimationProps}
              className="relative w-32 h-32 sm:w-36 sm:h-36"
            >
              {/* Loading placeholder */}
              <div className={`w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center ${
                isImageLoaded && !imageError ? 'hidden' : 'flex'
              }`}>
                <FaRobot className="w-12 h-12 text-purple-400/50" />
              </div>
              
              {/* AI Bot Image */}
              <div className="relative">
                <img
                  src={imageSources[currentImageSrc]}
                  alt="Nuvos AI Assistant Bot"
                  className={`relative w-full h-full object-contain rounded-xl shadow-lg shadow-purple-500/20 transition-opacity duration-500 ${
                    isImageLoaded && !imageError ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    filter: 'drop-shadow(0 0 1rem rgba(139, 92, 246, 0.3))',
                    background: 'transparent'
                  }}
                />
              </div>
            </m.div>
          </div>
        </div>

        {/* Mobile Description - Match desktop text */}
        <p className="text-sm sm:text-base text-gray-200 mb-4 leading-relaxed">
          Experience the power of artificial intelligence within the Nuvos ecosystem. 
          Get personalized insights, smart recommendations, and 24/7 support.
        </p>

        {/* Mobile Features - Simplified */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/20"
            >
              <div className="text-purple-400 text-sm">{feature.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Action Buttons - Stack vertically */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleNavigateToChat}
            className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-sm flex items-center justify-center gap-2"
          >
            <FaComments className="w-3 h-3" />
            Start Chat
            <FaArrowRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleNavigateToAI}
            className="btn-nuvo-base btn-nuvo-outline btn-nuvo-sm flex items-center justify-center gap-2"
          >
            <FaBrain className="w-3 h-3" />
            Explore AI Hub
          </button>
        </div>
      </div>

      {/* Desktop Layout - Original Grid */}
      <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
        
        {/* Left Column - Content */}
        <m.div 
          {...containerAnimationProps}
          className="space-y-8 order-2 lg:order-1"
        >
          {/* Title with custom gradient */}
          <div className="space-y-4">
            <h2 className="text-6xl font-bold leading-tight tracking-tight">
              <span className="block mb-2 text-white">Meet Your</span>
              <span className="block mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">
                AI Assistant
              </span>
            </h2>
            
            <p className="text-xl text-gray-200 max-w-xl leading-relaxed">
              Experience the power of artificial intelligence within the Nuvos ecosystem. 
              Get personalized insights, smart recommendations, and 24/7 support.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            {aiFeatures.map((feature, index) => (
              <m.div
                key={index}
                initial={useSimpleAnimation ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={useSimpleAnimation ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: useSimpleAnimation ? 0 : 0.5, delay: useSimpleAnimation ? 0 : index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 bg-black/20 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="text-purple-400 mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </m.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <m.button
              {...buttonHoverProps}
              onClick={handleNavigateToChat}
              className="btn-nuvo-base bg-nuvo-gradient-button btn-nuvo-lg flex items-center justify-center gap-2"
            >
              <FaComments className="w-4 h-4" />
              Start Chat
              <FaArrowRight className="w-4 h-4" />
            </m.button>
            
            <m.button
              {...buttonHoverProps}
              onClick={handleNavigateToAI}
              className="btn-nuvo-base btn-nuvo-outline btn-nuvo-lg flex items-center justify-center gap-2"
            >
              <FaBrain className="w-4 h-4" />
              Explore AI Hub
            </m.button>
          </div>
        </m.div>

        {/* Right Column - AI Bot Image */}
        <m.div
          initial={useSimpleAnimation ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
          whileInView={useSimpleAnimation ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: useSimpleAnimation ? 0 : 0.8, delay: useSimpleAnimation ? 0 : 0.2 }}
          viewport={{ once: true }}
          className="relative order-1 lg:order-2 flex justify-center items-center"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 rounded-full blur-3xl scale-75" />
          
          {/* Animated container for the image */}
          <m.div 
            {...imageAnimationProps}
            className="relative z-10 max-w-sm mx-auto"
          >
            {/* Loading placeholder */}
            <div className={`w-full aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center ${
              isImageLoaded && !imageError ? 'hidden' : 'flex'
            }`}>
              <FaRobot className="w-16 h-16 text-purple-400/50" />
              <div className="absolute bottom-4 text-xs text-purple-300">
                {imageError ? 'AI Bot Placeholder' : 'Loading AI Bot...'}
              </div>
            </div>
            
            {/* AI Bot Image con border animado */}
            <div className="relative">
              {/* Border animado */}
              {!useSimpleAnimation && (
                <m.div
                  className="absolute -inset-1 rounded-2xl"
                  animate={{
                    background: [
                      'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))',
                      'linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                      'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                      'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              <img
                src={imageSources[currentImageSrc]}
                alt="Nuvos AI Assistant Bot"
                className={`relative w-full h-auto object-contain rounded-2xl shadow-2xl shadow-purple-500/20 transition-opacity duration-500 ${
                  isImageLoaded && !imageError ? 'opacity-100' : 'opacity-0 absolute inset-0'
                } border border-purple-500/10`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  filter: 'drop-shadow(0 0 2rem rgba(139, 92, 246, 0.3))',
                  maxWidth: '400px',
                  maxHeight: '400px',
                  background: 'transparent'
                }}
              />
            </div>
          </m.div>
          
         
        </m.div>
      </div>
    </section>
  );
};

export default React.memo(NuvosAI);
