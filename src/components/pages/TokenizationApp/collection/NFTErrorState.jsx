import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaPlus, FaRedo, FaNetworkWired } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NFTErrorState = ({ error, onRetry }) => {
  // Determine if this is a network error
  const isNetworkError = error && (
    error.includes('network') || 
    error.includes('conectar') || 
    error.includes('connection') ||
    error.includes('red incorrecta')
  );

  // Determine if this is a no-NFTs-yet message
  const isNoNFTsError = error && (
    error.includes('No se pudieron decodificar') || 
    error.includes('aún no tengas NFTs') ||
    error.includes('BAD_DATA')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 text-center"
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20 mb-4">
          <FaExclamationTriangle className="text-amber-400 text-3xl" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          {isNetworkError ? "Problema de conexión" : 
           isNoNFTsError ? "No NFTs Found" : 
           "Error Loading NFTs"}
        </h3>
        
        <p className="text-gray-300 mb-6 max-w-lg">
          {isNetworkError ? (
            "No pudimos conectar con la blockchain. Por favor verifica que tu wallet esté conectada a la red correcta (Polygon Network)."
          ) : isNoNFTsError ? (
            "Parece que aún no tienes NFTs creados o la conexión a la blockchain falló. Comienza creando tu primer NFT."
          ) : (
            error || "Ocurrió un error al cargar tus NFTs. Por favor intenta nuevamente."
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {isNoNFTsError && (
            <Link
              to="/tokenize"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:shadow-lg transition-all"
            >
              <FaPlus className="mr-2" /> Create my first NFT
            </Link>
          )}
          
          <button 
            onClick={onRetry}
            className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-all"
          >
            <FaRedo className="mr-2" /> Try Again
          </button>
          
          {isNetworkError && (
            <a
              href="https://chainlist.org/chain/137"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-all"
            >
              <FaNetworkWired className="mr-2" /> Switch to Polygon
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NFTErrorState;
