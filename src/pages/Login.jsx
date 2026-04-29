import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Coffee, Sun } from 'lucide-react';
import './Login.css';

const moods = [
  { id: 'good', icon: <Sun size={32} />, label: 'Feeling Okay', color: 'var(--success)' },
  { id: 'tired', icon: <Coffee size={32} />, label: 'Exhausted', color: '#ecc94b' },
  { id: 'stressed', icon: <Activity size={32} />, label: 'Stressed', color: 'var(--error)' },
];

const Login = ({ onLogin }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleStart = () => {
    if (selectedMood) {
      onLogin(selectedMood);
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
        <div className="icon-wrapper">
          <Heart size={48} color="white" />
        </div>
        <h1>Welcome back.</h1>
        <p>A safe space just for you. How are you feeling today?</p>
        
        <div className="mood-selector">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={{ color: mood.color }}>{mood.icon}</div>
              <span>{mood.label}</span>
            </motion.button>
          ))}
        </div>

        <button 
          className="btn-primary start-btn" 
          disabled={!selectedMood}
          onClick={handleStart}
        >
          Enter Your Space
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
