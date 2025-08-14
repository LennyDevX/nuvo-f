import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';
import TimeCounter from './AirdropForm/TimeCounter';

// Lazy load del formulario pesado
const AirdropForm = lazy(() => import('./AirdropForm/AirdropForm'));

// Placeholder para cuando el formulario está cargando
const FormPlaceholder = () => (
  <div className="p-8">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-purple-800/20 rounded-lg w-1/2 mx-auto"></div>
      <div className="h-4 bg-purple-800/20 rounded w-3/4 mx-auto"></div>
      <div className="h-24 bg-purple-800/20 rounded-lg w-full mt-4"></div>
    </div>
  </div>
);

const AirdropRegistrationSection = () => {
  const sectionRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Optimizar para preferencias de reducción de movimiento
  const reduceAnimations = shouldReduceMotion || isLowPerformance;

  // Usar useCallback para funciones que se pasan como props
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  useEffect(() => {
    if (isFormOpen && sectionRef.current) {
      // Asegurar que el scroll sea suave solo si las animaciones están habilitadas
      const behavior = reduceAnimations ? 'auto' : 'smooth';
      sectionRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  }, [isFormOpen, reduceAnimations]);

  // Variantes de animación simplificadas si se requieren menos animaciones
  const fadeInUp = reduceAnimations
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }}
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }};

  // No renderizar contenido completo hasta que sea visible
  if (!isVisible) {
    return <div ref={ref} className="min-h-[300px] my-6"></div>;
  }

  return (
    <section 
      ref={sectionRef} 
      id="registration-form" 
      className="scroll-mt-8 mb-8 lg:mb-16"
    >
      <motion.div 
        ref={ref}
        className="nuvos-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <div className="p-4 md:p-6 lg:p-8">
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
                    initial={reduceAnimations ? { opacity: 0 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceAnimations ? 0.2 : 0.3 }}
                  >
                    <Suspense fallback={<FormPlaceholder />}>
                      <AirdropForm onClose={handleCloseForm} />
                    </Suspense>
                  </motion.div>
                ) : (
                  <motion.div
                    key="header"
                    initial={reduceAnimations ? { opacity: 0 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-4 md:p-6 lg:p-8 lg:mt-4"
                    transition={{ duration: reduceAnimations ? 0.2 : 0.3 }}
                  >
                    <motion.h2 
                      className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4"
                      initial={reduceAnimations ? {} : { y: -10, opacity: 0 }}
                      animate={reduceAnimations ? {} : { y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Register for Airdrop
                    </motion.h2>
                    <motion.p 
                      className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-2"
                      initial={reduceAnimations ? {} : { y: 10, opacity: 0 }}
                      animate={reduceAnimations ? {} : { y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Complete the form below to register for the NUVOS airdrop. Make sure your wallet is connected to receive your tokens.
                    </motion.p>
                    <motion.p 
                      className="text-purple-300/80 text-xs md:text-sm font-medium"
                      initial={reduceAnimations ? {} : { opacity: 0 }}
                      animate={reduceAnimations ? {} : { opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      🎁 Each eligible wallet receives 10 POL tokens
                    </motion.p>
                    <div className="mt-6 md:mt-8">
                      <motion.button
                        whileTap={reduceAnimations ? {} : { scale: 0.98 }}
                        onClick={() => setIsFormOpen(true)}
                        className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 btn-nuvo-base bg-nuvo-gradient-button text-white rounded-xl "
                        initial={reduceAnimations ? {} : { opacity: 0, y: 20 }}
                        animate={reduceAnimations ? {} : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="absolute inset-0 "></div>
                        <div className="relative flex items-center justify-center gap-3">
                          <FaGift className="text-lg" />
                          <span>Start Registration</span>
                        </div>
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

export default memoWithName(AirdropRegistrationSection);
