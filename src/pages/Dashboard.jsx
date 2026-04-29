import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, MapPin, Heart, BookOpen } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ mood }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{getGreeting()}, Caregiver.</h1>
          <p>We're glad you're here. Take a deep breath.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <motion.div 
          className="card glass primary-card"
          whileHover={{ y: -5 }}
        >
          <div className="card-icon"><MessageSquare size={32} /></div>
          <h3>Your Invisible Journal</h3>
          <p>Express yourself freely. We listen without judgement.</p>
          <Link to="/journal" className="btn-primary card-btn">Start Journaling</Link>
        </motion.div>

        <motion.div 
          className="card glass nudge-card"
          whileHover={{ y: -5 }}
        >
          <div className="card-icon"><Heart size={32} /></div>
          <h3>Self-care Nudge</h3>
          <p>You've been working hard. Remember to drink water and take a 5-minute break.</p>
          <button className="btn-secondary card-btn">Start Breathing Exercise</button>
        </motion.div>

        <div className="resources-section">
          <h2>Quick Resources</h2>
          <div className="resource-list">
            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box danger"><Phone size={24} /></div>
              <div>
                <h4>Emergency Help</h4>
                <p>24/7 Suicide Prevention</p>
              </div>
            </motion.div>
            
            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box success"><MapPin size={24} /></div>
              <div>
                <h4>Nearby Support</h4>
                <p>Hospitals & Clinics</p>
              </div>
            </motion.div>

            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box warning"><BookOpen size={24} /></div>
              <div>
                <h4>Self Help</h4>
                <p>Burnout recovery guides</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
