import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldPlus, Mail, Lock, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/db';
import { t } from '../utils/i18n';
import './Login.css';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
      <AnimatePresence>
        {showForgotPwd && (
          <motion.div className="crisis-modal" style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-lg)'}}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="crisis-header" style={{justifyContent: 'space-between', color: 'var(--text-primary)'}}>
              <h3>Reset Password</h3>
              <button onClick={() => setShowForgotPwd(false)} style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer'}}><X size={24} /></button>
            </div>
            <p style={{margin: '1rem 0', color: 'var(--text-secondary)'}}>Since this is a local environment, password reset emails cannot be sent. If you forget your password, you will need to create a new account.</p>
            <button className="btn-primary" style={{width: '100%'}} onClick={() => setShowForgotPwd(false)}>Understood</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="login-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="icon-wrapper">
          <ShieldPlus size={36} />
        </motion.div>
        
        <motion.h1 variants={itemVariants}>Caregiver AI Support</motion.h1>
        <motion.p variants={itemVariants}>Sign in to access your dashboard</motion.p>
        
        {error && <motion.div variants={itemVariants} className="error-message">{error}</motion.div>}

        <motion.form variants={itemVariants} className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={18} />
            <input 
              type="email" 
              name="email" 
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div style={{textAlign: 'right', width: '100%'}}>
            <button type="button" onClick={() => setShowForgotPwd(true)} style={{background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500}}>Forgot Password?</button>
          </div>
          <motion.button 
            type="submit" 
            className="start-btn" 
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
          >
            {loading ? 'Authenticating...' : 'Continue'}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </motion.form>

        <motion.p variants={itemVariants} className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;


