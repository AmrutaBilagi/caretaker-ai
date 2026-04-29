import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils/i18n';
import { Music, BookOpen, Coffee, Sun, Activity as ExerciseIcon, Wind } from 'lucide-react';
import './Dashboard.css';

const defaultSuggestions = [
  { id: 1, type: 'breathing', icon: <Wind size={24} />, title: "Guided Breathing", short: "5-Minute Box Breathing", desc: "Follow the animation below to instantly lower your heart rate and center your mind.", thumb: "https://images.unsplash.com/photo-1518241353330-0f797f83ad7f?auto=format&fit=crop&w=600&q=80" },
  { id: 2, type: 'text', icon: <motion.div animate={{y: [0, -10, 0]}} transition={{repeat: Infinity, duration: 1.5}}><ExerciseIcon size={24} /></motion.div>, title: "Physical Release", short: "Quick Stretch & Move", desc: "Stand up. Do 10 jumping jacks or stretch your arms to the ceiling for 30 seconds. Physical movement breaks the stress cycle.", thumb: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" },
  { id: 3, type: 'text', icon: <motion.div animate={{y: [0, -5, 0], opacity: [1, 0.7, 1]}} transition={{repeat: Infinity, duration: 2}}><Coffee size={24} /></motion.div>, title: "Take a Breather", short: "Step away briefly", desc: "Step away from the room, close your eyes, and take 10 deep breaths.", thumb: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80" },
  { id: 4, type: 'text', icon: <motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 10, ease: 'linear'}}><Sun size={24} /></motion.div>, title: "Get Some Sun", short: "Feel the light", desc: "Step outside for just a few minutes to feel the sun on your face.", thumb: "https://images.unsplash.com/photo-1444044205806-38f4edb75d74?auto=format&fit=crop&w=600&q=80" }
];

const getHobbySuggestions = (hobbies) => {
  const suggestions = [];
  if (hobbies.includes('Music')) suggestions.push({ id: 5, type: 'text', icon: <motion.div animate={{scale: [1, 1.2, 1]}} transition={{repeat: Infinity, duration: 2}}><Music size={24}/></motion.div>, title: "Music Therapy", short: "Listen to a Calm Playlist", desc: "Put on some noise-canceling headphones and play your favorite soothing tracks. Focus entirely on the instruments.", thumb: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" });
  if (hobbies.includes('Journaling')) suggestions.push({ id: 6, type: 'text', icon: <BookOpen size={24}/>, title: "Write It Down", short: "Use the Invisible Journal", desc: "Spend 5 minutes writing exactly how you feel in the Invisible Journal to release the tension.", thumb: "https://images.unsplash.com/photo-1455390582262-044cdead27d1?auto=format&fit=crop&w=600&q=80" });
  if (hobbies.includes('Reading')) suggestions.push({ id: 7, type: 'text', icon: <BookOpen size={24}/>, title: "Read a Chapter", short: "Escape for a moment", desc: "Escape for a moment into a good book. It provides a healthy distraction.", thumb: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80" });
  if (hobbies.includes('Meditation')) suggestions.push({ id: 8, type: 'text', icon: <motion.div animate={{opacity: [0.5, 1, 0.5]}} transition={{repeat: Infinity, duration: 3}}><Wind size={24}/></motion.div>, title: "Meditation", short: "Mindful check-in", desc: "Sit quietly and do a full body scan. Notice where you are holding tension and consciously release it.", thumb: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=600&q=80" });
  return suggestions;
};

const BreathingTimer = () => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold (in), Exhale, Hold (out)

  useEffect(() => {
    let currentPhase = 0;
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % 4;
      setPhase(phases[currentPhase]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2rem 0', minHeight: '150px'}}>
      <motion.div
        animate={{
          scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : phase === 'Hold' && phase === 'Inhale' ? 1.5 : 1.5,
          opacity: phase === 'Exhale' ? 0.6 : 1
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px var(--accent-secondary)'
        }}
      >
        <span style={{color: 'white', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '1px'}}>{phase}</span>
      </motion.div>
      <p style={{marginTop: '3rem', color: 'var(--text-secondary)', fontWeight: 'bold'}}>Follow the circle. Breathe deeply.</p>
    </div>
  );
};

const SelfHelp = ({ user }) => {
  const [expandedId, setExpandedId] = useState(null);
  const lang = user?.preferences?.language || 'en';
  const hobbies = user?.preferences?.hobbies || [];
  
  const suggestions = [...defaultSuggestions, ...getHobbySuggestions(hobbies)];

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{t(lang, 'sidebarSelfHelp')}</h1>
          <p>Visually rich, actionable steps to overcome a heavy mood.</p>
        </div>
      </header>

      <div className="dashboard-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'}}>
        {suggestions.map((item, idx) => (
          <motion.div 
            key={item.id}
            className="card glass" 
            style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}
            initial={{y: 20, opacity: 0}} 
            animate={{y: 0, opacity: 1}}
            transition={{delay: idx * 0.1}}
            whileHover={{y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.3)'}}
          >
            <div 
              style={{display: 'flex', flexDirection: 'column', cursor: 'pointer'}} 
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div style={{height: '140px', backgroundImage: `url(${item.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
                <div style={{position: 'absolute', bottom: '-20px', left: '20px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10}}>
                  {item.icon}
                </div>
              </div>
              <div style={{padding: '2.5rem 1.5rem 1.5rem 1.5rem'}}>
                <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>{item.title}</h3>
                <p style={{color: 'var(--accent-primary)', fontWeight: 'bold', margin: 0, fontSize: '0.9rem'}}>{item.short}</p>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-primary)'}}>
                    <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)'}}>
                      <p style={{margin: 0, lineHeight: 1.6}}>{item.desc}</p>
                      {item.type === 'breathing' && <BreathingTimer />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelfHelp;


