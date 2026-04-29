import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/db';
import { t } from '../utils/i18n';
import './Login.css';

const AnimatedBackground = () => (
  <div className="animated-bg-container">
    <motion.div 
      className="blob blob-1"
      animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="blob blob-2"
      animate={{ x: [0, -120, 0], y: [0, 80, 0], scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div 
      className="blob blob-3"
      animate={{ x: [0, 60, 0], y: [0, 120, 0], scale: [1, 0.9, 1], rotate: [0, 180, 0] }}
      transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const navigate = useNavigate();
  const lang = 'en';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(formData.email, formData.password);
      onLogin(user);
      if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <AnimatedBackground />
      <AnimatePresence>
        {showForgotPwd && (
          <motion.div className="crisis-modal" style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="crisis-header" style={{justifyContent: 'space-between', color: 'white'}}>
              <h3>Reset Password</h3>
              <button onClick={() => setShowForgotPwd(false)} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}><X size={24} /></button>
            </div>
            <p style={{margin: '1rem 0'}}>Since this is a local environment, password reset emails cannot be sent. If you forget your password, you will need to create a new account.</p>
            <button className="btn-primary start-btn" onClick={() => setShowForgotPwd(false)}>Understood</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="login-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ zIndex: 10 }}
      >
        <motion.div variants={itemVariants} className="icon-wrapper logo-quietcare">
          <Heart size={40} color="white" strokeWidth={2.5} />
        </motion.div>
        <motion.h1 variants={itemVariants}>QuietCare</motion.h1>
        <motion.p variants={itemVariants}>{t(lang, 'loginSubtitle')}</motion.p>
        
        {error && <motion.div variants={itemVariants} className="error-message">{error}</motion.div>}

        <motion.form variants={itemVariants} className="auth-form" onSubmit={handleSubmit}>
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
          <div style={{textAlign: 'right', width: '100%'}}>
            <button type="button" onClick={() => setShowForgotPwd(true)} style={{background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}}>Forgot Password?</button>
          </div>
          <motion.button 
            type="submit" 
            className="start-btn" 
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
          >
            {loading ? '...' : t(lang, 'loginBtn')}
            {!loading && <ArrowRight size={20} />}
          </motion.button>
        </motion.form>

        <motion.p variants={itemVariants} className="auth-link">
          {t(lang, 'noAccount')} <Link to="/register">{t(lang, 'createOne')}</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;


