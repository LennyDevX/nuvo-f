import React from 'react';
import { FaChartLine, FaTools, FaRobot, FaArrowRight } from 'react-icons/fa';

const AITool = ({ title, description, icon: Icon, link }) => (
  <div className="p-8 rounded-xl nuvos-card 
       hover:border-purple-500/50 transition-all duration-300
       hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6] backdrop-blur-sm">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 rounded-lg bg-purple-500/20 transform hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-2xl font-semibold text-white bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
        {title}
      </h3>
    </div>
    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{description}</p>
    {link && (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 
                 transition-colors group text-lg"
      >
        Learn more
        <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
      </a>
    )}
  </div>
);

const FeatureCards = () => {
  const aiTools = [
    {
      title: "Reward Optimizer",
      description: "AI-powered tool to help you optimize your staking strategy and maximize your NUVOS rewards.",
      icon: FaChartLine,
      link: "#reward-optimizer"
    },
    {
      title: "Trading Assistant",
      description: "Smart analysis and recommendations for NUVOS token trading based on market conditions.",
      icon: FaTools,
      link: "#trading-assistant"
    },
    {
      title: "Community Insights",
      description: "AI-driven analysis of community sentiment and trending topics in the NUVOS ecosystem.",
      icon: FaRobot,
      link: "#community-insights"
    }
  ];

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      style={{ perspective: '1000px' }}
    >
      {aiTools.map((tool, index) => (
        <div
          key={index}
          className="transform hover:scale-105 transition-transform duration-300"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <AITool {...tool} />
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
