import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from './HeroSection';
import MissionSection from './MissionSection';
import StakingSection from './StakingSection';
import AirdropSection from './AirdropSection';
import TechnologySection from './TechnologySection';
import CTASection from './CTASection';
import Footer from '../../layout/Footer';

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="bg-nuvo-gradient">
      <div className="flex flex-col min-h-screen">
        <motion.div style={{ y }} className="flex-grow">
          <HeroSection />
          <MissionSection />
          <StakingSection />
          <AirdropSection />
          <TechnologySection />
          <CTASection />
        </motion.div>
        <Footer />
      </div>
    </div>
  );
};

export default About;