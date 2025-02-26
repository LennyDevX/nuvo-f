import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './Styles/index.css';
import './styles/animations.css'; // Add this line to import our custom animations

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

