import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import InteractiveDataDisplay from '../../ui/InteractiveDataDisplay';

const ecosystemValueData = [
  { name: 'Primary Sales', value: 40, colorKey: 'blue' },
  { name: 'Secondary Royalties', value: 30, colorKey: 'green' },
  { name: 'Platform Fees', value: 20, colorKey: 'amber' },
  { name: 'Partnerships', value: 10, colorKey: 'purple' },
];

const ecosystemValueDetails = {
  'Primary Sales': 'Revenue from the initial minting of NFTs in each seasonal collection.',
  'Secondary Royalties': 'A percentage of every secondary market sale is reinvested into the ecosystem.',
  'Platform Fees': 'Fees from utilizing advanced features and tools within the Nuvos Cloud platform.',
  'Partnerships': 'Collaborations with brands and other projects that bring value to the ecosystem.',
};

const EcosystemValueFlow = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const selectedCategory = activeIndex !== null ? ecosystemValueData[activeIndex] : null;
  
  // Strategy items array
  const strategyItems = [
    { color: 'text-blue-400', text: 'Fuel growth via primary sales' },
    { color: 'text-green-400', text: 'Fund development with royalties' },
    { color: 'text-amber-400', text: 'Enhance platform via fees' },
    { color: 'text-purple-400', text: 'Expand utility with partnerships' },
    { color: 'text-pink-500', text: 'Long-term value for holders' },
    { color: 'text-pink-400', text: 'Sustainable ecosystem model' },
  ];

  // Memoize strategy list for consistent rendering
  const strategyList = useMemo(() => (
    <ul className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-300">
      {strategyItems.map((item, idx) => (
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
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex-grow w-full">
          <h2 className="text-xl font-bold text-white mb-4">Ecosystem Value Flow</h2>
          <InteractiveDataDisplay 
            data={ecosystemValueData}
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
                    {ecosystemValueDetails[selectedCategory.name] || ""}
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
        <h3 className="text-xl font-semibold text-purple-400 mb-3">
          Value Strategy
        </h3>
        {strategyList}
      </div>
    </m.div>
  );
};

export default React.memo(EcosystemValueFlow);
     
