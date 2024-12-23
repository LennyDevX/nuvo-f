import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MainLayout from '../../layout/MainLayout';
import HeroSection from './HeroSection';
import MissionSection from './MissionSection';
import StakingSection from './StakingSection';
import AirdropSection from './AirdropSection';
import TechnologySection from './TechnologySection';
import CTASection from './CTASection';

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <MainLayout showFooter={true}>
      <motion.div style={{ y }} className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-[url('/noise-pattern.svg')] opacity-5 pointer-events-none"></div>
        
        <HeroSection />
        <MissionSection />
        <StakingSection />
        <AirdropSection />
        <TechnologySection />
        <CTASection />
      </motion.div>
    </MainLayout>
  );
};

export default About;