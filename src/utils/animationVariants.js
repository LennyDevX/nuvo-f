// Variantes comunes de animación para reutilización en componentes

export const cardVariants = {
  hover: { 
    scale: 1.01, 
    y: -2, 
    transition: { type: "spring", stiffness: 300 } 
  }
};

export const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    boxShadow: '0 0 15px rgba(149, 76, 233, 0.6)',
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 },
  disabled: { 
    opacity: 0.5,
    scale: 1,
    boxShadow: 'none'
  }
};

export const shimmerAnimation = {
  hidden: { 
    backgroundPosition: '200% 0',
    opacity: 0.8
  },
  visible: { 
    backgroundPosition: '-200% 0',
    opacity: 1,
    transition: { 
      repeat: Infinity, 
      duration: 3,
      ease: 'linear'
    }
  }
};

export const containerFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1 }
  })
};
