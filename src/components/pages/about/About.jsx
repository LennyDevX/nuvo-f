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
// Import the SpaceBackground component instead of CSS
import SpaceBackground from '../../effects/SpaceBackground';
// Keep about.css for other styles that aren't related to space background
import '../../../Styles/about.css';

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
    <AnimationProvider>
      <div className="bg-nuvo-gradient min-h-screen relative">
        {/* Use the SpaceBackground component */}
        <SpaceBackground />
        
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