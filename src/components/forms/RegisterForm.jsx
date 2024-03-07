import React, { useState } from 'react';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import '../../Styles/Forms.css'

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    // Validación del username
    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Username is required.';
      valid = false;
    } else if (formData.username.length < 5) {
      newErrors.username = 'Username must be at least 5 characters long.';
      valid = false;
    }

    // Validación del email
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
      valid = false;
    }

    // Validación del password
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'Password is required.';
      valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:3002/register', formData);
        setSuccessMessage('Registration successful. You can now log in.');
      } catch (error) {
        console.error('Registration error:', error);
        // Manejo de errores aquí
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        {/* Username field */}
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

        {/* Email field */}
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
            <button className={`button is-outlined is-fullwidth ${isLoading ? 'is-loading' : ''}`} type="submit" disabled={isLoading}>
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

export default RegisterForm;
