import React from 'react';
import Navbar from './header/Navbar';
import HeroSection from './layout/HeroSection';
import RegistrationForm from './forms/RegisterForm';
import LoginForm from './forms/LoginForm';
import Home from './layout/Home';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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