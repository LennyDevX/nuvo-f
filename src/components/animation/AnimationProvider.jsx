import React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

const AnimationProvider = ({ children }) => {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
};

export default AnimationProvider;
