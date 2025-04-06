import React, { useState, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { cardVariants } from '../../../../utils/animationVariants';
import PropTypes from 'prop-types';

const BaseCard = ({ 
  title, 
  icon, 
  children, 
  className, 
  variant = 'default',
  headerAction,
  loading = false,
  error = null,
  expandable = false,
  startExpanded = true,
  onHeaderClick,
  cardTestId
}) => {
  const [expanded, setExpanded] = useState(startExpanded);

  // Memoized variant styles
  const variantStyles = useMemo(() => ({
    default: 'bg-slate-800/30 border-slate-700/20 hover:shadow-violet-900/10',
    primary: 'bg-indigo-900/20 border-indigo-700/30 hover:shadow-indigo-900/15',
    success: 'bg-emerald-900/20 border-emerald-700/20 hover:shadow-emerald-800/15',
    warning: 'bg-amber-900/20 border-amber-700/20 hover:shadow-amber-800/15',
    danger: 'bg-rose-900/20 border-rose-700/30 hover:shadow-rose-900/15',
    neutral: 'bg-slate-900/40 border-slate-800/30 hover:shadow-slate-900/15'
  }), []);
  
  const currentVariantStyle = variantStyles[variant] || variantStyles.default;
  
  // Memoized loading animation
  const loadingAnimation = useMemo(() => ({
    initial: { opacity: 0.7 },
    animate: { 
      opacity: [0.7, 0.4, 0.7], 
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } 
    }
  }), []);
  
  // Optimized expand/collapse handler
  const toggleExpand = useCallback(() => {
    if (expandable) {
      setExpanded(prev => {
        const newState = !prev;
        if (onHeaderClick) onHeaderClick(newState);
        return newState;
      });
    } else if (onHeaderClick) {
      onHeaderClick();
    }
  }, [expandable, onHeaderClick]);
  
  // Memoized content renderer with loading and error states
  const cardContent = useMemo(() => {
    if (loading) {
      return (
        <m.div 
          className="h-full flex items-center justify-center"
          variants={loadingAnimation}
          initial="initial"
          animate="animate"
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-700/10 to-transparent rounded-md" />
        </m.div>
      );
    }
    
    if (error) {
      return (
        <div className="h-full flex items-center justify-center text-center p-4">
          <div className="text-rose-400 text-sm">{error}</div>
        </div>
      );
    }
    
    if (!expandable || expanded) {
      return (
        <m.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={title ? "h-[calc(100%-3.5rem)]" : "h-full"}
        >
          {children}
        </m.div>
      );
    }
    
    return null;
  }, [loading, error, expandable, expanded, loadingAnimation, children, title]);

  // Optimized header click handler with event propagation control
  const handleHeaderClick = useCallback((e) => {
    toggleExpand();
  }, [toggleExpand]);

  // Optimized action click handler to prevent propagation
  const handleActionClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <m.div
      className={`rounded-xl p-5 sm:p-6 
                  backdrop-blur-sm w-full shadow-sm
                  hover:shadow-md transition-all duration-300 
                  border ${currentVariantStyle} ${className}`}
      variants={cardVariants}
      whileHover="hover"
      data-testid={cardTestId}
      role="region"
      aria-labelledby={title ? "card-title" : undefined}
    >
      {title && (
        <div 
          className={`flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/15
                     ${expandable ? 'cursor-pointer' : ''}`}
          onClick={handleHeaderClick}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-violet-400">{icon}</div>}
            <h3 id="card-title" className="text-base font-medium text-slate-100">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {headerAction && (
              <div onClick={handleActionClick} className="text-slate-300">
                {headerAction}
              </div>
            )}
            {expandable && (
              <m.div 
                className="text-slate-400"
                animate={{ rotate: expanded ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </m.div>
            )}
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {cardContent}
      </AnimatePresence>
    </m.div>
  );
};

BaseCard.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'neutral']),
  headerAction: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
  expandable: PropTypes.bool,
  startExpanded: PropTypes.bool,
  onHeaderClick: PropTypes.func,
  cardTestId: PropTypes.string
};

export default React.memo(BaseCard);
