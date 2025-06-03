import React from 'react';
import { m } from 'framer-motion';
import { FaLock, FaChartLine, FaVoteYea } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';

const StakingSection = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const disableAnimations = shouldReduceMotion || isLowPerformance;

  const stakingFeatures = [
    {
      icon: <FaLock />,
      title: "Secure Protocol",
      description: "Stake NUVO tokens to enhance the security of our asset verification system connecting physical items and digital tokens."
    },
    {
      icon: <FaChartLine />,
      title: "Earn Rewards",
      description: "Earn rewards from tokenization fees, incentivizing participation in our physical-to-digital ecosystem growth."
    },
    {
      icon: <FaVoteYea />,
      title: "Protocol Governance",
      description: "Shape the future of asset tokenization by voting on verification processes and ecosystem improvements."
    }
  ];

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4">
      {/* Transparent background */}
      
      {/* Subtle animated accent */}
      <m.div 
        className="absolute bottom-0 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-purple-600/5 blur-3xl"
        animate={disableAnimations ? {} : { 
          scale: [1, 1.1, 1], 
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <m.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.6 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Securing the Bridge
              </span>
            </m.h2>
            
            <m.p 
              className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto"
              initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Stake NUVO tokens to support and benefit from the growing ecosystem of tokenized physical assets.
            </m.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {stakingFeatures.map((feature, index) => (
              <m.div
                key={index}
                className="backdrop-blur-sm p-6 md:p-8 rounded-xl border border-purple-500/20 shadow-xl text-center hover:border-purple-400/40 transition-all duration-300"
                initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: disableAnimations ? 0 : 0.4, delay: disableAnimations ? 0 : index * 0.1 }}
                viewport={{ once: true, margin: "-30px" }}
                whileHover={disableAnimations ? {} : { 
                  scale: 1.02, 
                  boxShadow: "0 8px 25px rgba(168, 85, 247, 0.15)"
                }}
              >
                <m.div 
                  className="inline-flex justify-center items-center w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl mb-4 md:mb-6 rounded-full bg-purple-900/30 text-purple-400"
                  whileHover={disableAnimations ? {} : { scale: 1.05, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </m.div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">{feature.description}</p>
              </m.div>
            ))}
          </div>

          <m.div
            className="mt-8 md:mt-12 text-center"
            initial={disableAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={disableAnimations ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: disableAnimations ? 0 : 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <m.a
              href="/staking"
              className="inline-block px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20"
              whileHover={disableAnimations ? {} : { 
                scale: 1.02, 
                boxShadow: "0 8px 25px rgba(168, 85, 247, 0.3)" 
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Join Staking Program
            </m.a>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default StakingSection;
