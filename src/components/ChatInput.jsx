import React, { useState } from 'react';

function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const handleSend = () => {
    if (message.trim() || image) {
      onSend({ message, image });
      setMessage('');
      setImage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // <-- Añade el manejador aquí
        placeholder="Escribe tu mensaje..."
      />
      {/* ...existing code para adjuntar imagen... */}
      <button onClick={handleSend}>
        {/* Icono de flecha/enviar */}
      </button>
    </div>
  );
}

export default ChatInput;