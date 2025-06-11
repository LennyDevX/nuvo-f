import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { m } from "framer-motion";
import MainLayout from '../../layout/MainLayout';
import TokenInfoModal from '../../modals/TokenInfoModal';
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground'; // Keep the import but use the simplified background
// Lazily load components for better performance
const TokenDistribution = lazy(() => import('./TokenDistribution'));
const RevenueStreams = lazy(() => import('./RevenueStreams'));
const HeroSection = lazy(() => import("./HeroSection"));
const SupplyTracker = lazy(() => import('./SupplyTracker'));
const TokenomicsExplanation = lazy(() => import('./TokenomicsExplanation'));

// Create loading fallback
const LoadingFallback = () => (
  <div className="w-full h-32 sm:h-48 flex items-center justify-center bg-gradient-to-b from-purple-700/10 to-black/30 rounded-2xl">
    <div className="text-purple-400 text-sm">Loading...</div>
  </div>
);

const TokenomicsDashboard = () => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Optimize modal handlers with useCallback
  const handleOpenTokenModal = useCallback(() => {
    setIsTokenModalOpen(true);
  }, []);

  const handleCloseTokenModal = useCallback(() => {
    setIsTokenModalOpen(false);
  }, []);

  // Memoize SpaceBackground component to prevent re-renders
  const backgroundComponent = useMemo(() => (
    <SpaceBackground customClass="" />
  ), []);

  return (
    <MainLayout showFooter={true}>
      <AnimationProvider>
        <div className="bg-nuvo-gradient relative">
          {backgroundComponent}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full pt-8 sm:pt-12 lg:pt-16 pb-4 relative z-10"
            key="tokenomics-dashboard-main"
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              {/* Hero Section */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <Suspense fallback={<LoadingFallback />}>
                  <HeroSection onOpenTokenModal={handleOpenTokenModal} />
                </Suspense>
              </div>

              {/* Supply Tracker */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <Suspense fallback={<LoadingFallback />}>
                  <SupplyTracker />
                </Suspense>
              </div>
              
              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                <Suspense fallback={<LoadingFallback />}>
                  <TokenDistribution />
                </Suspense>
                <Suspense fallback={<LoadingFallback />}>
                  <RevenueStreams />
                </Suspense>
              </div>

              

              {/* Tokenomics Explanation */}
              <Suspense fallback={<LoadingFallback />}>
                <TokenomicsExplanation />
              </Suspense>
            </div>
          </m.div>
        </div>

        {/* Token Info Modal - Now at the page level */}
        <TokenInfoModal 
          isOpen={isTokenModalOpen} 
          onClose={handleCloseTokenModal} 
          key="token-info-modal"
        />
      </AnimationProvider>
    </MainLayout>
  );
};

export default React.memo(TokenomicsDashboard);