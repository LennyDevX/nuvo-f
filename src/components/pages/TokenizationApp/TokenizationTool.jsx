import React from 'react';
import { motion } from 'framer-motion';
import SpaceBackground from '../../effects/SpaceBackground';
import { TokenizationProvider } from '../../../context/TokenizationContext';
import CaptureStep from './steps/CaptureStep';
import MetadataStep from './steps/MetadataStep';
import PreviewStep from './steps/PreviewStep';
import SuccessStep from './steps/SuccessStep';
import { useTokenization } from '../../../context/TokenizationContext';

// Step renderer component
const StepRenderer = () => {
  const { currentStep } = useTokenization();
  
  switch (currentStep) {
    case 'capture':
      return <CaptureStep />;
    case 'metadata':
      return <MetadataStep />;
    case 'preview':
      return <PreviewStep />;
    case 'success':
      return <SuccessStep />;
    default:
      return null;
  }
};

const TokenizationToolContent = () => {
  return (
    <div className="relative bg-nuvo-gradient min-h-screen pt-20 pb-16">
      {/* Simple background without stars */}
      <SpaceBackground customClass="opacity-90" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-900/50 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
                Physical Asset Tokenization
              </h1>
              <p className="text-gray-300 mt-2">
                Transform your real-world items into verifiable digital assets on the blockchain
              </p>
            </div>
            
            <StepRenderer />
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