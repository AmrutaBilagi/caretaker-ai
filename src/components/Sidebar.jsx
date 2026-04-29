import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Phone, Activity, Menu, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Caregiver AI</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/journal" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <MessageSquare size={20} />
            <span>Invisible Journal</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="sos-btn">
            <Phone size={18} />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
