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
      duration: 1.5,
      ease: 'linear'
    }
  }
};

export const containerFadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

// Helper function to get animation variants based on reduced motion preference
export const getAccessibleAnimationVariants = (prefersReducedMotion = false) => {
  return {
    cardVariants: prefersReducedMotion ? {
      hover: { scale: 1 } // No movement when reduced motion is preferred
    } : cardVariants,
    
    buttonVariants: prefersReducedMotion ? {
      idle: { scale: 1 },
      hover: { 
        boxShadow: '0 0 15px rgba(149, 76, 233, 0.6)',
        transition: { duration: 0.2 }
      },
      tap: { opacity: 0.9 }, // Subtle opacity change instead of movement
      disabled: { opacity: 0.5 }
    } : buttonVariants,
    
    containerFadeIn: prefersReducedMotion ? {
      hidden: { opacity: 0.8 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.5 }
      }
    } : containerFadeIn,
  };
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

// Ejemplo: variantes para inputs
export const inputVariants = {
  focus: { 
    scale: 1.01, 
    boxShadow: '0 0 8px rgba(149, 76, 233, 0.3)',
    transition: { duration: 0.15 }
  },
  idle: { scale: 1, boxShadow: 'none' }
};

// Ejemplo: variantes para modals
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, type: "spring", stiffness: 200 }
  },
  exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.2 } }
};

// Export agrupador para facilitar importación
export const animationVariants = {
  cardVariants,
  buttonVariants,
  shimmerAnimation,
  containerFadeIn,
  staggerContainer,
  fadeIn,
  inputVariants,
  modalVariants
};