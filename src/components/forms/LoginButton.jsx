// LoginButton.js
import React from 'react';
import axios from 'axios';

const LoginButton = ({ isLoading, formData, setIsLoading, setIsLoggedIn, navigate }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3002/login', formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      // Manejar errores de login
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="field">
      <div className="control">
        {isLoading ? (
          <button className="button is-fullwidth is-loading" type="submit" disabled>Loading</button>
        ) : (
          <button className="button is-outlined is-fullwidth" type="submit" onClick={handleSubmit}>Login</button>
        )}
      </div>
    </div>
  );
};

export default LoginButton;
