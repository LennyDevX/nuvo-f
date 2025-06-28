import React from 'react';
import NetworkBadge from '../../web3/NetworkBadge';

const HeroSection = () => {
  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Minimal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-indigo-900/10 rounded-2xl blur-xl pointer-events-none" />

      {/* Mobile Layout: Vertical */}
      <div className="relative flex flex-col sm:hidden px-4 py-6 gap-4">
        {/* Title top */}
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text text-center">
          Smart Staking v1.0
        </h1>
        {/* Badges bottom - horizontal stack */}
        <div className="flex items-center justify-center gap-2">
          <NetworkBadge />
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 border border-slate-700/30 text-slate-300 text-xs rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
            <span>Live Protocol</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Horizontal */}
      <div className="relative hidden sm:flex items-start justify-between px-6 py-6">
        {/* Title top-left */}
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text">
          Smart Staking v1.0
        </h1>
        {/* Badge + Live Protocol top-right */}
        <div className="flex items-center gap-2">
          <NetworkBadge />
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 border border-slate-700/30 text-slate-300 text-xs rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
            <span>Live Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

