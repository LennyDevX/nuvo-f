import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift } from 'react-icons/fa';
import AirdropForm from './AirdropForm/AirdropForm';
import TimeCounter from './AirdropForm/TimeCounter';

const AirdropRegistrationSection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="registration-form" className="scroll-mt-8">
      <motion.div 
        className="nuvos-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="p-6 md:p-8">
          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Lado izquierdo: TimeCounter y título */}
            <div className={`lg:w-1/2 ${isFormOpen ? 'lg:block hidden' : 'block'}`}>
              <TimeCounter hideDetailsOnMobile={isFormOpen} />
            </div>
            
            {/* Lado derecho: Título/texto (cuando está cerrado) o formulario */}
            <div className="lg:w-1/2">
              <AnimatePresence mode="wait">
                {isFormOpen ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AirdropForm onClose={() => setIsFormOpen(false)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl font-bold text-white mb-4">Register for Airdrop</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                      Complete the form below to register for the NUVOS airdrop. Make sure your wallet is connected to receive your tokens.
                    </p>
                    <div className="mt-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsFormOpen(true)}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white flex items-center gap-2 mx-auto shadow-lg shadow-purple-900/30"
                      >
                        <FaGift /> Open Registration Form
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AirdropRegistrationSection;
