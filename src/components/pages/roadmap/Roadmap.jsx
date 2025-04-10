import React, { useState } from 'react';
import SpaceBackground from '../../effects/SpaceBackground';
import HeroSection from './HeroSection';
import TimelineItem from './TimelineItem';
import QuarterSelector from './QuarterSelector';
import { roadmapData } from './roadmapData';

const Roadmap = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  // Validación de datos
  const currentQuarterData = roadmapData[selectedYear]?.[selectedQuarter] || [];

  return (
    <div className="min-h-screen relative">
      <SpaceBackground customClass="opacity-90" />
      <div className="relative z-10">
        <div className="pt-24 relative">
          {/* Hero Section with vision information */}
          <HeroSection />
          
          <div className="max-w-6xl mx-auto px-4 pb-20">
            {/* Year and Quarter Selector only */}
            <QuarterSelector 
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedQuarter={selectedQuarter}
              setSelectedQuarter={setSelectedQuarter}
            />

            {/* Timeline View with enhanced styling */}
            <div className="relative mt-12">
              <div className="absolute left-4 sm:left-1/2 h-full w-px bg-gradient-to-b from-purple-500/50 via-purple-600/30 to-purple-500/10" />
              
              <div className="space-y-10 sm:space-y-16">
                {currentQuarterData.map((item, index) => (
                  <TimelineItem item={item} index={index} key={index} />
                ))}
              </div>

              {/* Empty State with improved styling */}
              {currentQuarterData.length === 0 && (
                <div className="text-center py-16 bg-black/20 backdrop-blur-sm rounded-xl border border-purple-500/10">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-300 text-lg">No roadmap items available for this period yet.</p>
                  <p className="text-purple-400 text-sm mt-2">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;