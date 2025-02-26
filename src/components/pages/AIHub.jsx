import React from 'react';
import { FaRobot, FaTools, FaChartLine } from 'react-icons/fa';

const AITool = ({ title, description, icon: Icon, link }) => (
  <div className="p-8 rounded-xl bg-purple-900/20 border border-purple-500/30 
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
        <FaChartLine className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
      </a>
    )}
  </div>
);

const AIHub = () => {
  const aiTools = [
    {
      title: "Reward Optimizer",
      description: "AI-powered tool to help you optimize your staking strategy and maximize your NUVO rewards.",
      icon: FaChartLine,
      link: "#"
    },
    {
      title: "Trading Assistant",
      description: "Smart analysis and recommendations for NUVO token trading based on market conditions.",
      icon: FaTools,
      link: "#"
    },
    {
      title: "Community Insights",
      description: "AI-driven analysis of community sentiment and trending topics in the NUVO ecosystem.",
      icon: FaRobot,
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            NUVO AI Hub
          </span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 rounded-full" />
        <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
          Enhance your NUVO experience with our cutting-edge AI tools. 
          Optimize your rewards, improve your trading, and stay ahead of the curve.
        </p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        style={{
          perspective: '1000px'
        }}
      >
        {aiTools.map((tool, index) => (
          <div
            key={index}
            className="transform hover:scale-105 transition-transform duration-300"
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <AITool {...tool} />
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 transform hover:scale-[1.02] transition-transform duration-300">
        <h2 className="text-3xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          Coming Soon
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          We're constantly developing new AI tools to enhance the NUVO ecosystem. 
          Stay tuned for more innovative features and capabilities.
        </p>
      </div>
    </div>
  );
};

// Add this to your CSS or Tailwind config
const styles = {
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  '.animate-fade-in': {
    animation: 'fadeIn 0.6s ease-out forwards'
  }
};

export default AIHub;
