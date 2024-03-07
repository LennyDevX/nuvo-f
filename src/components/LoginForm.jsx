import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ThemeContext } from './ThemeContext';  
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const LoginForm = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { setIsLoggedIn } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la visibilidad del loader
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
      valid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true); // Mostrar el loader al enviar el formulario
      try {
        const response = await axios.post('http://localhost:3002/login', formData);
        const { token } = response.data;
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
        setSuccessMessage('Login successful.');
        navigate('/home');
      } catch (error) {
        console.error('Login error:', error);
        if (error.response && error.response.status === 401) {
          setErrors({ ...errors, email: '', password: 'Invalid email or password.' });
        } else {
          setErrors({ ...errors, email: '', password: 'An unexpected error occurred. Please try again later.' });
        }
      } finally {
        setIsLoading(false); // Ocultar el loader al finalizar el proceso de inicio de sesión
      }
    }
  };

  return (
    <div className={`container ${isDarkMode ? 'is-dark' : 'is-light'}`}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <div className="control has-icons-left">
            <input
              className={`input ${errors.email && 'is-danger'}`}
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
          </div>
          {errors.email && <p className="help is-danger">{errors.email}</p>}
        </div>
        <div className="field">
          <div className="control has-icons-left">
            <input
              className={`input ${errors.password && 'is-danger'}`}
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faLock} />
            </span>
          </div>
          {errors.password && <p className="help is-danger">{errors.password}</p>}
        </div>
        <div className="field">
          <div className="control">
            {/* Usar el operador ternario para mostrar el loader si isLoading es true */}
            {isLoading ? (
              <button className="button is-fullwidth is-loading" type="submit">Loading</button>
            ) : (
              <button className="button is-outlined is-fullwidth" type="submit">Login</button>
            )}
          </div>
        </div>
        {successMessage && (
          <div className="notification is-success">
            {successMessage}
            <button className="delete" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
