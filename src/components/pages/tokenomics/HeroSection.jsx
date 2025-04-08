import React from 'react';
import { m } from 'framer-motion';
import { FaRocket, FaLock, FaUsers } from 'react-icons/fa';

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
        delay: i * 0.15,
        duration: 0.4,
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
        staggerChildren: 0.10,
        delayChildren: 0.4
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
        delay: 2.4, // Se mantiene el delay para que aparezca después de los textos
        duration: 0.7, // Duración más larga para un fade in más suave
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
      className="m-4 relative flex flex-col items-center justify-center text-center nuvos-card"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <m.div variants={itemVariants} className="mb-8 md:w-3/5">
            {/* Title with letter-by-letter animation */}
            <m.div
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="mb-4 overflow-hidden"
            >
              {Array.from("NUVOS Token").map((char, index) => (
                <m.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 
                           drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                           transition-all duration-600 text-4xl md:text-5xl lg:text-6xl font-bold"
                  style={{
                    textShadow: "0 0 0 rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.3)"
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </m.span>
              ))}
            </m.div>
            
            <m.p 
              initial={{ opacity: 0, y: 0, x: 5 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.7, duration: 1 }}
              className="text-xl md:text-2xl mt-4"
            >
              Powering Our Digital Ecosystem Today
            </m.p>

            <m.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="max-w-3xl"
            >
              <p className="text-gray-300 text-lg mb-6">
                Experience NUVOS, the active cornerstone of our ecosystem with a fixed supply of 21M tokens.
                Delivering sustainability, transparency, and community-driven growth across the Nuvos Cloud platform.
              </p>
            </m.div>
            
            {/* Botón con animación de fade in simplificada */}
            <m.button 
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="text-white px-5 py-3 rounded-full font-semibold transition-all duration-300 
                bg-gradient-to-r from-purple-600 to-blue-500 shadow-md hover:shadow-lg
                relative"
              onClick={onOpenTokenModal}
            >
              Learn More
            </m.button>
          </m.div>

          {/* Token Image with Rotation Animation */}
          <m.div 
            className="md:w-2/5 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <m.div
              className="relative"
              variants={coinFloatVariants}
              animate="animate"
            >
              <m.img
                src="/NuvosToken.png"
                alt="NUVOS Token"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                variants={coinRotateVariants}
                animate="animate"
                style={{ 
                  filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))'
                }}
              />
            </m.div>
            
          </m.div>
        </div>

        {/* Feature cards - keep existing structure */}
        <m.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {[
            {
              icon: <FaLock className="text-purple-400 text-4xl mb-4" />,
              title: "Fixed Supply",
              description: "21M tokens maximum supply, no additional minting capability"
            },
            {
              icon: <FaRocket className="text-purple-400 text-4xl mb-4" />,
              title: "Active Utility",
              description: "Currently powering transactions and services across the Nuvos Cloud ecosystem"
            },
            {
              icon: <FaUsers className="text-purple-400 text-4xl mb-4" />,
              title: "Community Governed",
              description: "Token holders participate in governance decisions and ecosystem development"
            }
          ].map((item, index) => (
            <div key={index} className="card-purple-gradient card-purple-wrapper flex flex-col items-center text-center">
              {item.icon}
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </m.div>
      </div>
    </m.div>
  );
};

export default HeroSection;
