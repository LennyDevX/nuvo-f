// Recharts theming and setup
// This file provides common utilities and theme settings for Recharts

// Custom color palette for charts
export const chartColors = {
  purple: {
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    tertiary: '#4C1D95',
    quaternary: '#7C3AED',
    light: '#C4B5FD',
    dark: '#3B0086'
  },
  blue: {
    primary: '#60A5FA',
    secondary: '#3B82F6',
    tertiary: '#1D4ED8',
    light: '#BFDBFE', 
    dark: '#1E3A8A'
  },
  pink: {
    primary: '#F472B6',
    secondary: '#EC4899',
    tertiary: '#DB2777',
    light: '#FBCFE8',
    dark: '#9D174D'
  },
  amber: {
    primary: '#FBBF24',
    secondary: '#F59E0B',
    tertiary: '#D97706',
    light: '#FDE68A',
    dark: '#92400E'
  },
  teal: {
    primary: '#2DD4BF',
    secondary: '#14B8A6',
    tertiary: '#0F766E',
    light: '#99F6E4',
    dark: '#115E59'
  }
};

// Default gradients for various chart elements
export const gradientDefs = (id) => ({
  purpleGradient: {
    id: `purpleGradient-${id}`,
    x1: "0",
    y1: "0", 
    x2: "0", 
    y2: "1",
    stops: [
      { offset: "5%", color: "rgba(139, 92, 246, 0.9)" },
      { offset: "95%", color: "rgba(76, 29, 149, 0.8)" }
    ]
  },
  blueGradient: {
    id: `blueGradient-${id}`,
    x1: "0", 
    y1: "0", 
    x2: "0", 
    y2: "1",
    stops: [
      { offset: "5%", color: "rgba(96, 165, 250, 0.9)" },
      { offset: "95%", color: "rgba(30, 58, 138, 0.8)" }
    ]
  },
  multiGradient: {
    id: `multiGradient-${id}`,
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1",
    stops: [
      { offset: "0%", color: "rgba(139, 92, 246, 0.9)" },
      { offset: "50%", color: "rgba(76, 29, 149, 0.9)" },
      { offset: "100%", color: "rgba(30, 58, 138, 0.9)" }
    ]
  }
});

// Animation defaults with animations DISABLED to prevent the isStepper error
export const animationConfig = () => ({
  isAnimationActive: false,
});

// Helper function for responsive charts
export const getResponsiveConfig = (isMobile) => ({
  padding: isMobile ? 
    { top: 10, right: 10, bottom: 30, left: 10 } : 
    { top: 20, right: 20, bottom: 40, left: 20 },
  labelSize: isMobile ? 10 : 12,
  pieSize: isMobile ? 180 : 300,
  pieInnerRadius: isMobile ? '55%' : '60%',
  pieOuterRadius: isMobile ? '80%' : '90%',
});

// Add a predefined set of easing functions that are supported by Recharts
export const easingTypes = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
};

/**
 * Configuration for when animations absolutely must be enabled
 * This includes all necessary properties to prevent null reference errors
 */
export const safeAnimationConfig = {
  isAnimationActive: false, // Set to false to completely avoid animation issues
};

/**
 * Special version for Pie charts to prevent animation errors
 */
export const safePieAnimationConfig = {
  isAnimationActive: false, // Disable animations for pie charts
};
