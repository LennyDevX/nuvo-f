import React, { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import SpaceBackground from '../../effects/SpaceBackground';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';

// Cargar HeroSection inmediatamente sin lazy loading para reducir latencia inicial
import HeroSection from './HeroSection';
import NFTsInfo from './NFTsInfo';

// Solo lazy load para componentes no críticos
const Category = React.lazy(() => import('./Category'));
const SpecialNFTs = React.lazy(() => import('./SpecialNFTs'));

// Placeholder optimizado y más pequeño
const SectionPlaceholder = ({ height = '200px' }) => (
  <div 
    className="w-full bg-purple-900/10 border border-purple-500/5 my-4 rounded-lg"
    style={{ height }}
  >
    <div className="p-4 space-y-2">
      <div className="h-4 bg-purple-800/10 rounded w-1/2 mx-auto"></div>
      <div className="h-2 bg-purple-800/10 rounded w-3/4 mx-auto"></div>
    </div>
  </div>
);

// Intersection Observer más eficiente con throttling
const useOptimizedIntersectionObserver = (callback, options = {}) => {
  const ref = React.useRef();
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            callback?.();
            // Desconectar después de ser visible para mejorar rendimiento
            if (options.triggerOnce !== false) {
              observer.unobserve(element);
            }
          }
        });
      },
      { 
        threshold: 0.05, // Threshold más bajo para carga anticipada
        rootMargin: '50px',
        ...options 
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [callback, isVisible]);

  return [ref, isVisible];
};

// Componente de sección simplificado
const OptimizedSection = ({ component: Component, onVisible, fallbackHeight, ...props }) => {
  const [ref, isVisible] = useOptimizedIntersectionObserver(onVisible);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={<SectionPlaceholder height={fallbackHeight} />}>
          <Component {...props} />
        </Suspense>
      ) : (
        <SectionPlaceholder height={fallbackHeight} />
      )}
    </div>
  );
};

const CreatorsHome = () => {
  const { shouldReduceMotion } = useAnimationConfig();

  useEffect(() => {
    // Precargar componentes críticos en idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('./Category');
      });
    } else {
      setTimeout(() => import('./Category'), 100);
    }

    // Configuración de scroll más suave
    document.documentElement.style.scrollBehavior = shouldReduceMotion ? 'auto' : 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [shouldReduceMotion]);

  return (
    <div className="min-h-screen bg-nuvo-gradient relative overflow-x-hidden">
      {/* SpaceBackground con menor densidad para mejor rendimiento */}
      <SpaceBackground customClass="" starDensity="minimal" />
      
      <div className="relative z-10">
        {/* Hero Section - Carga inmediata sin Suspense */}
        <HeroSection />
        
        {/* NFTs Info Section - Load immediately after hero */}
        <NFTsInfo />
        
        {/* Category Section - Lazy load optimizado */}
        <OptimizedSection 
          component={Category}
          onVisible={() => import('./SpecialNFTs')}
          fallbackHeight="300px"
        />
        
        {/* Special NFTs Section - Lazy load con menor prioridad */}
        <OptimizedSection 
          component={SpecialNFTs}
          fallbackHeight="400px"
        />
        
        {/* CTA Section simplificado y más liviano */}
        <motion.section 
          className="py-8 px-4 relative"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true, margin: '-20px' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/20 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-nuvo-gradient-text">
                  Ready to Transform Your Creative Career?
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Join the creator economy revolution with NFT technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-nuvo-base bg-nuvo-gradient-button text-white px-6 py-3 rounded-lg font-semibold">
                  Start Creating NFTs
                </button>
                <button className="btn-nuvo-base btn-nuvo-outline px-6 py-3 rounded-lg font-medium">
                  Learn More
                </button>
              </div>
              
              {/* Stats simplificados */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-purple-500/20">
                {[
                  { value: "500+", label: "Creators" },
                  { value: "10K+", label: "NFTs" },
                  { value: "$50K+", label: "Earnings" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-purple-400">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default memoWithName(CreatorsHome);
