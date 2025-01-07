import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WalletConnect from '../web3/WalletConnect';
import AirdropDownloader from '../firebase/AirdropDownloader';
import { 
  FaHome, 
  FaCoins, 
  FaChartPie, 
  FaExchangeAlt, 
  FaExternalLinkAlt,
  FaCode, 
  FaGift,
  // ...existing imports...
} from 'react-icons/fa'

// Importa la variable de entorno
const contractAddress = import.meta.env.VITE_STAKING_ADDRESS || '0x051485a1B6Ad819415BDcBFDEd5B73D0d6c52Afd';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Manejador de navegación mejorado
  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinkClasses = `
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
  `;

  const navIconClasses = "w-4 h-4 text-purple-400/80";

  const mobileNavLinkClasses = `
    flex items-center gap-3 px-4 py-3.5 rounded-lg
    text-base font-medium text-white/90
    transition-all duration-300
    hover:bg-purple-500/10 active:bg-purple-500/20
    hover:border-purple-500/50
    hover:shadow-[0_0_1rem_-0.5rem_#8b5cf6]
    border border-transparent
    hover:text-purple-400
    no-underline hover:no-underline
    backdrop-blur-sm
  `;

  const mobileNavIconClasses = "w-5 h-5 text-purple-400/80";

  // Navigation items array for both mobile and desktop
  const navigationItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/staking', label: 'Staking', icon: FaCoins },
    { path: '/tokenomics', label: 'Tokenomics', icon: FaChartPie },
    { path: '/swaptoken', label: 'Swap Token', icon: FaExchangeAlt },
    { path: '/roadmap', label: 'Developer Portal', icon: FaCode },
    { path: '/airdrops', label: 'Airdrops', icon: FaGift },
  ];

  return (
    <nav className="fixed py-3 top-0 w-full z-[100] bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div onClick={() => handleNavigation('/')} className="cursor-pointer">
            <img 
              className="h-10 w-auto md:h-12"
              src="/NuvoLogo.avif" 
              alt="Nuvo Logo"
              style={{
                filter: 'drop-shadow(0 0 0.5rem rgba(139, 92, 246, 0.3))'
              }}
            />
          </div>

          {/* Desktop Menu - Updated with icons */}
          <div className="hidden md:flex items-center justify-center flex-grow space-x-4">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className={navLinkClasses}>
                <Icon className={navIconClasses} />
                {label}
              </Link>
            ))}
            
            
          </div>

          {/* Wallet Connect - Modificado */}
          <div className="relative ml-4">
            <WalletConnect className="navbar-wallet" />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            {/* Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg bg-purple-900/20 
                hover:bg-purple-800/30 active:bg-purple-700/40
                border border-purple-500/30 
                transition-all duration-300"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
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

      {/* Mobile Menu - Optimizado */}
      <div 
        className={`
          fixed inset-x-0 top-[4.25rem] z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'}
          bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg
          border-b border-purple-500/20 shadow-lg md:hidden
        `}
      >
        <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-4.25rem)] overflow-y-auto">
          

          {/* Navigation Links */}
          <div className="space-y-1.5">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium text-white/90
                  transition-all duration-300
                  hover:bg-purple-500/10 active:bg-purple-500/20
                  ${location.pathname === path ? 'bg-purple-500/20' : ''}
                `}
              >
                <Icon className={mobileNavIconClasses} />
                {label}
              </button>
            ))}
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
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" />
                <span className="text-xs font-mono">
                  {`${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}`}
                </span>
              </a>
            </div>

            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
