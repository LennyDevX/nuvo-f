import React, { useState, useEffect, useMemo } from 'react';
import { m } from 'framer-motion';
import { FaUsers, FaChartLine, FaLayerGroup, FaRocket, FaExchangeAlt, FaCalendarAlt, FaLightbulb, FaCheckCircle, FaTrophy, FaGlobe, FaCog, FaShieldAlt } from 'react-icons/fa';

const KeyMetrics = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const ecosystemServices = useMemo(() => [
    { name: "Cloud Storage", status: "Active", date: "Live" },
    { name: "Staking Rewards", status: "Active", date: "Live" },
    { name: "NFT Marketplace", status: "Coming Soon", date: "Q2 2025" },
    { name: "DeFi Integration", status: "Planned", date: "Q4 2025" },
    { name: "Enterprise Tools", status: "Roadmap", date: "2026" }
  ], []);

  const getStatusClass = useMemo(() => (status) => {
    switch (status) {
      case 'Active': return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'Coming Soon': return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      default: return 'bg-purple-900/30 text-purple-300 border border-purple-500/30';
    }
  }, []);

  const VisionCard = useMemo(() => (
    <div className="col-span-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 sm:p-5 border border-purple-500/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/30 rounded-lg mr-3">
          <FaLightbulb className="text-purple-300 text-lg" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-base sm:text-lg">Building the Future of Decentralized Cloud</h3>
          <p className="text-gray-300 text-xs sm:text-sm mt-1">Transforming cloud infrastructure with blockchain technology</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-400 mr-2 text-sm" />
            <h4 className="text-white font-medium text-sm">Decentralization</h4>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">Distributed cloud infrastructure resistant to censorship</p>
        </div>
        <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaTrophy className="text-yellow-400 mr-2 text-sm" />
            <h4 className="text-white font-medium text-sm">Sustainability</h4>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">Building tools for seamless asset tokenization and ecosystem growth</p>
        </div>
        <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaGlobe className="text-blue-400 mr-2 text-sm" />
            <h4 className="text-white font-medium text-sm">Global Adoption</h4>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">Platform foundation for tokenized assets and web3 ecosystem integration</p>
        </div>
      </div>
    </div>
  ), []);

  const TokenEconomicsCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
          <FaExchangeAlt className="text-purple-400 text-xs sm:text-sm" />
        </div>
        <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base">Token Economics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
        <div className="bg-black/40 p-1.5 sm:p-2 rounded-md border border-purple-500/10">
          <p className="text-gray-400 text-xs">Total Supply</p>
          <p className="text-white font-medium text-xs sm:text-sm">21,000,000</p>
        </div>
        <div className="bg-black/40 p-1.5 sm:p-2 rounded-md border border-purple-500/10">
          <p className="text-gray-400 text-xs">Circulating</p>
          <p className="text-white font-medium text-xs sm:text-sm">1,000,000</p>
        </div>
        <div className="bg-black/40 p-1.5 sm:p-2 rounded-md border border-purple-500/10">
          <p className="text-gray-400 text-xs">Network</p>
          <p className="text-white font-medium text-xs sm:text-sm">Polygon</p>
        </div>
        <div className="bg-black/40 p-1.5 sm:p-2 rounded-md border border-purple-500/10">
          <p className="text-gray-400 text-xs">Type</p>
          <p className="text-white font-medium text-xs sm:text-sm">ERC-20</p>
        </div>
      </div>
    </div>
  ), []);

  const UtilityCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
          <FaChartLine className="text-purple-400 text-xs sm:text-sm" />
        </div>
        <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base">Utility Growth</h3>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {['Current', 'Q2 2025', 'Q4 2025'].map((period, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{period}</span>
              <span className="text-purple-300 text-xs">
                {period === 'Current' ? '15%' : period === 'Q2 2025' ? '45%' : '85%'}
              </span>
            </div>
            <div className="h-1 sm:h-1.5 bg-gray-800 rounded-full">
              <div 
                className="h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000" 
                style={{ 
                  width: period === 'Current' ? '15%' : period === 'Q2 2025' ? '45%' : '85%'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ), []);

  const ServicesCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
          <FaLayerGroup className="text-purple-400 text-xs sm:text-sm" />
        </div>
        <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base">Ecosystem Services</h3>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {ecosystemServices.map((service, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex-1 min-w-0 truncate mr-2">{service.name}</span>
            <div className="flex items-center">
              <span className="text-gray-400 mr-1 text-xs hidden sm:inline">{service.date}</span>
              <span className={`text-xs px-1 py-0.5 rounded-full ${getStatusClass(service.status)}`}>
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [ecosystemServices, getStatusClass]);

  const TimelineCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
          <FaRocket className="text-purple-400 text-xs sm:text-sm" />
        </div>
        <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base">Development Timeline</h3>
      </div>
      
      <div className="space-y-2 sm:space-y-3 text-xs">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-2 sm:mr-3 flex-shrink-0"></div>
          <div className="min-w-0">
            <p className="text-green-400 font-medium text-xs">Platform Launch (Q2 2023)</p>
            <p className="text-gray-400 text-xs hidden sm:block">Core infrastructure and token deployment</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mr-2 sm:mr-3 flex-shrink-0"></div>
          <div className="min-w-0">
            <p className="text-blue-400 font-medium text-xs">Service Expansion (2024)</p>
            <p className="text-gray-400 text-xs hidden sm:block">Enhanced storage and reward programs</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 mr-2 sm:mr-3 flex-shrink-0"></div>
          <div className="min-w-0">
            <p className="text-purple-300 font-medium text-xs">NFT Marketplace (Q2 2025)</p>
            <p className="text-gray-400 text-xs hidden sm:block">Integrated marketplace with ecosystem utility</p>
          </div>
        </div>
      </div>
    </div>
  ), []);

  const AdoptionCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-center mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
          <FaUsers className="text-purple-400 text-xs sm:text-sm" />
        </div>
        <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base">Growth Metrics</h3>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Active Users</span>
            <span className="text-purple-300">2,500+</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-gray-800 rounded-full">
            <div className="h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '8%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">2025 Target</span>
            <span className="text-purple-300">25,000+</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-gray-800 rounded-full">
            <div className="h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '35%' }} />
          </div>
        </div>
      </div>
    </div>
  ), []);

  return (
    <m.div
      className="mx-2 sm:mx-4 nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 lg:mb-6">
        <div className="min-w-0 mb-2 sm:mb-0">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white 
                         bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Ecosystem Metrics & Roadmap
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Expanding cloud utilities with blockchain technology and real-world tokenization
          </p>
        </div>
        <div className="bg-purple-900/30 px-2 sm:px-3 py-1 rounded-md border border-purple-500/20 flex-shrink-0 self-start sm:self-auto">
          <span className="text-xs text-purple-300">Status: <span className="text-green-400 font-medium">Active Development</span></span>
        </div>
      </div>

      {VisionCard}
      
      {/* Optimized grid layout: 2 columns on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4 lg:mt-6">
        {TokenEconomicsCard}
        {UtilityCard}
        {ServicesCard}
        {TimelineCard}
        {AdoptionCard}
      </div>
      
      <div className="mt-3 sm:mt-4 lg:mt-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3 sm:p-4 border border-blue-500/30">
        <div className="flex items-start">
          <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
            <FaShieldAlt className="text-blue-400 text-xs sm:text-sm" />
          </div>
          <div className="min-w-0">
            <h3 className="text-blue-300 font-medium text-sm sm:text-base">Strategic Focus</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Building robust infrastructure and real utility before pursuing exchange listings. This approach ensures genuine value and long-term sustainability.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 sm:mt-3">
              <div className="bg-black/30 p-2 sm:p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-xs font-medium">Infrastructure</h4>
                <p className="text-gray-500 text-xs mt-1">System stability and security improvements</p>
              </div>
              <div className="bg-black/30 p-2 sm:p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-xs font-medium">Community</h4>
                <p className="text-gray-500 text-xs mt-1">User base expansion and engagement programs</p>
              </div>
              <div className="bg-black/30 p-2 sm:p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-xs font-medium">Development</h4>
                <p className="text-gray-500 text-xs mt-1">Feature implementation based on user feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default React.memo(KeyMetrics);
