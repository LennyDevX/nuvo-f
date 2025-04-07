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
  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-purple-700/10 to-black/30 rounded-3xl">
    <div className="text-purple-400">Loading...</div>
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
    <SpaceBackground customClass="opacity-80" />
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
            className="w-full pt-16 pb-6 md:pt-20 relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Section */}
              <div className="mb-16">
                <Suspense fallback={<LoadingFallback />}>
                  <HeroSection onOpenTokenModal={handleOpenTokenModal} />
                </Suspense>
              </div>

              {/* Supply Tracker */}
              <div className="mb-8">
                <Suspense fallback={<LoadingFallback />}>
                  <SupplyTracker />
                </Suspense>
              </div>
              
              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                <Suspense fallback={<LoadingFallback />}>
                  <TokenDistribution />
                </Suspense>
                <Suspense fallback={<LoadingFallback />}>
                  <RevenueStreams />
                </Suspense>
              </div>

              {/* Key Metrics */}
              <Suspense fallback={<LoadingFallback />}>
              </Suspense>

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
        />
      </AnimationProvider>
    </MainLayout>
  );
};

export default React.memo(TokenomicsDashboard);