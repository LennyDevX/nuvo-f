import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DodoCarrousel from './DodoCarrousel';

const SwapInfo = () => {
  return (
    <section className="relative overflow-hidden py-8 sm:py-16">
      <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <DodoCarrousel />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-6 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
              <span className="gradient-text block mb-1 sm:mb-2">DODO Exchange</span>
              <span className="text-white block">Revolutionizing DeFi</span>
            </h2>
            <p className="text-gray-300 text-lg sm:text-xl max-w-xl">
              Trade tokens efficiently with one of the most innovative DEXs 
              in the DeFi space, leveraging PMM technology to get the 
              best market prices.
            </p>
            <Link
              to="/swaptoken"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-yellow-500/50 
                       text-base sm:text-lg font-medium rounded-full text-white 
                       bg-gradient-to-r from-yellow-600 to-yellow-700 
                       hover:from-yellow-500 hover:to-yellow-600 
                       transition-all duration-300 shadow-lg 
                       shadow-yellow-900/40 hover:shadow-yellow-900/60
                       w-full sm:w-auto justify-center sm:justify-start
                       mt-4 sm:mt-8"
            >
              Start Trading
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SwapInfo;
