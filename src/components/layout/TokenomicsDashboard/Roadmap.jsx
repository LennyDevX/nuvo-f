// src/components/layout/TokenomicsDashboard/Roadmap.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaUsers, FaChartLine, FaShieldAlt, FaCode } from 'react-icons/fa';

const Roadmap = () => {
  const roadmapItems = [
    {
      quarter: 'Q4 2024',
      title: 'Protocol Launch',
      icon: <FaRocket className="text-purple-400 text-2xl" />,
      goals: [
        'Smart Contract Deployment on Polygon',
        'CertiK Security Audit',
        'Initial Liquidity Pool Setup',
        'Community Building Phase'
      ],
      status: 'in-progress'
    },
    {
      quarter: 'Q1 2025',
      title: 'Expansion Phase',
      icon: <FaUsers className="text-purple-400 text-2xl" />,
      goals: [
        'Launch of NFT Benefits Program',
        'Implementation of Time-Bonus System',
        'Partnership Development',
        'Marketing Campaign Kickoff'
      ],
      status: 'planned'
    },
    {
      quarter: 'Q2 2025',
      title: 'Protocol Enhancement',
      icon: <FaChartLine className="text-purple-400 text-2xl" />,
      goals: [
        'Advanced Yield Strategies Implementation',
        'Automated Portfolio Management',
        'Treasury Diversification',
        'Community DAO Launch'
      ],
      status: 'planned'
    },
    {
      quarter: 'Q3 2025',
      title: 'Security & Scaling',
      icon: <FaShieldAlt className="text-purple-400 text-2xl" />,
      goals: [
        'Multi-signature Implementation',
        'Cross-chain Integration Research',
        'Additional Security Audits',
        'Yield Strategy Optimization'
      ],
      status: 'planned'
    },
    {
      quarter: 'Q4 2025',
      title: 'Advanced Features',
      icon: <FaCode className="text-purple-400 text-2xl" />,
      goals: [
        'Governance System Implementation',
        'Advanced Trading Bot Integration',
        'DeFi Protocol Partnerships',
        'Protocol V2 Development'
      ],
      status: 'planned'
    }
  ];

  return (
    <div className="bg-black/30 rounded-xl p-8 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">Development Roadmap</h2>
      <div className="space-y-12">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={index}
            className="relative pl-8 border-l-2 border-purple-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="absolute -left-3 top-0">
              <div className="bg-purple-900/50 p-2 rounded-full border border-purple-500">
                {item.icon}
              </div>
            </div>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-purple-400">
                {item.quarter} - {item.title}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'in-progress' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {item.status === 'in-progress' ? 'In Progress' : 'Planned'}
              </span>
            </div>
            <ul className="list-none space-y-2 text-gray-300">
              {item.goals.map((goal, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  {goal}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;