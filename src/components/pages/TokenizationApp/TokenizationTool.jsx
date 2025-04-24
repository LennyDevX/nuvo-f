import React from 'react';
import { motion } from 'framer-motion';
import SpaceBackground from '../../effects/SpaceBackground';
import { TokenizationProvider } from '../../../context/TokenizationContext';
import UploadImageStep from './steps/UploadImageStep';
import MetadataStep from './steps/MetadataStep';
import PreviewStep from './steps/PreviewStep';
import SuccessStep from './steps/SuccessStep';
import { useTokenization } from '../../../context/TokenizationContext';

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
      className="min-h-[450px]" // Ensure consistent height during transitions
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

// Progress indicator component
const ProgressIndicator = () => {
  const { currentStep, setCurrentStep, isMinting } = useTokenization();
  const steps = ['upload', 'metadata', 'preview', 'success'];
  const currentIndex = steps.indexOf(currentStep);
  
  // Labels for the steps
  const stepLabels = {
    'upload': 'Capture',
    'metadata': 'Details',
    'preview': 'Review',
    'success': 'Complete'
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
    <div className="mt-6 pt-4 border-t border-purple-500/20">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {steps.map((step, index) => (
          <div 
            key={step}
            className="flex flex-col items-center relative"
          >
            {/* Progress line */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-4 h-1 w-full left-1/2 
                ${index < currentIndex ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'} 
                transition-all duration-300`}
              />
            )}
            
            {/* Step circle - make it bigger and clickable */}
            <button 
              onClick={() => handleStepClick(step, index)}
              disabled={index > currentIndex || isMinting || currentStep === 'success'}
              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full 
                ${index <= currentIndex ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-700'}
                ${index < currentIndex && !(isMinting || currentStep === 'success') ? 'cursor-pointer hover:ring-2 hover:ring-purple-400' : ''}
                transition-all duration-300 mb-2`}
              aria-label={`Go to ${stepLabels[step]} step`}
            >
              {index < currentIndex ? (
                <span className="text-white text-sm">✓</span>
              ) : (
                <span className="text-white text-sm">{index + 1}</span>
              )}
            </button>
            
            {/* Step label */}
            <span className={`text-xs ${index === currentIndex ? 'text-purple-300 font-medium' : 'text-gray-400'}`}>
              {stepLabels[step]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TokenizationToolContent = () => {
  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-20 pb-16">
      <SpaceBackground customClass="opacity-50" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="nuvos-card p-8">
            {/* Removed the redundant title section */}
            <StepRenderer />
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