import React from 'react';
import WalletConnect from './web3/WalletConnect';
// ...existing imports...

const Navbar = () => {
  // ...existing code...

  return (
    <nav className="bg-black/80 fixed w-full z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y enlaces del lado izquierdo */}
          <div className="flex items-center">
            {/* ...existing code... */}
          </div>

          {/* Botones del lado derecho - SOLO UN WalletConnect */}
          <div className="flex items-center gap-4">
            {/* Otros botones si existen */}
            <WalletConnect className="navbar-wallet" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
