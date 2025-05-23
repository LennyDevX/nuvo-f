import { memo } from 'react';

/**
 * Mejora del HOC memo que preserva el nombre del componente para depuración
 * @param {Component} Component - Componente React a memorizar
 * @param {Function} areEqual - Función de comparación personalizada (opcional)
 * @returns {Component} Componente memorizado con nombre preservado
 */
const memoWithName = (Component, areEqual) => {
  const MemoizedComponent = memo(Component, areEqual);
  
  // Preservar el nombre original del componente para depuración
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || 'Component'})`;
  
  return MemoizedComponent;
};

export default memoWithName;
