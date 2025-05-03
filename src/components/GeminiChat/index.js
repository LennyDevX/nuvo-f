// Este archivo puede ayudar a resolver problemas de importación duplicada
import GeminiChatComponent from './GeminiChat';

// Exportar un único punto de entrada para evitar duplicación
export const GeminiChat = GeminiChatComponent;
export default GeminiChatComponent;

console.log('GeminiChat se ha cargado correctamente:', GeminiChatComponent);
