import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Phone, Activity, Menu, X, History, ShieldPlus, Settings as SettingsIcon, BookOpen } from 'lucide-react';
import { t } from '../utils/i18n';
import './Sidebar.css';

const Sidebar = ({ onLogout, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = user?.preferences?.language || 'en';
  const toggleSidebar = () => setIsOpen(!isOpen);

  // The primary emergency contact if available, fallback to KIRAN helpline
  const primaryPhone = user?.preferences?.emergencyContacts?.[0]?.phone || "18005990019";

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', justifyContent: 'center'}}>
            <ShieldPlus size={28} color="var(--accent-primary)" />
            <h2>Caregiver AI</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} />
            <span>{t(lang, 'sidebarDashboard')}</span>
          </NavLink>
          <NavLink to="/journal" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <MessageSquare size={20} />
            <span>New Chat</span>
          </NavLink>
          <NavLink to="/recent-chats" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <History size={20} />
            <span>History</span>
          </NavLink>
          <NavLink to="/self-help" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Activity size={20} />
            <span>Insights</span>
          </NavLink>
          <NavLink to="/resources" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BookOpen size={20} />
            <span>Resources</span>
          </NavLink>
          <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <SettingsIcon size={20} />
            <span>{t(lang, 'sidebarSettings')}</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <a href={`tel:${primaryPhone}`} className="sos-btn">
            <Phone size={18} />
            <span>Emergency Contacts</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

