import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Globe, Heart, Phone, Edit2, Save, X, Lock } from 'lucide-react';
import { t } from '../utils/i18n';
import { updateUserProfile } from '../utils/db';
import './Dashboard.css';

const Settings = ({ user, onLogout, refreshUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [caringFor, setCaringFor] = useState(user?.preferences?.caringFor || '');
  const [ec1Name, setEc1Name] = useState(user?.preferences?.emergencyContacts?.[0]?.name || '');
  const [ec1Phone, setEc1Phone] = useState(user?.preferences?.emergencyContacts?.[0]?.phone || '');
  const [ec2Name, setEc2Name] = useState(user?.preferences?.emergencyContacts?.[1]?.name || '');
  const [ec2Phone, setEc2Phone] = useState(user?.preferences?.emergencyContacts?.[1]?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const lang = user?.preferences?.language || 'en';

  const handleSave = async () => {
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setErrorMsg("Password must be 8+ chars with uppercase, lowercase, and special symbol.");
        return;
      }
    }

    const updatedData = {
      preferences: {
        ...user.preferences,
        language,
        caringFor,
        emergencyContacts: [
          { name: ec1Name, phone: ec1Phone },
          { name: ec2Name, phone: ec2Phone }
        ]
      }
    };

    if (newPassword) {
      updatedData.password = newPassword;
    }

    await updateUserProfile(user.id, updatedData);
    if (refreshUser) refreshUser();
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
  };

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1>{t(lang, 'sidebarSettings')}</h1>
          <p>Manage your profile and preferences.</p>
        </div>
        {!isEditing ? (
          <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderRadius: '20px'}}>
            <Edit2 size={18} /> Edit Profile
          </button>
        ) : (
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-secondary" onClick={() => {setIsEditing(false); setErrorMsg('');}} style={{display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderRadius: '20px'}}>
              <X size={18} /> Cancel
            </button>
            <button className="btn-primary" onClick={handleSave} style={{display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderRadius: '20px'}}>
              <Save size={18} /> Save
            </button>
          </div>
        )}
      </header>

      {errorMsg && (
        <div style={{ background: 'rgba(217,122,122,0.2)', color: 'var(--error)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      <div className="dashboard-grid" style={{gridTemplateColumns: '1fr', maxWidth: '600px'}}>
        <motion.div className="card glass" initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
            <div className="icon-wrapper" style={{width: '60px', height: '60px', marginBottom: 0}}>
              <User size={30} color="white" />
            </div>
            <div>
              <h2 style={{margin: 0}}>{user?.name}</h2>
              <p style={{margin: 0, color: 'var(--text-secondary)'}}>{user?.email}</p>
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Globe size={20} color="var(--accent-primary)" />
              <div style={{flex: 1}}>
                <p style={{margin: 0, fontWeight: 'bold'}}>Language</p>
                {isEditing ? (
                  <select value={language} onChange={e => setLanguage(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', marginTop: '4px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}}>
                    <option value="en" style={{color:'black'}}>English</option>
                    <option value="hi" style={{color:'black'}}>हिंदी (Hindi)</option>
                    <option value="kn" style={{color:'black'}}>ಕನ್ನಡ (Kannada)</option>
                  </select>
                ) : (
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{language === 'hi' ? 'हिंदी (Hindi)' : language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English'}</p>
                )}
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Heart size={20} color="var(--accent-primary)" />
              <div style={{flex: 1}}>
                <p style={{margin: 0, fontWeight: 'bold'}}>Caring For</p>
                {isEditing ? (
                  <select value={caringFor} onChange={e => setCaringFor(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', marginTop: '4px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}}>
                    <option value="parent" style={{color:'black'}}>Parent</option>
                    <option value="spouse" style={{color:'black'}}>Spouse / Partner</option>
                    <option value="sibling" style={{color:'black'}}>Sibling</option>
                    <option value="baby" style={{color:'black'}}>Baby / Child</option>
                    <option value="elderly" style={{color:'black'}}>Elderly</option>
                  </select>
                ) : (
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{caringFor}</p>
                )}
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
              <Phone size={20} color="var(--accent-primary)" style={{marginTop: '4px'}} />
              <div style={{flex: 1}}>
                <p style={{margin: 0, fontWeight: 'bold'}}>Emergency Contacts</p>
                {isEditing ? (
                  <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <input type="text" placeholder="Contact 1 Name" value={ec1Name} onChange={e => setEc1Name(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                    <input type="tel" placeholder="Contact 1 Phone" value={ec1Phone} onChange={e => setEc1Phone(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                    <input type="text" placeholder="Contact 2 Name" value={ec2Name} onChange={e => setEc2Name(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                    <input type="tel" placeholder="Contact 2 Phone" value={ec2Phone} onChange={e => setEc2Phone(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                  </div>
                ) : (
                  user?.preferences?.emergencyContacts?.map((c, i) => (
                    <p key={i} style={{margin: 0, color: 'var(--text-secondary)'}}>{c.name}: {c.phone}</p>
                  ))
                )}
              </div>
            </div>

            {isEditing && (
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
                <Lock size={20} color="var(--accent-primary)" style={{marginTop: '4px'}} />
                <div style={{flex: 1}}>
                  <p style={{margin: 0, fontWeight: 'bold'}}>Change Password</p>
                  <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)'}} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <button 
              className="btn-primary" 
              style={{width: '100%', marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--error)'}}
              onClick={onLogout}
            >
              <LogOut size={20} />
              {t(lang, 'sidebarLogout')}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
