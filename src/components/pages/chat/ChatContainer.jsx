import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import '../../../Styles/ChatInput.css';

const ChatContainer = ({ 
  leftSidebarOpen = false, 
  rightSidebarOpen = false,
  toggleLeftSidebar,
  toggleRightSidebar,
  shouldReduceMotion,
  isLowPerformance
}) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message) => {
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { type: 'user', content: message }]);

    try {
      // Send to API and get response
      // Replace with your actual API call
      const response = await fetch('your-api-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prevMessages => [...prevMessages, { type: 'ai', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error case
      setMessages(prevMessages => [...prevMessages, { 
        type: 'system', 
        content: 'Sorry, there was an error processing your request.'
      }]);
    }
  };

  // Generate dynamic classes for sidebar states
  const chatContainerClasses = [
    'chat-container',
    leftSidebarOpen ? 'sidebar-left-open' : '',
    rightSidebarOpen ? 'sidebar-right-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={chatContainerClasses}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input component */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
