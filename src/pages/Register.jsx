import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/db';
import { t } from '../utils/i18n';
import './Login.css';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const lang = 'en'; // Default language for register

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*()_+={}\[\]|\\:;'"<>,.?/-]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long, contain a capital letter, a small letter, and a special symbol or number.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(formData.name, formData.email, formData.password);
      onLogin(user);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="icon-wrapper logo-quietcare">
          <Heart size={48} color="white" />
        </div>
        <h1>{t(lang, 'registerTitle')}</h1>
        <p>{t(lang, 'registerSubtitle')}</p>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={20} />
            <input
              type="text"
              name="name"
              placeholder={t(lang, 'namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              name="email"
              placeholder={t(lang, 'emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              name="password"
              placeholder={t(lang, 'passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              name="confirmPassword"
              placeholder={t(lang, 'confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary start-btn"
            disabled={loading}
          >
            {loading ? '...' : t(lang, 'registerBtn')}
          </button>
        </form>

        <p className="auth-link">
          {t(lang, 'hasAccount')} <Link to="/">{t(lang, 'loginLink')}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;