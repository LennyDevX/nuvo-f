import React, { useContext, useState, Suspense, lazy } from 'react';
import { WalletContext } from '../../../context/WalletContext';
// import { useAirdropData } from '../../../hooks/useAirdropData';
import SpaceBackground from '../../effects/SpaceBackground';
import AnimationProvider from '../../animation/AnimationProvider';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';
import memoWithName from '../../../utils/performance/memoWithName';

// Lazy loading para componentes pesados
const AirdropHeroSection = lazy(() => import('./AirdropHeroSection'));
const AirdropInfoTabs = lazy(() => import('./AirdropInfoTabs'));
const AirdropProcessSteps = lazy(() => import('./AirdropProcessSteps'));
const AirdropRegistrationSection = lazy(() => import('./AirdropRegistrationSection'));

// Componente de carga para Suspense
const LoadingPlaceholder = ({ height = '300px' }) => (
  <div 
    className="rounded-xl animate-pulse bg-purple-900/20 border border-purple-500/10 my-8"
    style={{ height }}
  />
);

// Componente para carga diferida basado en visibilidad
const LazySection = ({ component: Component, height = '300px', ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="w-full">
      {isVisible ? (
        <Suspense fallback={<LoadingPlaceholder height={height} />}>
          <Component {...props} />
        </Suspense>
      ) : (
        <LoadingPlaceholder height={height} />
      )}
    </div>
  );
};

const AirdropDashboard = () => {
  const { account } = useContext(WalletContext);
  // Comentar temporalmente esta línea que causa error
  // const { airdropData } = useAirdropData(account);
  const [activeTab, setActiveTab] = useState('about');
  
  return (
    <AnimationProvider>
      <div className="min-h-screen bg-nuvo-gradient pt-24 pb-16">
        <SpaceBackground customClass="" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sección Hero - Carga inmediata por ser visible */}
          <Suspense fallback={<LoadingPlaceholder height="250px" />}>
            <AirdropHeroSection setActiveTab={setActiveTab} />
          </Suspense>
          
          {/* Pestañas de Información - Carga diferida */}
          <LazySection 
            component={AirdropInfoTabs} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            height="600px"
          />
          
          {/* Pasos del Proceso - Carga diferida */}
          <LazySection 
            component={AirdropProcessSteps}
            height="350px" 
          />
          
          {/* Sección de Registro - Carga diferida */}
          <LazySection 
            component={AirdropRegistrationSection}
            height="450px" 
          />
        </div>
      </div>
    </AnimationProvider>
  );
};

export default memoWithName(AirdropDashboard);