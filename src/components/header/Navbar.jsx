{/* Logo */}
<div className="flex-shrink-0 flex items-center pl-0"></div>
import { Link } from 'react-router-dom';
import { useState } from 'react';
import WalletConnect from '../web3/WalletConnect';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
  `;
  
  const mobileNavLinkClasses = `
    block px-4 py-3 rounded-lg
    text-base font-medium text-white
    transition-all duration-300
    hover:bg-purple-500/10
    hover:border-purple-500/50
    hover:shadow-[0_0_1rem_-0.5rem_#8b5cf6]
    border border-transparent
    hover:text-purple-400
    no-underline hover:no-underline
  `;

  return (
    <nav className="fixed py-2 top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4  lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center pl-2">
            <Link to="/" className="flex items-center transition-transform duration-300 hover:scale-105">
              <img 
                className="h-12 w-auto " // Increased from h-8 to h-12
                src="/NuvoLogo.avif" 
                alt="Nuvo Logo"
                style={{
                  filter: 'drop-shadow(0 0 0.5rem rgba(139, 92, 246, 0.3))'
                }}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-grow space-x-4">
            <Link to="/" className={navLinkClasses}>
              Home
            </Link>
            <Link to="/staking" className={navLinkClasses}>
              Staking
            </Link>
            <Link to="/swaptoken" className={navLinkClasses}>
              Swap Token
            </Link>
            <Link to="/about" className={navLinkClasses}>
              About
            </Link>
            
            <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full border border-purple-500/50 shadow-[0_0_1rem_-0.5rem_#8b5cf6]">
              BETA V3
            </span>
          </div>

          {/* Rest of the code remains the same but update mobile menu link classes */}
          <div className="ml-4">
            <WalletConnect />
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg
                transition-colors duration-300
                hover:bg-purple-500/10
                hover:border-purple-500/50
                hover:shadow-[0_0_1rem_-0.5rem_#8b5cf6]
                border border-transparent"
            >
              <span className="sr-only">Open main menu</span>
              <div className="space-y-1">
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 
                  ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300
                  ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-6 bg-white transition-all duration-300
                  ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-sm">
          <Link to="/" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/staking" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
            Staking
          </Link>
          <Link to="/swaptoken" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
            Swap Token
          </Link>
          <Link to="/about" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;