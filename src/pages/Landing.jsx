import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldPlus, ArrowRight, UserPlus } from 'lucide-react';
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

const Landing = () => {
  return (
    <div className="login-container">
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
        
        <motion.p variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
          Your secure, intelligent companion for the caregiving journey.
        </motion.p>
        
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button 
              className="btn-primary" 
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              Login to Dashboard
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button 
              className="btn-secondary" 
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              <UserPlus size={18} />
              Create New Account
            </motion.button>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Landing;
