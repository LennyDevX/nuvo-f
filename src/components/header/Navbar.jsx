import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import WalletConnect from '../web3/WalletConnect';
import { AuthContext } from '../context/AuthContext';
import LogoutButton from '../forms/LogoutButton';
import '../../Styles/Navbar.css'

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const className = isDarkMode ? 'is-dark' : 'is-light';
    document.body.classList.add(className);
  
    // Limpieza de la clase anterior en el siguiente render (opcional)
    return () => document.body.classList.remove(className);
  }, [isDarkMode]);
  

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    // Cerrar sesión
    localStorage.removeItem('token');
    navigate('/'); // Redirigir al usuario a la ruta principal
  };

  return (
    <nav className={`navbar   ${isDarkMode ? 'is-dark' : 'is-light'}`} role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item" >
          <img id='NuvoLogo' src="/NuvoLogo.avif" alt="Placeholder image" />
        </Link>

        <button
          className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded="false"
          onClick={toggleMenu}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''} ${isDarkMode ? 'is-dark' : 'is-light'}`}>
        <div className="navbar-start">
          <Link to="/" className="navbar-item" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/documentation" className="navbar-item" onClick={toggleMenu}>
            Documentation
          </Link>
          <Link to="/about" className="navbar-item" onClick={toggleMenu}>
            About
          </Link>
          <Link to="/nft" className="navbar-item" onClick={toggleMenu}>
            NFT
          </Link>
          <Link to="/portfolio" className="navbar-item" onClick={toggleMenu}>
            Portfolio
          </Link>
          <a className="navbar-item" onClick={toggleTheme} style={{ marginRight: '1rem' }}>
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </a>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div></div>

            <div className="buttons">
              {/* Oculta los botones Sign Up y Log in si el usuario está logueado */}
              {!isLoggedIn ? (
                <>
                  <Link to="/signup" className="button is-primary" onClick={toggleMenu}>
                    <strong>Sign Up</strong>
                    <span className="icon">
                      <FontAwesomeIcon icon={faUserPlus} />
                    </span>
                  </Link>
                  <Link to="/login" className="button is-danger" onClick={toggleMenu}>
                    <strong>Log in</strong>
                    <span className="icon">
                      <FontAwesomeIcon icon={faSignInAlt} />
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <WalletConnect />
                  <LogoutButton onClick={handleLogout} /> {/* Agrega el componente LogoutButton con el onClick para cerrar sesión y redirigir */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
