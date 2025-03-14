import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from './HeroSection';
import MissionSection from './MissionSection';
import StakingSection from './StakingSection';
import TechnologySection from './TechnologySection';
import AirdropSection from './AirdropSection';
import CTASection from './CTASection';
import Footer from '../../layout/Footer';

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  useEffect(() => {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-black via-purple-950/20 to-black min-h-screen">
      <div className="relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <motion.div 
            className="absolute top-0 left-0 right-0 h-screen bg-gradient-radial from-purple-600/30 via-transparent to-transparent"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
        </div>
        
        <motion.div style={{ y }} className="relative z-10">
          <HeroSection />
          <MissionSection />
          <TechnologySection />
          <AirdropSection />
          <StakingSection />
          <CTASection />
        </motion.div>
        <Footer />
      </div>
    </div>
  );
};

export default About;