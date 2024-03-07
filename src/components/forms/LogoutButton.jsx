import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/'); // Redirigir al usuario a la ruta principal
  };

  return (
    <button className="button is-danger is-outlined" onClick={handleLogout}><strong>Logout</strong></button>
  );
};

export default LogoutButton;
