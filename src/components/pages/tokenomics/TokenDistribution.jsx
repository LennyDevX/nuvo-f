import React, { useState, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import InteractiveDataDisplay from '../../ui/InteractiveDataDisplay';

const nftUtilityData = [
  { name: 'DeFi Access', value: 30, colorKey: 'purple' },
  { name: 'Creator Tools', value: 25, colorKey: 'blue' },
  { name: 'Exclusive Content', value: 20, colorKey: 'green' },
  { name: 'Community Benefits', value: 15, colorKey: 'amber' },
  { name: 'Physical Rewards', value: 10, colorKey: 'pink' },
];

const nftUtilityDetails = {
  'DeFi Access': 'Unlock powerful financial tools within our creator-focused DeFi ecosystem.',
  'Creator Tools': 'Access a suite of proprietary tools to create, manage, and monetize your digital assets.',
  'Exclusive Content': 'Gain entry to limited content, early releases, and unique digital experiences.',
  'Community Benefits': 'Participate in governance, join exclusive channels, and collaborate with other creators.',
  'Physical Rewards': 'Redeem your NFT for limited-edition merchandise, event tickets, and more.',
};

const UtilitySpectrum = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const selectedCategory = activeIndex !== null ? nftUtilityData[activeIndex] : null;

  // Memoize key points content with specific colors for each element
  const keyPointsItems = [
    { color: 'text-purple-400', text: 'NFTs act as a key to the ecosystem' },
    { color: 'text-blue-400', text: 'Access to creator-focused DeFi tools' },
    { color: 'text-green-400', text: 'Monetize digital and physical work' },
    { color: 'text-amber-400', text: 'Join a collaborative community' },
    { color: 'text-pink-400', text: 'Unlock exclusive real-world rewards' },
    { color: 'text-purple-300', text: 'All collections share the same benefits' },
  ];

  const keyPointsContent = useMemo(() => (
    <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
      {keyPointsItems.map((item, idx) => (
        <li key={item.text} className="flex items-center space-x-2 hover:text-purple-300 transition-colors">
          <span className={item.color}>•</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  ), []);

  return (
    <m.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex-grow w-full">
          <h2 className="text-xl font-bold text-white mb-4 tracking-wide">NFT Utility Spectrum</h2>
          <InteractiveDataDisplay 
            data={nftUtilityData}
            onSelectItem={setActiveIndex}
          />
        </div>
        
        <div className="w-full md:w-[220px] md:min-w-[220px] flex-shrink-0">
          <h3 className="text-base font-bold text-white mb-2 md:text-left opacity-80">Details</h3>
          <div className="bg-[#1a1333]/50 border border-purple-500/20 rounded-lg p-3 transition-all h-[120px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <m.div 
                  key={selectedCategory.name}
                  initial={{opacity: 0, y: 10}} 
                  animate={{opacity: 1, y: 0}} 
                  exit={{opacity: 0, y: -10}}
                  transition={{duration: 0.2}}
                >
                  <div className="text-sm text-purple-300 font-bold">{selectedCategory.name}</div>
                  <div className="text-lg font-extrabold text-white">{selectedCategory.value}%</div>
                  <div className="text-xs text-gray-300 opacity-80 line-clamp-3">
                    {nftUtilityDetails[selectedCategory.name] || ""}
                  </div>
                </m.div>
              ) : (
                <m.div 
                  key="placeholder"
                  initial={{opacity: 0}} 
                  animate={{opacity: 1}} 
                  exit={{opacity: 0}}
                  className="text-sm text-gray-400"
                >
                  Hover over an item to see details.
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-3 tracking-wide">
          Key Benefits
        </h3>
        {keyPointsContent}
      </div>
    </m.div>
  );
};

export default React.memo(UtilitySpectrum);
           