import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import RegistrationForm from './RegisterForm';
import LoginForm from './LoginForm';
import Home from './Home';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "../Styles/App.css"

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>

          <Navbar />

          {/* Aquí se maneja las rutas */}
          <Routes>
            <Route path="/" element={ <HeroSection /> } />
            <Route path="/signup" element={ <RegistrationForm /> } />
            <Route path="/login" element={ <LoginForm /> } />
            <Route path="/home" element={ <Home /> } />
          </Routes>

        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;