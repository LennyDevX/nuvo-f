import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import "../Styles/Navbar.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import WebWallet from  './WebWallet'; // Importa el componente de conexión a la wallet
import { AuthContext } from './AuthContext'; // Importa el contexto de autenticación
import LogoutButton from './LogOut'; // Importa el componente LogoutButton

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext); // Obtiene el estado de inicio de sesión desde el contexto de autenticación

  useEffect(() => {
    if (isDarkMode) {
        document.body.classList.add("is-dark");
        document.body.classList.remove("is-light");
    } else {
        document.body.classList.add("is-light");
        document.body.classList.remove("is-dark");
    }
}, [isDarkMode]);

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'is-dark' : 'is-light'}`} role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src="/IluminatiNFT.png" width="40" alt="Logo" className='Logo' />
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

      <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start" >
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
          <div className="navbar-item" >
            <div>
              
            </div>
            
            <div className="buttons">
              {/* Oculta los botones Sign Up y Log in si el usuario está logueado */}
              {!isLoggedIn ? (
                <>
                  <Link to="/signup" className="button is-primary is-outlined" onClick={toggleMenu}>
                    <strong>Sign Up</strong>
                  </Link>
                  <Link to="/login" className="button is-danger is-outlined" onClick={toggleMenu}>
                    <strong>Log in</strong>
                  </Link>
                </>
              ) : (
                <>
                  <WebWallet /> {/* Muestra el componente WebWallet solo si el usuario está logueado */}
                  <LogoutButton />   {/* Muestra el botón de cierre de sesión solo si el usuario está logueado */}

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
