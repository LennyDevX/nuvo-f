import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Importa el icono de salida de Font Awesome

const LogoutButton = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/'); // Redirigir al usuario a la ruta principal
  };

  return (
    <button className="button is-danger is-outlined" onClick={handleLogout}>
      <strong className='pr-2'>Logout</strong>
      <FontAwesomeIcon  icon={faSignOutAlt} /> {/* Agrega el icono de Font Awesome */}

    </button>
  );
};

export default LogoutButton;
