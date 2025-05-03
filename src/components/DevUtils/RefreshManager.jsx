import { useEffect } from 'react';

/**
 * Componente utilitario para ayudar con problemas de actualización durante desarrollo
 * Implementa técnicas para forzar actualizaciones y limpiar caché
 */
const RefreshManager = () => {
  useEffect(() => {
    // Agregar un listener para forzar la actualización con una combinación de teclas (Ctrl+Shift+R)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        console.log('Forzando actualización manual...');
        
        // Limpiar caché de localStorage si existe
        try {
          const cacheKeys = Object.keys(localStorage).filter(key => 
            key.includes('cache') || key.includes('state')
          );
          
          if (cacheKeys.length > 0) {
            console.log('Limpiando caché local:', cacheKeys);
            cacheKeys.forEach(key => localStorage.removeItem(key));
          }
        } catch (err) {
          console.warn('Error al limpiar localStorage:', err);
        }
        
        // Forzar recarga sin caché
        window.location.reload(true);
      }
    };
    
    // Registrar el evento al montar
    window.addEventListener('keydown', handleKeyDown);
    
    // Log de depuración
    console.log('%cRefreshManager activado - Presiona Ctrl+Shift+R para forzar actualización', 
      'background: #4C1D95; color: white; padding: 4px; border-radius: 4px;'
    );
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return null; // Componente invisible
};

export default RefreshManager;
