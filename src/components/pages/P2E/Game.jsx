import { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaTools, FaClock, FaBell } from 'react-icons/fa';
import SpaceBackground from '../../effects/SpaceBackground';

const Game = () => {
  const { walletConnected } = useContext(WalletContext);
  const [showAlert, setShowAlert] = useState(false);

  // Letter-by-letter animation variants
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

  useEffect(() => {
    // Show alert after a short delay
    const timer = setTimeout(() => setShowAlert(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!walletConnected) {
    return (
      <div className="bg-nuvo-gradient flex items-center justify-center h-[70vh] text-white">
        <p>Por favor conecta tu wallet para acceder al juego.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-28 pb-16 flex flex-col items-center">
      <SpaceBackground customClass="" />
      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header section with animated title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-block p-3 bg-purple-500/20 rounded-full mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FaGamepad className="text-4xl text-purple-400" />
          </motion.div>
          
          {/* Animated title */}
          <motion.div
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 overflow-hidden"
          >
            {Array.from("Nuvo Gaming").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                         drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                         transition-all duration-600 text-5xl font-bold"
                style={{
                  textShadow: "0 0 0 rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.3)"
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 0, x: 5 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 1.7, duration: 1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Prepárate para una experiencia de juego revolucionaria en la blockchain. 
            Gana tickets, participa en sorteos y obtén recompensas exclusivas.
          </motion.p>
        </motion.div>

        {/* Development Status Card */}
        <motion.div 
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-10 
                    backdrop-blur-sm border border-purple-500/20 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left Section - Illustration */}
            <div className="w-full md:w-1/3 flex justify-center">
              <motion.div 
                className="relative w-48 h-48"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl" />
                <motion.div 
                  className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaTools className="text-5xl text-purple-300" />
                </div>
              </motion.div>
            </div>

            {/* Right Section - Content */}
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Juego en Desarrollo
              </h2>
              <p className="text-gray-300 mb-6">
                Estamos trabajando arduamente para crear una experiencia de juego única. El sorteo de lotería 
                y otros minijuegos estarán disponibles pronto. ¡Vuelve a visitarnos!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                          rounded-lg text-white font-medium shadow-lg shadow-purple-500/20 
                          flex items-center justify-center gap-2"
                >
                  <FaBell className="text-white" />
                  Notificarme cuando esté listo
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-slate-700/50 border border-purple-500/30
                          rounded-lg text-white font-medium 
                          flex items-center justify-center gap-2"
                >
                  <FaClock className="text-purple-400" />
                  Ver avances
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        
      </div>
    </div>
  );
};

// Helper component for feature cards
const FeatureCard = ({ title, description, color }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.2)" }}
    className={`bg-gradient-to-br ${color} p-6 rounded-xl border border-slate-700/50`}
  >
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default Game;
