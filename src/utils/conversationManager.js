function saveOperation(conversations) {
  // Limita a las últimas 20 conversaciones
  const MAX_CONVERSATIONS = 20;
  const limitedConversations = conversations.slice(-MAX_CONVERSATIONS);

  try {
    localStorage.setItem('nuvos_chat_conversations', JSON.stringify(limitedConversations));
  } catch (e) {
    console.error('Failed to save conversation:', e);
    // Opcional: muestra un mensaje al usuario
  }
}