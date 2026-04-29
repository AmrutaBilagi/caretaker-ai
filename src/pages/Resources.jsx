import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils/i18n';
import { Video, FileText, ExternalLink, Play, X } from 'lucide-react';
import './Dashboard.css';

const videos = [
  { id: "1", title: "Guided Meditation for Caregiver Stress", desc: "A deeply relaxing 15-minute guided meditation specifically designed to release the tension of caregiving.", url: "https://www.youtube.com/embed/inpok4MKVLM", thumb: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80" },
  { id: "2", title: "Calm Nature Sounds & Visuals", desc: "Immerse yourself in beautiful flowing rivers and rustling leaves to instantly calm your nervous system.", url: "https://www.youtube.com/embed/eKFTSSKCzWA", thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80" },
  { id: "3", title: "How to Manage Compassion Fatigue", desc: "Learn clinical, practical steps to protect your own mental health when you spend all your time caring for others.", url: "https://www.youtube.com/embed/v1tjJEJhtnI", thumb: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80" },
  { id: "4", title: "10 Minute Mindfulness Meditation", desc: "A short, powerful daily check-in to clear your mind before starting your day.", url: "https://www.youtube.com/embed/ZToicYcHIOU", thumb: "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&w=600&q=80" }
];

const articles = [
  { id: "1", title: "Caregiver Burnout: Signs and Coping Strategies", link: "https://www.helpguide.org/articles/stress/caregiver-stress-and-burnout.htm" },
  { id: "2", title: "Taking Care of YOU: Self-Care for Family Caregivers", link: "https://www.caregiver.org/resource/taking-care-you-self-care-family-caregivers/" }
];

const Resources = ({ user }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const lang = user?.preferences?.language || 'en';

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{t(lang, 'sidebarResources')}</h1>
          <p>Curated cinematic experiences and articles for your mental well-being.</p>
        </div>
      </header>

      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div style={{width: '100%', maxWidth: '1000px', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative'}}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              <button 
                onClick={() => setActiveVideo(null)} 
                style={{position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10}}
              >
                <X size={24} />
              </button>
              <div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
                <iframe 
                  src={activeVideo.url + "?autoplay=1"} 
                  style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0}} 
                  allow="autoplay; fullscreen"
                  allowFullScreen 
                  title={activeVideo.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-grid">
        <div style={{gridColumn: '1 / -1'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <Video size={24} color="var(--accent-primary)" /> Cinematic Video Library
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem'}}>
            {videos.map((video, idx) => (
              <motion.div 
                key={video.id} 
                className="card glass" 
                style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}
                initial={{opacity: 0, y: 30}} 
                animate={{opacity: 1, y: 0}} 
                transition={{delay: idx * 0.1}}
                whileHover={{y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'}}
              >
                <div style={{height: '180px', backgroundImage: `url(${video.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
                  <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s'}} className="play-overlay">
                    <div style={{background: 'var(--accent-primary)', borderRadius: '50%', padding: '16px'}}>
                      <Play fill="white" color="white" size={32} />
                    </div>
                  </div>
                </div>
                <div style={{padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem'}}>{video.title}</h3>
                  <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1}}>{video.desc}</p>
                  <button className="btn-primary" onClick={() => setActiveVideo(video)} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px'}}>
                    <Play size={18} fill="currentColor" /> Watch Now
                  </button>
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                  .card:hover .play-overlay { opacity: 1 !important; cursor: pointer; }
                `}} />
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{gridColumn: '1 / -1', marginTop: '3rem'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
            <FileText size={24} color="var(--accent-primary)" /> Premium Editorial Articles
          </h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
            {articles.map((article, idx) => (
              <motion.a 
                key={article.id} 
                href={article.link} 
                target="_blank" 
                rel="noreferrer"
                className="card glass" 
                style={{textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-primary)'}}
                initial={{opacity: 0, x: -20}} 
                animate={{opacity: 1, x: 0}}
                transition={{delay: idx * 0.1}}
                whileHover={{x: 10, background: 'rgba(255,255,255,0.15)'}}
              >
                <h4 style={{margin: 0, color: 'var(--text-primary)'}}>{article.title}</h4>
                <ExternalLink size={20} color="var(--accent-primary)" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
