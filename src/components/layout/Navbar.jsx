import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavLink from '../navigation/NavLink';
import WalletConnect from '../web3/WalletConnect';
import BetaBadge from '../ui/BetaBadge';
import {  
  FaCoins, 
  FaChartPie, 
  FaExchangeAlt, 
  FaExternalLinkAlt,
  FaImage,
  FaRobot,
  FaCamera,
  FaComments
} from 'react-icons/fa';

// Importa la variable de entorno
const contractAddress = import.meta.env.VITE_STAKING_ADDRESS || '0x051485a1B6Ad819415BDcBFDEd5B73D0d6c52Afd';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized navigation handler
  const handleNavigation = useCallback((path) => {
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  // Memoized menu toggle handler
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close menu on route change - add dependency array
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add effect to ensure navbar is visible immediately
  useEffect(() => {
    // Force immediate rendering of the navbar by adding an active class
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.classList.add('navbar-active');
    }
    
    return () => {
      if (navbar) {
        navbar.classList.remove('navbar-active');
      }
    };
  }, []);

  // Memoize style classes to prevent recreating strings on every render
  const styles = useMemo(() => ({
    navLinkClasses: `
      relative px-4 py-2 text-sm font-medium
      text-white rounded-lg
      transition-all duration-300
      bg-opacity-0 hover:bg-opacity-10
      border border-transparent
      hover:border-purple-500/50
      hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6]
      hover:text-purple-400
      backdrop-blur-sm
      no-underline hover:no-underline
      flex items-center gap-2
      box-border
      before:absolute before:inset-0 before:rounded-lg
    `,
    navIconClasses: "w-4 h-4 text-purple-400/80",
    mobileNavIconClasses: "w-5 h-5 text-purple-400/80",
    mobileMenuClasses: isOpen => `
      fixed inset-x-0 top-[4.25rem] z-50
      transform transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'translate-y-0 opacity-100 pointer-events-auto' 
        : '-translate-y-full opacity-0 pointer-events-none'}
      bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg
      border-b border-purple-500/20 shadow-lg md:hidden
    `,
    mobileNavButtonClasses: (isActive) => `
      w-full flex items-center gap-3 px-4 py-3 rounded-lg
      text-sm font-medium text-white/90
      transition-all duration-300
      hover:bg-purple-500/10 active:bg-purple-500/20
      ${isActive ? 'bg-purple-500/20' : ''}
    `,
    menuToggleClasses: "p-2.5 rounded-lg bg-purple-900/20 hover:bg-purple-800/30 active:bg-purple-700/40 border border-purple-500/30 transition-all duration-300"
  }), []);

  // Memoize formatted contract address
  const formattedContractAddress = useMemo(() => {
    return `${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}`;
  }, []);

  // Memoize navigation items to prevent recreation on every render
  const navigationItems = useMemo(() => [
    { path: '/my-nfts', label: 'Mint NFTs', icon: FaImage },
    { path: '/staking', label: 'Staking', icon: FaCoins },
    { path: '/tokenomics', label: 'Tokenomics', icon: FaChartPie },
    { path: '/swaptoken', label: 'Swap Token', icon: FaExchangeAlt },
    { path: '/chat', label: 'Chat AI', icon: FaComments },
  ], []);

  // Memoized logo click handler
  const handleLogoClick = useCallback(() => {
    handleNavigation('/');
  }, [handleNavigation]);

  return (
    <nav className="fixed py-3 top-0 w-full z-[100] bg-black/95 backdrop-blur-sm border-b border-white/10 navbar-transition">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo - with memoized click handler */}
          <div onClick={handleLogoClick} className="cursor-pointer">
            <img 
              className="h-10 w-auto md:h-12"
              src="/LogoNuvos.webp" 
              alt="Nuvo Logo"
              style={{
                filter: 'drop-shadow(0 0 0.5rem rgba(139, 92, 246, 0.3))'
              }}
            />
          </div>

          {/* Desktop Menu - Using memoized values */}
          <div className="hidden md:flex items-center justify-center flex-grow space-x-4">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <NavLink 
                key={path} 
                to={path} 
                prefetchStrategy="intent"
                className={styles.navLinkClasses}
                activeClassName="bg-purple-500/10 border-purple-500/50 text-purple-400"
                style={{ minWidth: `${label.length * 10 + 40}px` }}
              >
                <Icon className={styles.navIconClasses} />
                {label}
              </NavLink>
            ))}
            
            {/* Beta Badge in Desktop View */}
            <div className="flex items-center ml-4">
              <BetaBadge 
                pulsate={true} 
                className="border border-purple-400/30" 
              />
            </div>
          </div>

          {/* Wallet Connect */}
          <div className="relative ml-4">
            <WalletConnect className="navbar-wallet" />
          </div>

          {/* Mobile Controls - with memoized toggle handler */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleMenu}
              className={styles.menuToggleClasses}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              aria-controls="mobile-menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-5 bg-purple-300 transform transition-transform duration-300 
                  ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-5 bg-purple-300 transition-opacity duration-300
                  ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-purple-300 transform transition-transform duration-300
                  ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Using memoized styles and event handlers */}
      <div 
        id="mobile-menu"
        className={styles.mobileMenuClasses(isOpen)}
        inert={isOpen ? undefined : ""}
      >
        <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-4.25rem)] overflow-y-auto">
          {/* Navigation Links - with memoized handlers and styles */}
          <div className="space-y-1.5">
            {navigationItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={styles.mobileNavButtonClasses(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <Icon className={styles.mobileNavIconClasses} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Contract Info y Version Badge */}
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-purple-900/10 rounded-xl border border-purple-500/20">
              <p className="text-gray-400 text-xs mb-1.5">Contract Address:</p>
              <a 
                href={`https://polygonscan.com/address/${contractAddress}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                tabIndex={isOpen ? 0 : -1}
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" />
                <span className="text-xs font-mono">
                  {formattedContractAddress}
                </span>
              </a>
            </div>

            {/* Beta Badge in Mobile View */}
            <div className="flex items-center justify-center p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Platform Status:</span>
                <BetaBadge 
                  size="normal" 
                  pulsate={true}
                  className="border border-purple-400/30" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Navbar);
