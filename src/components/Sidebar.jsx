import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Phone, Activity, Menu, X, LogOut, History, Heart, Settings as SettingsIcon, BookOpen } from 'lucide-react';
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

      <div className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent-primary)'}}>
            <Heart size={28} fill="var(--accent-primary)" strokeWidth={1} />
            <h2>QuietCare</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} />
            <span>{t(lang, 'sidebarDashboard')}</span>
          </NavLink>
          <NavLink to="/journal" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <MessageSquare size={20} />
            <span>{t(lang, 'sidebarJournal')}</span>
          </NavLink>
          <NavLink to="/recent-chats" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <History size={20} />
            <span>{t(lang, 'sidebarRecentChats')}</span>
          </NavLink>
          <NavLink to="/self-help" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Activity size={20} />
            <span>{t(lang, 'sidebarSelfHelp')}</span>
          </NavLink>
          <NavLink to="/resources" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <BookOpen size={20} />
            <span>{t(lang, 'sidebarResources')}</span>
          </NavLink>
          <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <SettingsIcon size={20} />
            <span>{t(lang, 'sidebarSettings')}</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <a href={`tel:${primaryPhone}`} className="sos-btn">
            <Phone size={18} />
            <span>{t(lang, 'sidebarSOS')}</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

