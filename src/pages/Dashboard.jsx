import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, MapPin, Heart, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { t } from '../utils/i18n';
import './Dashboard.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    let stressSummary = "Neutral mood";
    if (val >= 4) stressSummary = "Feeling great! Keep up the good work.";
    else if (val === 3) stressSummary = "Doing okay, stay balanced.";
    else if (val <= 2) stressSummary = "High stress levels. Take a breather.";

    return (
      <div className="glass" style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(13, 26, 19, 0.8)' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{label}</p>
        <p style={{ margin: '4px 0 0 0', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>Mood Score: {val}/5</p>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{stressSummary}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ user }) => {
  const lang = user?.preferences?.language || 'en';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Caregiver';

  // Process mood history into graph data
  const rawMoodHistory = user?.moodHistory || [];
  const defaultData = [
    { day: 'Mon', mood: 3 }, { day: 'Tue', mood: 3.5 }, { day: 'Wed', mood: 2.5 }, { day: 'Thu', mood: 4 }, { day: 'Fri', mood: 3 }
  ];
  
  let chartData = defaultData;
  if (rawMoodHistory.length > 0) {
    chartData = rawMoodHistory.slice(-7).map((entry, idx) => {
      const d = new Date(entry.date);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }) + ` (${d.getHours()}:${d.getMinutes()})`,
        mood: entry.mood
      };
    });
  }

  const primaryContact = user?.preferences?.emergencyContacts?.[0] || { name: 'KIRAN Helpline', phone: '18005990019' };
  const secondaryContact = user?.preferences?.emergencyContacts?.[1] || { name: 'Trusted Contact', phone: '' };

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{t(lang, 'dashboardTitle')}, {firstName}.</h1>
          <p>{t(lang, 'dashboardSubtitle')}</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <motion.div className="card glass primary-card" whileHover={{ y: -5 }}>
          <div className="card-icon"><MessageSquare size={32} /></div>
          <h3>{t(lang, 'journalCardTitle')}</h3>
          <p>{t(lang, 'journalCardDesc')}</p>
          <Link to="/journal" className="btn-primary card-btn">{t(lang, 'startJournaling')}</Link>
        </motion.div>

        <motion.div className="card glass chart-card" whileHover={{ y: -5 }}>
          <div className="card-header-flex">
            <div className="card-icon mini"><Activity size={24} /></div>
            <h3>{t(lang, 'chartTitle')}</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 5]} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2}} />
                <Area type="monotone" dataKey="mood" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" activeDot={{ r: 6, stroke: 'var(--bg-primary)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-insight" style={{fontSize: '0.85rem', marginTop: '1rem'}}>
            Graph updates based on your recent journal entries' sentiment.
            {user?.preferences?.faceEmotionDetectionEnabled && <span style={{color: 'var(--accent-primary)', display: 'block', marginTop: '4px'}}>✨ Includes multimodal face and voice analytics.</span>}
          </p>
        </motion.div>

        <div className="resources-section glass">
          <h2>{t(lang, 'resourcesTitle')}</h2>
          <div className="resource-list">
            <motion.div className="resource-item" whileHover={{ x: 5 }}>
              <div className="icon-box danger"><Phone size={24} /></div>
              <div>
                <h4>{primaryContact.name}</h4>
                <p>{primaryContact.phone}</p>
              </div>
              <a href={`tel:${primaryContact.phone}`} className="call-btn danger-btn text-center" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Call Now</a>
            </motion.div>
            
            {secondaryContact.phone && (
              <motion.div className="resource-item" whileHover={{ x: 5 }}>
                <div className="icon-box warning"><Heart size={24} /></div>
                <div>
                  <h4>{secondaryContact.name}</h4>
                  <p>{secondaryContact.phone}</p>
                </div>
                <a href={`tel:${secondaryContact.phone}`} className="call-btn text-center" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Contact</a>
              </motion.div>
            )}
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


