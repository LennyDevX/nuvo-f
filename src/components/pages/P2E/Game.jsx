import { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../../../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaTools, FaClock, FaBell } from 'react-icons/fa';

const Game = () => {
  const { walletConnected } = useContext(WalletContext);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Show alert after a short delay
    const timer = setTimeout(() => setShowAlert(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!walletConnected) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-white">
        <p>Por favor conecta tu wallet para acceder al juego.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 mt-16 mb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
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
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
            Nuvo Gaming
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Prepárate para una experiencia de juego revolucionaria en la blockchain. 
            Gana tickets, participa en sorteos y obtén recompensas exclusivas.
          </p>
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

      {/* Alert notification */}
      
        
    </div>
  );
};

// Helper component for feature cards
const FeatureCard = ({ title, description, color }) => s(
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.2)" }}
    className={`bg-gradient-to-br ${color} p-6 rounded-xl border border-slate-700/50`}
  >
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default Game;
