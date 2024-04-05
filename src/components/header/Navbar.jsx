// Navbar.jsx

import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import WalletConnect from '../web3/WalletConnect';

import '../../Styles/Navbar.css'

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const savedIsDarkMode = localStorage.getItem('isDarkMode');
    if (savedIsDarkMode !== null) { 
      setIsDarkMode(JSON.parse(savedIsDarkMode));  
    }

    const className = isDarkMode ? 'is-dark' : 'is-light';
    document.body.classList.add(className);
  
    return () => {
      document.body.classList.remove(className);
    };
  }, [isDarkMode]);
  
  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('isDarkMode', JSON.stringify(newIsDarkMode));
  };

  return (
    
    <nav className={`navbar ${isDarkMode ? 'is-dark' : 'is-light'}`} role="navigation" aria-label="main navigation">

      <div className="navbar-brand">
      <img id='NuvoLogo' src="/NuvoLogo.avif" alt="Placeholder image" />

        <button
          className={`navbar-burger burger ${isActive ? 'is-active' : ''} ${isDarkMode ? 'is-dark' : ''}`} // Agregar clase is-dark en el modo oscuro
          aria-label="menu"
          aria-expanded="false"
          onClick={toggleMenu}
        >
          <span className='burger-button' aria-hidden="true"></span>
          <span className='burger-button'  aria-hidden="true"></span>
          <span className='burger-button'aria-hidden="true"></span>
          <span className='burger-button'aria-hidden="true"></span>

        </button>
      </div>

      <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <Link to="/" className="navbar-item" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/staking" className="navbar-item" onClick={toggleMenu}>
            Staking
          </Link>
          <Link to="/swaptoken" className="navbar-item" onClick={toggleMenu}>
            Swap Token
          </Link>
          <Link to="/nft" className="navbar-item" onClick={toggleMenu}>
            NFT
          </Link>
          <Link to="/governance" className="navbar-item" onClick={toggleMenu}>
            GOV
          </Link>
          <Link to="/about" className="navbar-item" onClick={toggleMenu}>
            About
          </Link>
          
          <strong className='navbar-item version-nuvo'>
             BETA V2
          </strong>
          <a className="navbar-item" onClick={toggleTheme} style={{ marginRight: '1rem' }}>
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
