import React from 'react';

const SpaceBackground = ({ customClass = "" }) => {
  return (
    <div className={`fixed inset-0 z-0 ${customClass}`}>
      {/* Mejora del gradiente para que sea más visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black"></div>
      
      {/* Overlay mejorado con más saturación */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-black/90"></div>
      
      {/* Acento sutil en la parte superior */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/15 to-transparent"></div>
    </div>
  );
};

export default SpaceBackground;
