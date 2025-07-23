import React from 'react';
import { m } from 'framer-motion';

const colorClasses = {
  purple: { bg: 'bg-purple-500', text: 'text-purple-300' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-300' },
  green: { bg: 'bg-green-500', text: 'text-green-300' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-300' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-300' },
};

const InteractiveDataDisplay = ({ data, onSelectItem }) => {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <m.div
          key={item.name}
          className="p-3 rounded-lg border border-purple-500/20 cursor-pointer transition-all duration-300 hover:bg-purple-900/30 hover:border-purple-500/40"
          onMouseEnter={() => onSelectItem(index)}
          onMouseLeave={() => onSelectItem(null)}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white text-sm sm:text-base">{item.name}</span>
            <span className={`font-bold text-lg ${colorClasses[item.colorKey]?.text || 'text-gray-300'}`}>{item.value}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-800/50 overflow-hidden">
            <m.div
              className={`h-full rounded-full ${colorClasses[item.colorKey]?.bg || 'bg-gray-500'}`}
              initial={{ width: '0%' }}
              animate={{ width: `${item.value}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
            />
          </div>
        </m.div>
      ))}
    </div>
  );
};

export default InteractiveDataDisplay;
