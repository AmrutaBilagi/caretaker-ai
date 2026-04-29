import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, MapPin, Heart, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const moodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 2 },
  { day: 'Wed', mood: 4 },
  { day: 'Thu', mood: 2 },
  { day: 'Fri', mood: 5 },
  { day: 'Sat', mood: 4 },
  { day: 'Sun', mood: 4 }
];

const Dashboard = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Caregiver';

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{getGreeting()}, {firstName}.</h1>
          <p>We're glad you're here. Take a deep breath.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <motion.div className="card glass primary-card" whileHover={{ y: -5 }}>
          <div className="card-icon"><MessageSquare size={32} /></div>
          <h3>Your Invisible Journal</h3>
          <p>Express yourself freely. Our empathetic AI is here to listen to your emotional needs.</p>
          <Link to="/journal" className="btn-primary card-btn">Start Journaling</Link>
        </motion.div>

        <motion.div className="card glass chart-card" whileHover={{ y: -5 }}>
          <div className="card-header-flex">
            <div className="card-icon mini"><Activity size={24} /></div>
            <h3>Mental Health Tracking</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={moodData}>
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis hide domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                />
                <Line type="monotone" dataKey="mood" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-secondary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-insight">Your mood has been improving over the weekend. Keep up the self-care!</p>
        </motion.div>

        <div className="resources-section glass">
          <h2>Location & Emergency Resources</h2>
          <div className="resource-list">
            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box danger"><Phone size={24} /></div>
              <div>
                <h4>KIRAN Mental Health Helpline</h4>
                <p>1800-599-0019 (24/7 Free Support)</p>
              </div>
              <a href="tel:18005990019" className="call-btn danger-btn text-center" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Call Now</a>
            </motion.div>
            
            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box warning"><Heart size={24} /></div>
              <div>
                <h4>Trusted Contacts</h4>
                <p>Dr. Sharma (Therapist)</p>
              </div>
              <a href="tel:1234567890" className="call-btn text-center" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Contact</a>
            </motion.div>
          </div>

          <div className="map-container" style={{ marginTop: '1.5rem', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MapPin size={20} color="var(--success)" />
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Nearby Hospitals</h4>
            </div>
            <iframe 
              src="https://maps.google.com/maps?q=hospitals%20near%20me&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="250" 
              style={{ border: 0, borderRadius: '12px' }} 
              allowFullScreen="" 
              loading="lazy"
              title="Nearby Hospitals"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

