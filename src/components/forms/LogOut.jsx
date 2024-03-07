import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Actualiza el estado de autenticación para indicar que el usuario está desconectado
    setIsLoggedIn(false);
    // Redirige al usuario a la página de inicio de sesión o a la ruta deseada después de cerrar sesión
    navigate('/login');
  };

  return (
    <button className="button is-danger is-outlined" onClick={handleLogout}><strong>Logout</strong></button>
  );
};

export default LogoutButton;
