import React from 'react';
import { m } from 'framer-motion';
import { FaLock, FaChartLine, FaVoteYea } from 'react-icons/fa';

const StakingSection = () => {
  const stakingFeatures = [
    {
      icon: <FaLock />,
      title: "Secure Asset Protocol",
      description: "Stake NUVO tokens to enhance the security of our asset verification system that validates connections between physical items and digital tokens."
    },
    {
      icon: <FaChartLine />,
      title: "Tokenization Rewards",
      description: "Earn rewards from the platform's tokenization fees, incentivizing participation in the growth of our physical-to-digital ecosystem."
    },
    {
      icon: <FaVoteYea />,
      title: "Protocol Governance",
      description: "Shape the future of physical asset tokenization by voting on proposed improvements to the verification processes and ecosystem features."
    }
  ];

  return (
    <section className="relative py-28 px-4">
      {/* Enhanced background design - Remove hexagon pattern */}
      <div className="absolute inset-0 bg-transparent"></div>
      {/* Remove the hexagon pattern that causes grid effect */}
      
      {/* Animated accent elements */}
      <m.div 
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ duration: 12, repeat: Infinity }}
      ></m.div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <m.h2 
              className="text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Securing the Bridge
              </span>
            </m.h2>
            
            <m.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Stake NUVO tokens to support and benefit from the growing ecosystem of tokenized physical assets.
            </m.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stakingFeatures.map((feature, index) => (
              <m.div
                key={index}
                className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 0 25px 0 rgba(168, 85, 247, 0.3)",
                  borderColor: "rgba(168, 85, 247, 0.5)"
                }}
              >
                <m.div 
                  className="inline-flex justify-center items-center w-16 h-16 text-2xl mb-6 rounded-full bg-purple-900/30 text-purple-400"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </m.div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </m.div>
            ))}
          </div>

          <m.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <m.a
              href="/staking"
              className="inline-block px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg shadow-purple-500/20"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 30px 0 rgba(168, 85, 247, 0.4)" 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Join Our Staking Program
            </m.a>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default StakingSection;
