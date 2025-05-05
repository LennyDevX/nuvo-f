/**
 * Transmite texto al cliente de forma gradual para simular una respuesta natural
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} text - Texto a transmitir
 * @param {Object} options - Opciones de configuración
 */
export async function streamText(res, text, options = {}) {
  const {
    chunkSize = 10,       // Tamaño de cada fragmento
    delayMs = 5,          // Retraso entre fragmentos en ms
    contentType = 'text/plain; charset=utf-8'
  } = options;
  
  // Configurar headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  
  // Transmitir el texto en fragmentos
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    res.write(chunk);
    
    // Pequeña pausa para simular respuesta natural
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  
  res.end();
}
