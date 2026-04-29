import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../utils/i18n';
import { History, MessageSquare } from 'lucide-react';
import './Dashboard.css';

const RecentChats = ({ user }) => {
  const lang = user?.preferences?.language || 'en';
  const chatHistory = user?.chatHistory || [];

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>{t(lang, 'sidebarRecentChats')}</h1>
          <p>Review your past journal sessions.</p>
        </div>
      </header>

      <div className="dashboard-grid" style={{gridTemplateColumns: '1fr', maxWidth: '800px'}}>
        {chatHistory.length === 0 ? (
          <div className="card glass text-center" style={{padding: '3rem', textAlign: 'center'}}>
            <History size={48} color="var(--text-secondary)" style={{opacity: 0.5, marginBottom: '1rem'}} />
            <h3 style={{color: 'var(--text-secondary)'}}>No recent chats yet</h3>
            <p>Start a new session in your Invisible Journal to see it here.</p>
          </div>
        ) : (
          chatHistory.slice().reverse().map((session, idx) => (
            <motion.div 
              key={session.id}
              className="card glass" 
              initial={{y: 20, opacity: 0}} 
              animate={{y: 0, opacity: 1}}
              transition={{delay: idx * 0.1}}
            >
              <div className="card-header-flex" style={{borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <MessageSquare size={20} color="var(--accent-primary)" />
                  <h4 style={{margin: 0}}>{new Date(session.date).toLocaleString()}</h4>
                </div>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{session.messages.length} messages</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '200px', overflowY: 'auto'}}>
                {session.messages.map(msg => (
                  <div key={msg.id} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '80%',
                    fontSize: '0.9rem'
                  }}>
                    {msg.text}
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentChats;
