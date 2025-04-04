import React, { useState } from "react";
import { m } from "framer-motion";
import MainLayout from '../../layout/MainLayout';
import TokenDistribution from './TokenDistribution';
import RevenueStreams from './RevenueStreams';
import HeroSection from "./HeroSection";
import KeyMetrics from './KeyMetrics';
import SupplyTracker from './SupplyTracker';
import TokenInfoModal from '../../modals/TokenInfoModal';
import TokenomicsExplanation from './TokenomicsExplanation';
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';

const TokenomicsDashboard = () => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  return (
    <MainLayout showFooter={true}>
      <AnimationProvider>
        <div className="bg-nuvo-gradient relative">
          <SpaceBackground customClass="opacity-80" />
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full pt-16 pb-6 md:pt-20 relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Hero Section */}
              <div className="mb-16">
                <HeroSection onOpenTokenModal={() => setIsTokenModalOpen(true)} />
              </div>

              {/* Supply Tracker */}
              <div className="mb-8">
                <SupplyTracker />
              </div>
              
              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                <TokenDistribution />
                <RevenueStreams />
              </div>

              {/* Key Metrics */}
              <KeyMetrics />

              {/* Tokenomics Explanation */}
              <TokenomicsExplanation />
            </div>
          </m.div>
        </div>

        {/* Token Info Modal - Now at the page level */}
        <TokenInfoModal 
          isOpen={isTokenModalOpen} 
          onClose={() => setIsTokenModalOpen(false)} 
        />
      </AnimationProvider>
    </MainLayout>
  );
};

export default TokenomicsDashboard;