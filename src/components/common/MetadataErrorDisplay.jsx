import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display when NFT metadata is unavailable
 */
const MetadataErrorDisplay = ({ onRetry, tokenId }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
      <div className="text-red-400 text-lg font-semibold mb-2">Error de Metadatos</div>
      <p className="text-gray-300 text-center mb-2">
        No se pudo cargar la información del NFT {tokenId ? `#${tokenId}` : ''}.
      </p>
      <div className="text-sm text-gray-400 mb-4 text-center">
        Posibles causas:
        <ul className="list-disc pl-5 mt-2">
          <li>URL incorrecta en los metadatos</li>
          <li>Gateway IPFS no disponible</li>
          <li>Los metadatos del NFT no existen o fueron retirados</li>
        </ul>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors"
        >
          Reintentar carga
        </button>
      )}
    </div>
  );
};

MetadataErrorDisplay.propTypes = {
  onRetry: PropTypes.func,
  tokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default MetadataErrorDisplay;
