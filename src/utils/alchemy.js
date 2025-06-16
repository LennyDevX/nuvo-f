// utils/alchemy.js

/**
 * Centraliza la obtención y validación de la API key y la construcción de la URL de Alchemy
 */
export function getAlchemyApiKey() {
  // Usar solo import.meta.env para frontend
  const key = import.meta.env.VITE_ALCHEMY;
  if (!key || key === 'YOUR_ALCHEMY_API_KEY' || key === 'undefined' || key.trim() === '') {
    console.error('[Alchemy] API key inválida:', key);
    throw new Error('[Alchemy] No se ha configurado correctamente la API key de Alchemy.');
  }
  return key.trim();
}

export function getAlchemyRpcUrl({ network = 'polygon-mainnet', version = 'v2' } = {}) {
  const apiKey = getAlchemyApiKey();
  return `https://${network}.g.alchemy.com/${version}/${apiKey}`;
}

export function getAlchemyNftUrl({ network = 'polygon-mainnet', version = 'v2', endpoint = 'getNFTs' } = {}) {
  const apiKey = getAlchemyApiKey();
  return `https://${network}.g.alchemy.com/${version}/${apiKey}/${endpoint}/`;
}

/**
 * Detecta si la respuesta de la API de Alchemy es un error de autenticación
 */
export function isAlchemyAuthError(response) {
  return response && response.status === 401;
}
