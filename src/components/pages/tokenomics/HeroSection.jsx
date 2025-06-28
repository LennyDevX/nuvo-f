import React from 'react';
import { m } from 'framer-motion';
import { FaRocket, FaLock, FaUsers } from 'react-icons/fa';
import OptimizedImage from '../../image/OptimizedImage';

const HeroSection = ({ onOpenTokenModal }) => {
  // Container variants for the whole section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Item variants for features and other elements
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Letter-by-letter animation variants (matching Header component)
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeIn"
      }
    })
  };

  // Container animation for title
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  // Coin rotation animation
  const coinRotateVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Coin float animation (subtle up and down movement)
  const coinFloatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  // Versión simplificada de la animación del botón - fade in suave
  const buttonVariants = {
    hidden: { 
      opacity: 0,
      y: 5
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        delay: 1.4, // Se mantiene el delay para que aparezca después de los textos
        duration: 1.2, // Duración más larga para un fade in más suave
        ease: "easeInOut" // Curva de easing suave
      }
    },
    hover: { 
      scale: 1.03, // Escala sutil al hacer hover
      boxShadow: "0px 0px 8px rgba(139, 92, 246, 0.4)",
      transition: { 
        duration: 0.4 // Transición más lenta para el hover
      }
    },
    tap: { 
      scale: 0.98, // Efecto sutil al hacer click
      transition: { 
        duration: 0.2
      }
    }
  };

  return (
    <m.div
      className="mx-2 sm:mx-4 relative flex flex-col items-center justify-center text-center nuvos-card"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Main hero content - optimized mobile layout with side-by-side layout */}
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
          {/* Text content - left side on all devices */}
          <m.div variants={itemVariants} className="flex-1 text-left min-w-0 pr-2">
            {/* Title with letter-by-letter animation */}
            <m.div
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="mb-2 sm:mb-4 overflow-hidden"
            >
              {Array.from("NUVOS Token").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                            text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight"
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
            
            <m.p 
              initial={{ opacity: 0, y: 0, x: 5 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xs sm:text-base md:text-lg lg:text-xl mt-1 sm:mt-2 text-gray-200 leading-snug"
            >
              Powering Our Digital Ecosystem Today
            </m.p>

            <m.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-2 sm:mt-4"
            >
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Experience NUVOS, the active cornerstone of our ecosystem with a fixed supply of 21M tokens.
                <span className="hidden sm:inline"> Delivering sustainability, transparency, and community-driven growth across the Nuvos Cloud platform.</span>
              </p>
            </m.div>
          </m.div>

          {/* Token Image - right side on all devices */}
          <m.div 
            className="flex-shrink-0 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <m.div
              className="relative"
              variants={coinFloatVariants}
              animate="animate"
            >
              <m.div
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-64 xl:h-64"
                variants={coinRotateVariants}
                animate="animate"
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))'
                }}
              >
                <OptimizedImage
                  src="/NuvosToken.png"
                  alt="NUVOS Token"
                  priority={true}
                  quality={90}
                  className="w-full h-full object-contain"
                  loadingStrategy="eager"
                  placeholderColor="transparent"
                />
              </m.div>
            </m.div>
          </m.div>
        </div>

        {/* Feature cards - optimized mobile layout with 2 columns for mobile, 3 for larger screens */}
        <m.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 lg:mt-8"
        >
          {[
          {
            icon: <FaLock className="text-purple-400 text-base sm:text-2xl lg:text-3xl mb-1 sm:mb-3" />,
            title: "Fixed Supply",
            description: "21M tokens maximum supply"
          },
          {
            icon: <FaRocket className="text-purple-400 text-base sm:text-2xl lg:text-3xl mb-1 sm:mb-3" />,
            title: "Active Utility",
            description: "Powering Nuvos Cloud ecosystem"
          },
          {
            icon: <FaUsers className="text-purple-400 text-base sm:text-2xl lg:text-3xl mb-1 sm:mb-3" />,
            title: "Community Governed",
            description: "Token holders participate in governance"
          }].map((item, index) => (
            <m.div 
              key={index} 
              className={`card-purple-gradient card-purple-wrapper flex flex-col items-center text-center p-2 sm:p-4 lg:p-5
                         hover:scale-[1.02] transition-transform duration-300 ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {item.icon}
              <h3 className="text-white font-semibold text-xs sm:text-base lg:text-lg mb-1 sm:mb-2">{item.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{item.description}</p>
            </m.div>
          ))}
        </m.div>

        {/* Button moved after cards - centered and full width on mobile */}
        <m.div className="flex justify-center mt-4 sm:mt-6">
          <m.button 
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            className="text-white px-6 sm:px-8 py-3 sm:py-3 text-sm sm:text-base
              font-semibold transition-all duration-300 btn-nuvo-base bg-nuvo-gradient-button 
              shadow-md hover:shadow-lg w-full sm:w-auto max-w-xs"
            onClick={onOpenTokenModal}
          >
            Learn More
          </m.button>
        </m.div>
      </div>
    </m.div>
  );
};

export default HeroSection;
