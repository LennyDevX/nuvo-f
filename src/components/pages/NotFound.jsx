import React from 'react';
import NavLink from '../navigation/NavLink'; // Import NavLink instead of Link

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
      <p className="mb-4">La página que buscas no existe.</p>
      <NavLink 
        to="/" 
        prefetchStrategy="render" // Immediately prefetch home route
        className="text-blue-500 hover:text-blue-700"
      >
        Volver al inicio
      </NavLink>
    </div>
  );
};

export default NotFound;
