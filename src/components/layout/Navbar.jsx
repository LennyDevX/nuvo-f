import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
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
  FaComments,
  FaBars
} from 'react-icons/fa';
import { WalletContext } from '../../context/WalletContext';

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
    { path: '/my-nfts', label: 'NFTs', icon: FaImage },
    { path: '/staking', label: 'Staking', icon: FaCoins },
    { path: '/swaptoken', label: 'Swap', icon: FaExchangeAlt },
    { path: '/tokenomics', label: 'Token', icon: FaChartPie },
    { path: '/chat', label: 'Chat', icon: FaComments },
  ], []);

  // Memoized logo click handler
  const handleLogoClick = useCallback(() => {
    handleNavigation('/');
  }, [handleNavigation]);

  // Usa el contexto real de la wallet
  const { account, balance, networkName, connect, disconnect } = useContext(WalletContext);

  // Cerrar el menú cuando se conecta la wallet
  useEffect(() => {
    if (account) {
      setIsOpen(false);
    }
  }, [account]);

  // Handlers para los botones
  const handleViewProfile = () => {
    handleNavigation('/profile');
  };
  const handleDisconnect = () => {
    disconnect && disconnect();
    setIsOpen(false);
  };

  return (
    <>
      {/* Bottom Navbar - Ensure consistent height */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-sm border-t border-white/10 navbar-transition md:hidden" style={{ height: '64px' }}>
        <div className="flex justify-around items-center h-16">
          {navigationItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-all
                  ${isActive ? 'text-purple-400' : 'text-white/80'}
                  hover:text-purple-300`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-6 h-6 mb-0.5" />
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
          {/* Botón para abrir el menú bottom sheet */}
          <button
            onClick={toggleMenu}
            className="flex flex-col items-center justify-center flex-1 py-2 text-white/80 hover:text-purple-300 transition-all"
            aria-label="Más opciones"
            aria-expanded={isOpen}
            aria-controls="mobile-bottom-sheet"
          >
            <FaBars className="w-6 h-6 mb-0.5" />
            <span className="text-xs">Más</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Menu - Adjust z-index to be lower than chat */}
      <div
        id="mobile-bottom-sheet"
        className={`
          fixed left-0 right-0 bottom-0 z-[200]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          bg-gradient-to-t from-black/95 to-black/90 backdrop-blur-lg
          border-t border-purple-500/20 shadow-2xl
          rounded-t-2xl
          md:hidden
        `}
        style={{ minHeight: '40vh', maxHeight: '80vh' }}
        tabIndex={isOpen ? 0 : -1}
      >
        <div className="flex flex-col px-6 pt-4 pb-8 h-full overflow-y-auto">
          {/* Drag handle */}
          <div className="flex justify-center mb-4">
            <span className="block w-12 h-1.5 rounded-full bg-purple-500/30" />
          </div>
          
          {/* WALLET CONNECT - Usar el mismo componente que funciona en desktop */}
          <div className="flex justify-center mb-4">
            <WalletConnect className="navbar-wallet-mobile" showFullUI={true} />
          </div>

          {/* Contract Address debajo */}
          <div className="w-full flex flex-col items-center bg-purple-900/10 rounded-xl border border-purple-500/20 p-4 mb-6">
            <p className="text-gray-400 text-xs mb-1.5">Staking Contract Address:</p>
            <a 
              href={`https://polygonscan.com/address/${contractAddress}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span className="text-xs font-mono">
                {formattedContractAddress}
              </span>
            </a>
          </div>
          
          {/* BetaBadge separado con espacio */}
          <div className="flex flex-col items-center mb-8 mt-2">
            <BetaBadge pulsate={true} className="border border-purple-400/30" />
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-center gap-4 mt-auto">
            <button
              onClick={() => {
                setIsOpen(false);
                handleNavigation('/');
              }}
              className="px-6 py-2 rounded-lg bg-purple-500 text-white font-semibold shadow-lg"
            >
              Home
            </button>
            <button
              onClick={toggleMenu}
              className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navbar (opcional, solo visible en md+) */}
      <nav className="hidden md:block fixed top-0 w-full z-[100] bg-black/95 backdrop-blur-sm border-b border-white/10 navbar-transition">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
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
            {/* Desktop Menu */}
            <div className="flex items-center justify-center flex-grow space-x-4">
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
          </div>
        </div>
      </nav>
    </>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Navbar);
