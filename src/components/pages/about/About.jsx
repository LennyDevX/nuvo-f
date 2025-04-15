import React, { useEffect } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import HeroSection from './HeroSection';
import MissionSection from './MissionSection';
import StakingSection from './StakingSection';
import TechnologySection from './TechnologySection';
import AirdropSection from './AirdropSection';
import CTASection from './CTASection';
import Footer from '../../layout/Footer';
import AnimationProvider from '../../animation/AnimationProvider';
import SpaceBackground from '../../effects/SpaceBackground';

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative">
        <SpaceBackground customClass="" />
        
        <div className="relative">
          <m.div style={{ y }} className="relative z-10">
            <HeroSection />
            <MissionSection />
            <TechnologySection />
            <AirdropSection />
            <StakingSection />
            <CTASection />
          </m.div>
          <Footer />
        </div>
      </div>
    </AnimationProvider>
  );
};

export default About;