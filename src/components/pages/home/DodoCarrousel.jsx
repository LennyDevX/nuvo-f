import React, { useState, useCallback, useMemo } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import DododexLogo from '/DododexLogo.png';

const DodoCarrousel = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const prefersReducedMotion = useReducedMotion();

  // Memoize features data to prevent recreation on each render
  const features = useMemo(() => [
    {
      title: "PMM Technology",
      subtitle: "Proactive Market Maker",
      description: "DODO implements revolutionary technology that optimizes market efficiency. The PMM uses advanced algorithms to reduce slippage, enhance liquidity, and offer the best possible prices for each operation. This innovation allows traders to obtain better exchange rates than traditional AMMs while maintaining high stability in the liquidity pool.",
      icon: <img src={DododexLogo} alt="PMM" className="w-full h-full object-contain" />,
      link: "https://dodoex.io/",
      linkText: "Launch App"
    },
    {
      title: "DODO Token",
      subtitle: "Governance & Utility",
      description: "The DODO token is at the heart of the ecosystem, giving holders decision-making power through proposal voting. DODO holders can participate in governance, receive trading fee benefits, and access exclusive features. Additionally, the token serves as an incentive for liquidity providers and contributes to protocol decentralization.",
      icon: <img src={DododexLogo} alt="DODO Token" className="w-full h-full object-contain" />,
      link: "https://dodoex.io/",
      linkText: "Launch App"
    },
    {
      title: "Cross-Chain",
      subtitle: "Multichain DEX",
      description: "DODO operates seamlessly across multiple blockchains, including Ethereum, BSC, Polygon, and other major networks. This cross-chain capability allows users to access liquidity across different chains, reduce transaction costs, and maximize trading opportunities. Interoperability is key to a more connected and efficient DeFi ecosystem.",
      icon: <img src={DododexLogo} alt="Cross-Chain" className="w-full h-full object-contain" />,
      link: "https://dodoex.io/",
      linkText: "Launch App"
    }
  ], []);

  // Memoize animation variants based on reduced motion preference
  const variants = useMemo(() => {
    if (prefersReducedMotion) return {};
    
    return {
      enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1
      },
      exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      })
    };
  }, [prefersReducedMotion]);

  // Memoize pagination handler
  const paginate = useCallback((newDirection) => {
    const newPage = (page + newDirection + features.length) % features.length;
    setPage([newPage, newDirection]);
  }, [page, features.length]);

  // Memoize direct page selection handler
  const selectPage = useCallback((idx) => {
    setPage([idx, idx > page ? 1 : -1]);
  }, [page]);

  return (
    <div className="relative h-[400px] sm:h-[500px] w-full max-w-xl mx-auto">
        <div className="absolute inset-y-0 -left-2 sm:-left-4 flex items-center z-10">
            <button
                onClick={() => paginate(-1)}
                className="p-2 sm:p-3 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 
                         transition-all hover:scale-110 backdrop-blur-sm touch-manipulation"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        </div>

        <div className="relative w-full h-full overflow-hidden rounded-lg sm:rounded-xl">
            <AnimatePresence initial={false} custom={direction}>
                <m.div
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial={prefersReducedMotion ? {} : "enter"}
                    animate={prefersReducedMotion ? {} : "center"}
                    exit={prefersReducedMotion ? {} : "exit"}
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute w-full h-full"
                >
                    <div className="w-full h-full px-2 sm:px-4">
                        <div className="card-transparent border border-yellow-400/50 rounded-lg sm:rounded-xl 
                                    backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] h-full flex flex-col">
                            <div className="flex flex-col items-center p-4 sm:p-6 border-b border-purple-500/20">
                                <div className="w-24 h-24 sm:w-36 sm:h-36 mb-3 sm:mb-4">
                                    {features[page].icon}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-1">
                                        {features[page].title}
                                    </h3>
                                    <p className="text-yellow-300/80 text-sm">
                                        {features[page].subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col p-4 sm:p-6 justify-between">
                                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                                    {features[page].description}
                                </p>
                                
                                <div className="mt-3 sm:mt-4 flex justify-center w-full">
                                    <a
                                        href={features[page].link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center 
                                                 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium 
                                                 text-yellow-400 bg-yellow-500/5 
                                                 border border-yellow-500/20 rounded-lg 
                                                 hover:bg-yellow-500/10 hover:border-yellow-500/30 
                                                 transition-all duration-300 
                                                 shadow-[0_0_15px_rgba(234,179,8,0.1)] 
                                                 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]
                                                 group w-full sm:w-auto"
                                    >
                                        <span className="mr-2">{features[page].linkText}</span>
                                        <svg
                                            className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </m.div>
            </AnimatePresence>
        </div>

        <div className="absolute inset-y-0 -right-2 sm:-right-4 flex items-center z-10">
            <button
                onClick={() => paginate(1)}
                className="p-2 sm:p-3 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 
                         transition-all hover:scale-110 backdrop-blur-sm touch-manipulation"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {features.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => selectPage(idx)}
                    className={`transition-all duration-300 ${
                        idx === page 
                            ? 'w-8 h-2 bg-yellow-400' 
                            : 'w-2 h-2 bg-yellow-400/40 hover:bg-yellow-400/60'
                    } rounded-full`}
                    aria-label={`Go to slide ${idx + 1}`}
                />
            ))}
        </div>
    </div>
  );
};

// Apply React.memo to prevent unnecessary re-renders
export default React.memo(DodoCarrousel);
