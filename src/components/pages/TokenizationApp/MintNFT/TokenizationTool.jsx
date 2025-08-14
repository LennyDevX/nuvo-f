import React from 'react';
import { motion } from 'framer-motion';
import SpaceBackground from '../../../effects/SpaceBackground';
import { TokenizationProvider } from '../../../../context/TokenizationContext';
import UploadImageStep from './UploadImageStep';
import MetadataStep from './MetadataStep';
import PreviewStep from './PreviewStep';
import SuccessStep from './SuccessStep';
import { useTokenization } from '../../../../context/TokenizationContext';

// Step renderer component
const StepRenderer = () => {
  const { currentStep } = useTokenization();
  
  // Fade variants for smooth transitions between steps
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  return (
    <motion.div
      key={currentStep}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]" // Responsive height
    >
      {(() => {
        switch (currentStep) {
          case 'upload':
            return <UploadImageStep />;
          case 'metadata':
            return <MetadataStep />;
          case 'preview':
            return <PreviewStep />;
          case 'success':
            return <SuccessStep />;
          default:
            return null;
        }
      })()}
    </motion.div>
  );
};

// Hero section component - optimized for top placement
const HeroSection = () => {
  const { currentStep } = useTokenization();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4 sm:mb-6 lg:mb-8"
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-nuvo-gradient-text bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4">
        NUVOS Official NFT
      </h1>
      <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-3 sm:mb-4 lg:mb-6 px-2">
        Create your verified digital asset with exclusive benefits
      </p>
      
      {/* Benefits grid - more compact for top placement */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-3xl lg:max-w-4xl mx-auto px-2">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-500/20">
          <div className="text-purple-400 text-lg sm:text-xl lg:text-2xl mb-1">🏆</div>
          <div className="text-xs sm:text-sm lg:text-base text-white font-medium">Staking</div>
          <div className="text-[10px] sm:text-xs lg:text-sm text-gray-400">Earn rewards</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-blue-500/20">
          <div className="text-blue-400 text-lg sm:text-xl lg:text-2xl mb-1">🎁</div>
          <div className="text-xs sm:text-sm lg:text-base text-white font-medium">Airdrops</div>
          <div className="text-[10px] sm:text-xs lg:text-sm text-gray-400">Exclusive drops</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-green-500/20">
          <div className="text-green-400 text-lg sm:text-xl lg:text-2xl mb-1">👕</div>
          <div className="text-xs sm:text-sm lg:text-base text-white font-medium">Merch</div>
          <div className="text-[10px] sm:text-xs lg:text-sm text-gray-400">Special access</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4 border border-yellow-500/20">
          <div className="text-yellow-400 text-lg sm:text-xl lg:text-2xl mb-1">💎</div>
          <div className="text-xs sm:text-sm lg:text-base text-white font-medium">Skills</div>
          <div className="text-[10px] sm:text-xs lg:text-sm text-gray-400">Level up</div>
        </div>
      </div>
    </motion.div>
  );
};

// Progress indicator component - optimized for bottom placement
const ProgressIndicator = () => {
  const { currentStep, setCurrentStep, isMinting } = useTokenization();
  const steps = ['upload', 'metadata', 'preview', 'success'];
  const currentIndex = steps.indexOf(currentStep);
  
  // Labels for the steps - shorter for mobile
  const stepLabels = {
    'upload': 'Capture',
    'metadata': 'Details',
    'preview': 'Review',
    'success': 'Complete'
  };

  // Mobile labels (shorter)
  const mobileStepLabels = {
    'upload': 'Upload',
    'metadata': 'Info',
    'preview': 'Review',
    'success': 'Done'
  };
  
  // Handle navigation between steps
  const handleStepClick = (step, index) => {
    // Don't allow navigation when minting is in progress
    if (isMinting) return;
    
    // Don't allow clicking forward, only back
    if (index > currentIndex) return;
    
    // Don't allow going back from success step
    if (currentStep === 'success') return;
    
    setCurrentStep(step);
  };

  return (
    <div className="mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 lg:pt-8 border-t border-purple-500/20">
      <div className="flex items-center justify-between max-w-sm sm:max-w-md lg:max-w-xl mx-auto px-2 sm:px-0">
        {steps.map((step, index) => (
          <div 
            key={step}
            className="flex flex-col items-center relative flex-1"
          >
            {/* Progress line - responsive */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-3 sm:top-4 lg:top-5 h-0.5 sm:h-1 left-1/2 right-0 transform translate-x-1/2
                ${index < currentIndex ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'} 
                transition-all duration-300`}
                style={{ width: 'calc(100% - 20px)' }}
              />
            )}
            
            {/* Step circle - responsive and touch-friendly */}
            <button 
              onClick={() => handleStepClick(step, index)}
              disabled={index > currentIndex || isMinting || currentStep === 'success'}
              className={`relative z-10 flex items-center justify-center 
                w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14
                rounded-full touch-manipulation
                ${index <= currentIndex ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'}
                ${index < currentIndex && !(isMinting || currentStep === 'success') ? 'cursor-pointer hover:ring-2 hover:ring-purple-400 active:scale-95' : ''}
                transition-all duration-300 mb-2 sm:mb-3`}
              aria-label={`Go to ${stepLabels[step]} step`}
            >
              {index < currentIndex ? (
                <span className="text-white text-xs sm:text-sm lg:text-base xl:text-lg">✓</span>
              ) : (
                <span className="text-white text-xs sm:text-sm lg:text-base xl:text-lg font-medium">{index + 1}</span>
              )}
            </button>
            
            {/* Step label - responsive text */}
            <span className={`text-[10px] sm:text-xs lg:text-sm xl:text-base text-center px-1
              ${index === currentIndex ? 'text-purple-300 font-medium' : 'text-gray-400'}`}>
              <span className="hidden sm:inline">{stepLabels[step]}</span>
              <span className="sm:hidden">{mobileStepLabels[step]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TokenizationToolContent = () => {
  return (
    <div className="relative bg-nuvo-gradient min-h-screen">
      <SpaceBackground />
      
      {/* Optimized container with title at top, progress at bottom */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 pt-2 sm:pt-4 pb-20 sm:pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto"
        >
          {/* Main content container */}
          <div className="p-2 sm:p-4 lg:p-6">
            {/* Hero section at the very top */}
            <HeroSection />
            
            {/* Step content in the middle */}
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <StepRenderer />
            </div>
            
            {/* Progress indicator at the bottom */}
            <ProgressIndicator />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main wrapper component
const AssetTokenizationTool = () => {
  return (
    <TokenizationProvider>
      <TokenizationToolContent />
    </TokenizationProvider>
  );
};

export default AssetTokenizationTool;