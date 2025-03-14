import React, { useState } from 'react';
import HeroSection from './Carrousel';
import { motion } from 'framer-motion';

const roadmapData = {
  "2024": {
    "Q1": [
      {
        title: "Protocol Development",
        icon: "🔧",
        status: "Completed",
        progress: 100,
        phase: "Foundation Phase",
        items: [
          { text: "Smart Staking Contract v1", status: "completed", date: "Jan 2024" },
          { text: "Testing & Security Audit", status: "completed", date: "Jan 2024" },
          { text: "Deployment on Polygon Network", status: "completed", date: "Feb 2024" },
          { text: "Yield Optimization Strategy", status: "completed", date: "Feb 2024" },
          { text: "Smart Contract Integration", status: "completed", date: "Mar 2024" },
          { text: "Cross-chain Bridge Research", status: "completed", date: "Mar 2024" }
        ]
      }
    ],
    "Q2": [
      {
        title: "Project Inception",
        icon: "🚀",
        status: "Completed",
        progress: 100,
        phase: "Foundation Phase",
        items: [
          { text: "Initial Planning & Research", status: "completed", date: "Apr 2024" },
          { text: "Capital Funds & Tokenomics", status: "completed", date: "Apr 2024" },
          { text: "Technical Architecture Design", status: "completed", date: "May 2024" },
          { text: "Liquidity Pool Strategy", status: "completed", date: "May 2024" },
          { text: "Token Distribution Model", status: "completed", date: "Jun 2024" },
          { text: "Governance Framework Design", status: "completed", date: "Jun 2024" }
        ]
      }
    ],
    "Q3": [
      {
        title: "Nuvo Development",
        icon: "⚡",
        status: "Completed",
        progress: 100,
        phase: "Development Phase",
        items: [
          { text: "Alpha v1 Platform Release", status: "completed", date: "Jul 2024" },
          { text: "Frontend Implementation", status: "completed", date: "Jul 2024" },
          { text: "Smart Contract Optimization", status: "completed", date: "Aug 2024" },
          { text: "DeFi Integration Framework", status: "completed", date: "Aug 2024" },
          { text: "Yield Aggregator Development", status: "completed", date: "Sep 2024" },
          { text: "Security Testing & Audit", status: "completed", date: "Sep 2024" }
        ]
      }
    ],
    "Q4": [
      {
        title: "Beta Live Launch",
        icon: "🌟",
        status: "completed",
        progress: 100,
        phase: "Launch Phase",
        items: [
          { text: "Beta Platform Launch", status: "completed", date: "Oct 2024" },
          { text: "Beta Mining Program", status: "completed", date: "Oct 2024" },
          { text: "Community Testing Phase", status: "completed", date: "Nov 2024" },
          { text: "Initial research Nuvo-Token", status: "completed", date: "Nov 2024" },
          { text: "Platform Optimization", status: "completed", date: "Dec 2024" },
          { text: "Fixed all bugs", status: "completed", date: "Dec 2024" }
        ]
      }
    ]
  },
  "2025": {
    "Q1": [
      {
        title: "Stable Phase Foundation",
        icon: "🏗️",
        status: "Active",
        progress: 75,
        phase: "Foundation Phase",
        items: [
          { text: "Develop core infrastructure for stability", status: "completed", date: "Jan 2025" },
          { text: "Create initial marketing campaigns", status: "completed", date: "Feb 2025" },
          { text: "Revise tokenomics for improvements", status: "in-progress", date: "Mar 2025" }
        ]
      }
    ],
    "Q2": [
      {
        title: "NFT & UI/UX Development",
        icon: "🎨",
        status: "Planned",
        progress: 0,
        phase: "Innovation Phase",
        items: [
          { text: "Develop NFT system for digital products", status: "pending", date: "Apr 2025" },
          { text: "Implement enhanced UI/UX designs", status: "pending", date: "May 2025" },
          { text: "Integrate components for real digital benefits", status: "pending", date: "Jun 2025" }
        ]
      }
    ],
    "Q3": [
      {
        title: "Smart Staking 2.0 & Expansion",
        icon: "🚀",
        status: "Planned",
        progress: 0,
        phase: "Scaling Phase",
        items: [
          { text: "Launch Smart Staking 2.0", status: "pending", date: "Jul 2025" },
          { text: "Prepare advanced marketing strategies", status: "pending", date: "Aug 2025" },
          { text: "Initiate token launch and add liquidity", status: "pending", date: "Sep 2025" }
        ]
      }
    ],
    "Q4": [
      {
        title: "Marketing & Post-Launch Optimization",
        icon: "📈",
        status: "Planned",
        progress: 0,
        phase: "Growth Phase",
        items: [
          { text: "Expand marketing campaigns", status: "pending", date: "Oct 2025" },
          { text: "Optimize platform after token launch", status: "pending", date: "Nov 2025" },
          { text: "Implement further tokenomics revisions", status: "pending", date: "Dec 2025" }
        ]
      }
    ]
  }
};

// Actualizar las métricas en los datos
Object.keys(roadmapData).forEach(year => {
  Object.keys(roadmapData[year]).forEach(quarter => {
    roadmapData[year][quarter].forEach(item => {
      item.metrics = [
        "User Engagement: " + (item.status === "Completed" ? "✓ Achieved" : "In Progress"),
        "Development Milestones: " + item.progress + "%",
        "Community Growth: " + (item.status === "Completed" ? "Strong" : "Growing"),
      ];
    });
  });
});

const Roadmap = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  // Validación de datos
  const currentQuarterData = roadmapData[selectedYear]?.[selectedQuarter] || [];

  return (
    <div className="min-h-screen bg-nuvo-gradient relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
      <div className="relative">
        <HeroSection />
        
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="mb-8 sm:mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Development Roadmap
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              Track our progress and upcoming milestones
            </p>
          </div>

          {/* Selector de Año y Trimestre */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <div className="flex justify-center gap-2">
              {["2024", "2025"].map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedYear === year 
                      ? "bg-purple-600 text-white" 
                      : "bg-black/20 text-gray-400 hover:bg-purple-900/30"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {["Q1", "Q2", "Q3", "Q4"].map(quarter => (
                <button
                  key={quarter}
                  onClick={() => setSelectedQuarter(quarter)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedQuarter === quarter 
                      ? "bg-purple-600 text-white" 
                      : "bg-black/20 text-gray-400 hover:bg-purple-900/30"
                  }`}
                >
                  {quarter}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline View */}
          <div className="relative mt-12">
            <div className="absolute left-4 sm:left-1/2 h-full w-px bg-purple-500/20" />
            
            <div className="space-y-8 sm:space-y-12">
              {currentQuarterData.map((item, index) => (
                <TimelineItem item={item} index={index} key={index} />
              ))}
            </div>

            {/* Empty State */}
            {currentQuarterData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No roadmap items available for this period yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ item, index }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"
  >
    {/* Card Principal */}
    <div className={`ml-8 sm:ml-0 bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20
      ${index % 2 === 0 ? 'sm:mr-8' : 'sm:ml-8 sm:col-start-2'}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{item.icon}</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{item.title}</h3>
          <p className="text-sm text-purple-300">{item.phase}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-purple-900/30 rounded-full mb-4">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${item.progress}%` }}
        />
      </div>

      {/* Items List */}
      <ul className="space-y-3">
        {item.items.map((subItem, i) => (
          <li key={i} className="flex items-center gap-3 text-sm sm:text-base">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              subItem.status === 'completed' ? 'bg-green-500' :
              subItem.status === 'in-progress' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} />
            <span className="text-gray-300 flex-1">{subItem.text}</span>
            <span className="text-xs text-purple-400">{subItem.date}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Contenido Complementario Actualizado */}
    <div className={`hidden sm:block ${index % 2 === 0 ? 'sm:col-start-2' : ''}`}>
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/10">
        <h4 className="text-lg font-semibold text-purple-400 mb-3">
          Phase Objectives
        </h4>
        
        {/* Strategic Focus */}
        <div className="mb-4">
          <span className="text-xs font-medium text-purple-300">STRATEGIC FOCUS</span>
          <div className="mt-1 text-sm text-gray-300">
            {item.status === "Completed" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Phase Completed Successfully
              </div>
            ) : item.status === "Active" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                In Active Development
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Planning & Preparation
              </div>
            )}
          </div>
        </div>

        {/* Key Deliverables */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-purple-300">KEY DELIVERABLES</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-900/20 rounded-lg p-2">
              <div className="text-xs text-purple-200">Progress</div>
              <div className="text-lg font-semibold text-white">{item.progress}%</div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-2">
              <div className="text-xs text-purple-200">Timeline</div>
              <div className="text-lg font-semibold text-white">{item.items[0].date.split(' ')[0]}</div>
            </div>
          </div>
        </div>

        {/* Development Status */}
        <div className="mt-4">
          <span className="text-xs font-medium text-purple-300">PHASE IMPACT</span>
          <div className="mt-1 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-1 h-1 rounded-full bg-purple-500"></span>
              {item.status === "Completed" ? "Milestone Achieved" : 
               item.status === "Active" ? "Development in Progress" : "Future Implementation"}
            </div>
            <div className="flex items-center gap-2 text-gray-300 mt-1">
              <span className="w-1 h-1 rounded-full bg-purple-500"></span>
              {`Phase ${item.progress >= 100 ? "Completed" : 
                item.progress > 0 ? "In Progress" : "Not Started"}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default Roadmap;