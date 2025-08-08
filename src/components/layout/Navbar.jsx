import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import NavLink from '../navigation/NavLink';
import WalletConnect from '../web3/WalletConnect';
import BetaBadge from '../ui/BetaBadge';
import {  
  FaCoins, 
  FaChartPie, 
  FaStoreAlt, 
  FaImage,
  FaComments,
  FaEllipsisH,
  FaHome,
  FaTimes,
  FaUser,
  FaWallet,
  FaSignOutAlt,
  FaCopy,
  FaExternalLinkAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';
import { WalletContext } from '../../context/WalletContext';
import { logger } from '../../utils/debug/logger';

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
      relative px-3 md:px-4 lg:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium
      text-white rounded-lg
      transition-all duration-300
      bg-opacity-0 hover:bg-opacity-10
      border border-transparent
      hover:border-purple-500/50
      hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6]
      hover:text-purple-400
      backdrop-blur-sm
      no-underline hover:no-underline
      flex items-center gap-2 md:gap-3
      box-border
      before:absolute before:inset-0 before:rounded-lg
      min-w-[80px] md:min-w-[100px] lg:min-w-[120px] justify-center
      whitespace-nowrap
    `,
    navIconClasses: "w-3 h-3 md:w-4 md:h-4 text-purple-400/80 flex-shrink-0",
    mobileNavIconClasses: "w-5 h-5 text-purple-400/80",
    mobileMenuClasses: isOpen => `
      fixed inset-x-0 top-[4.25rem] z-50
      transform transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'translate-y-0 opacity-100 pointer-events-auto' 
        : '-translate-y-full opacity-0 pointer-events-none'}
      bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg
      border-b border-purple-500/20 shadow-lg tablet:hidden
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

  // Updated navigation items with Creators button
  const navigationItems = useMemo(() => [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/my-nfts', label: 'NFTs', icon: FaImage },
    { path: '/staking', label: 'Staking', icon: FaCoins },
    { path: '/marketplace', label: 'Marketplace', icon: FaStoreAlt },
    { path: '/creators', label: 'Creators', icon: FaUsers },
    { path: '/tokenomics', label: 'Token', icon: FaChartPie },
    { path: '/chat', label: 'Chat', icon: FaComments },
  ], []);

  // Memoized logo click handler
  const handleLogoClick = useCallback(() => {
    handleNavigation('/');
  }, [handleNavigation]);

  // Usar el contexto de la wallet con manejo de errores más robusto
  const walletContext = useContext(WalletContext);
  
  // Proporcionar valores por defecto seguros y acceder a métodos directamente
  const {
    account = '',
    balance = '0',
    network = 'Polygon',
    walletConnected = false,
    handleDisconnect
  } = walletContext || {};

  // Debug: Verificar el estado del contexto - UPDATED WITH SMART LOGGING
  useEffect(() => {
    if (!walletContext) {
      logger.warn('WALLET', 'WalletContext not available - limited functionality');
    } else {
      // Only log significant changes, not every render
      const contextInfo = { 
        walletConnected, 
        hasAccount: !!account, 
        hasDisconnectMethod: !!handleDisconnect,
        availableMethods: Object.keys(walletContext).length
      };
      
      logger.logOnChange('WALLET', 'navbar_context', contextInfo);
    }
  }, [walletContext, walletConnected, account, handleDisconnect]);

  // Handlers para los botones - Con verificaciones adicionales
  const handleViewProfile = useCallback(() => {
    handleNavigation('/profile');
    setIsOpen(false);
  }, [handleNavigation]);
  
  const handleDisconnectWallet = useCallback(async () => {
    logger.debug('WALLET', 'Disconnect attempt initiated');
    
    try {
      setIsOpen(false);
      
      if (handleDisconnect && typeof handleDisconnect === 'function') {
        logger.info('WALLET', 'Calling disconnect method');
        handleDisconnect();
        logger.success('WALLET', 'Wallet disconnected successfully');
      } else {
        logger.error('WALLET', 'Disconnect method not available');
        throw new Error('Disconnect method not available');
      }
    } catch (error) {
      logger.error('WALLET', 'Error disconnecting wallet', error.message);
      alert('Error disconnecting wallet. Please try again.');
    }
  }, [handleDisconnect, walletConnected, account]);

  // Add missing handler functions
  const handleCopyAddress = useCallback(async () => {
    if (!account) return;
    
    try {
      await navigator.clipboard.writeText(account);
      // You might want to show a toast notification here
      console.log('Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, [account]);

  const handleViewOnExplorer = useCallback(() => {
    if (!account) return;
    
    const explorerUrl = `https://polygonscan.com/address/${account}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  }, [account]);

  return (
    <>
      {/* Mobile Bottom Navigation - Enhanced responsive design */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-sm border-t border-white/10 tablet:hidden safe-area-bottom">
        <div className="flex justify-between items-center h-14 xs:h-16 px-1 xs:px-2">
          {/* Main navigation items - responsive sizing */}
          {navigationItems.slice(0, 4).map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 xs:py-2 px-0.5 xs:px-1 transition-all rounded-lg mx-0.5
                  ${isActive ? 'text-purple-400 bg-purple-500/10' : 'text-white/80'}
                  hover:text-purple-300 active:bg-purple-500/20
                  min-w-0`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 xs:w-5 xs:h-5 mb-0.5 xs:mb-1 flex-shrink-0" />
                <span className="text-[10px] xs:text-xs font-medium truncate w-full text-center px-0.5">{label}</span>
              </button>
            );
          })}
          
          {/* Fixed Menu Button with better responsive sizing */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 xs:py-2 px-0.5 xs:px-1 transition-all rounded-lg mx-0.5
              ${isOpen ? 'text-purple-400 bg-purple-500/20' : 'text-white/80'}
              hover:text-purple-300 active:bg-purple-500/20
              min-w-0`}
            aria-label="Más opciones"
            aria-expanded={isOpen}
            aria-controls="mobile-bottom-sheet"
          >
            {isOpen ? (
              <FaTimes className="w-4 h-4 xs:w-5 xs:h-5 mb-0.5 xs:mb-1" />
            ) : (
              <HiMenuAlt3 className="w-4 h-4 xs:w-5 xs:h-5 mb-0.5 xs:mb-1" />
            )}
            <span className="text-[10px] xs:text-xs font-medium">Menú</span>
          </button>
        </div>
        
        {/* Safe area spacing for devices with home indicator */}
        <div className="h-safe-area-inset-bottom bg-black/95"></div>
      </nav>

      {/* Enhanced Bottom Sheet Menu - no changes to existing code */}
      <div
        id="mobile-bottom-sheet"
        className={`
          fixed left-0 right-0 bottom-0 z-[200]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          bg-gradient-to-t from-black/98 to-black/95 backdrop-blur-xl
          border-t border-purple-500/30 shadow-2xl
          rounded-t-3xl
          tablet:hidden
        `}
        style={{ 
          minHeight: '60vh', 
          maxHeight: '85vh',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))'
        }}
        tabIndex={isOpen ? 0 : -1}
      >
        <div className="flex flex-col px-6 pt-6 pb-4 h-full overflow-y-auto">
          {/* Enhanced drag handle */}
          <div className="flex justify-center mb-6">
            <span className="block w-16 h-1.5 rounded-full bg-purple-500/40" />
          </div>

          {/* Wallet Section - Con verificaciones adicionales */}
          {walletConnected && account ? (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <FaWallet className="text-purple-400" />
                Wallet Connected
              </h3>
              
              {/* Account Info Card */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 p-4 mb-4">
                {/* Account Address */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-sm text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Address</p>
                      <p className="font-mono text-sm text-white">
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAddress}
                      disabled={!account}
                      className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-700/60 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Copy address"
                    >
                      <FaCopy className="w-3 h-3 text-purple-300" />
                    </button>
                    <button
                      onClick={handleViewOnExplorer}
                      disabled={!account}
                      className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-700/60 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="View on explorer"
                    >
                      <FaExternalLinkAlt className="w-3 h-3 text-purple-300" />
                    </button>
                  </div>
                </div>

                {/* Balance and Network */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Balance</p>
                    <p className="text-white font-semibold text-sm">
                      {balance ? parseFloat(balance).toFixed(4) : '0.0000'} POL
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Network</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <p className="text-green-400 font-semibold text-sm">
                        {network || 'Polygon'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleViewProfile}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl btn-nuvo-base bg-nuvo-gradient-button transition-all text-white font-medium active:scale-95"
                >
                  <FaUser className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={handleDisconnectWallet}
                  disabled={!walletConnected || !account}
                  className="flex items-center justify-center gap-2 p-3 btn-nuvo-base btn-nuvo-outline transition-all text-white font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* Wallet Connection Section for non-connected state */
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <FaWallet className="text-purple-400" />
                Connect Wallet
              </h3>
              <div className="bg-purple-900/20 rounded-xl border border-purple-500/30 p-6 mb-4">
                <div className="text-center mb-6">
                  <FaInfoCircle className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <p className="text-gray-300 text-sm mb-4">
                    Connect your wallet to access all features
                  </p>
                </div>
                <div className="flex justify-center">
                  <WalletConnect 
                    className="navbar-wallet-mobile w-full max-w-xs" 
                    showFullUI={true}
                    onError={(error) => console.error('WalletConnect error:', error)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Navigation Items */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 text-center">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.slice(4).map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigation(path)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                        : 'bg-purple-900/10 border-purple-500/20 text-white/80'
                      }
                      border hover:bg-purple-500/15 active:bg-purple-500/25`}
                  >
                    <Icon className="w-6 h-6 mb-2 text-purple-400" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-purple-900/20 rounded-xl border border-purple-500/30 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FaInfoCircle className="text-purple-400 w-4 h-4" />
              <h4 className="text-white font-medium text-sm">Contract Info</h4>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-xs">Staking Contract:</p>
                <a 
                  href={`https://polygonscan.com/address/${contractAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-xs font-mono"
                >
                  {formattedContractAddress}
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Beta Badge and Close Button - Centered together */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <BetaBadge pulsate={true} className="border border-purple-400/30" />
            
            {/* Close Button */}
            <button
              onClick={toggleMenu}
              className="
                flex items-center justify-center
                w-8 h-8 rounded-full
                bg-purple-900/40 hover:bg-purple-800/60
                border border-purple-500/40 hover:border-purple-400/60
                text-purple-300 hover:text-white
                transition-all duration-200 ease-out
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:ring-offset-1 focus:ring-offset-gray-900
                flex-shrink-0
              "
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
          
        </div>
      </div>

      {/* Backdrop for bottom sheet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] tablet:hidden"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Desktop Navbar with better responsive design */}
      <nav className="hidden tablet:block fixed top-0 w-full z-[100] bg-black/95 backdrop-blur-sm border-b border-white/10 navbar-transition">
        <div className="w-full px-3 tablet:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex justify-between items-center h-14 tablet:h-15 md:h-16 lg:h-17">
            {/* Logo with responsive sizing */}
            <div onClick={handleLogoClick} className="cursor-pointer flex-shrink-0 mr-4 md:mr-6 lg:mr-8">
              <img 
                className="h-8 tablet:h-9 md:h-10 lg:h-12 w-auto transition-all duration-300"
                src="/LogoNuvos.webp" 
                alt="Nuvo Logo"
                style={{
                  filter: 'drop-shadow(0 0 0.5rem rgba(139, 92, 246, 0.3))'
                }}
              />
            </div>
            
            {/* Navigation items with responsive container */}
            <div className="flex items-center justify-center flex-grow overflow-hidden">
              <div className="flex items-center space-x-2 tablet:space-x-3 md:space-x-4 lg:space-x-6 xl:space-x-8">
                {navigationItems.slice(1).map(({ path, label, icon: Icon }) => (
                  <NavLink 
                    key={path} 
                    to={path} 
                    prefetchStrategy="intent"
                    className={styles.navLinkClasses}
                    activeClassName="bg-purple-500/10 border-purple-500/50 text-purple-400"
                  >
                    <Icon className={styles.navIconClasses} />
                    <span className="hidden md:inline">{label}</span>
                  </NavLink>
                ))}
              </div>
              
              {/* Beta Badge with responsive sizing */}
              <div className="flex items-center ml-3 md:ml-6 flex-shrink-0">
                <BetaBadge 
                  pulsate={true} 
                  className="border border-purple-400/30 scale-75 md:scale-100" 
                />
              </div>
            </div>
            
            {/* Wallet Connect with responsive container */}
            <div className="relative ml-3 md:ml-6 lg:ml-8 flex-shrink-0 min-w-0">
              <div className="max-w-[120px] tablet:max-w-[140px] md:max-w-[160px] lg:max-w-none">
                <WalletConnect 
                  className="navbar-wallet text-xs tablet:text-sm"
                  onError={(error) => console.error('Desktop WalletConnect error:', error)}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Navbar);
