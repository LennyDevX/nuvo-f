import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ThemeContext } from './ThemeContext';
import '../Styles/Forms.css';

const RegistrationForm = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("is-dark");
      document.body.classList.remove("is-light");
    } else {
      document.body.classList.add("is-light");
      document.body.classList.remove("is-dark");
    }
  }, [isDarkMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: '', email: '', password: '' };

    // Validate username
    if (formData.username.length < 5) {
      newErrors.username = 'Username must be at least 5 characters long.';
      valid = false;
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
      valid = false;
    }

    // Validate password
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:3002/register', formData);
        console.log('Registration successful:', response.data);
        setSuccessMessage('Registration successful. You can now log in.');
        setFormData({
          username: '',
          email: '',
          password: ''
        });
        setErrors({ username: '', email: '', password: '' });
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response && error.response.status === 429) {
          setErrors({ ...errors, username: '', email: '', password: 'Too many registration attempts. Please try again later.' });
        } else {
          setErrors({ ...errors, username: '', email: '', password: 'An unexpected error occurred. Please try again later.' });
        }
      }
    }
  };

  return (
    <div className={`container ${isDarkMode ? 'is-dark' : 'is-light'}`}>
      <form onSubmit={handleSubmit} >
        {/* Input fields */}
        <div className="field">
          <div className="control has-icons-left">
            <input
              className={`input ${errors.username && 'is-danger'}`}
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={faUser} />
            </span>
          </div>
          {errors.username && <p className="help is-danger">{errors.username}</p>}
        </div>
        {/* Email and Password fields */}
        <div className="field">
          {/* Email field */}
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
        {/* Password field */}
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
        {/* Submit button */}
        <div className="field">
          <div className="control">
            <button className="button is-outlined is-fullwidth" type="submit">
              Register
            </button>
          </div>
        </div>
        {/* Success message */}
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

export default RegistrationForm;
