import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../utils/db';
import { t } from '../utils/i18n';
import './Onboarding.css';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    language: 'en',
    caringFor: '',
    hobbies: [],
    emergencyContacts: [{ name: '', phone: '' }, { name: '', phone: '' }]
  });
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const toggleHobby = (hobby) => {
    setFormData(prev => {
      const hobbies = prev.hobbies.includes(hobby) 
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby];
      return { ...prev, hobbies };
    });
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, emergencyContacts: newContacts });
  };

  const finishOnboarding = async () => {
    try {
      const updatedUser = await updateUserProfile(user.id, {
        onboardingCompleted: true,
        preferences: formData
      });
      onComplete(updatedUser);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div className="onboarding-step" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
            <h2>{t(formData.language, 'onboardingLang')}</h2>
            <div className="options-grid">
              {['en', 'hi', 'kn'].map(lang => (
                <button 
                  key={lang} 
                  className={`option-btn ${formData.language === lang ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, language: lang})}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'ಕನ್ನಡ (Kannada)'}
                </button>
              ))}
            </div>
            <button className="btn-primary start-btn" onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div className="onboarding-step" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
            <h2>{t(formData.language, 'onboardingCaringFor')}</h2>
            <div className="options-grid">
              {['Parent', 'Spouse/Partner', 'Siblings', 'Babies', 'Elderly people'].map(opt => (
                <button 
                  key={opt} 
                  className={`option-btn ${formData.caringFor === opt ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, caringFor: opt})}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="btn-group">
              <button className="btn-secondary" onClick={handlePrev}>Back</button>
              <button className="btn-primary" onClick={handleNext} disabled={!formData.caringFor}>Next</button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div className="onboarding-step" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
            <h2>{t(formData.language, 'onboardingHobbies')}</h2>
            <div className="options-grid multi">
              {['Dance', 'Music', 'Journaling', 'Reading', 'Gardening', 'Meditation', 'Walking'].map(opt => (
                <button 
                  key={opt} 
                  className={`option-btn ${formData.hobbies.includes(opt) ? 'selected' : ''}`}
                  onClick={() => toggleHobby(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="btn-group">
              <button className="btn-secondary" onClick={handlePrev}>Back</button>
              <button className="btn-primary" onClick={handleNext}>Next</button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div className="onboarding-step" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
            <h2>{t(formData.language, 'onboardingEmergency')}</h2>
            
            <div className="contact-form">
              <h4>Contact 1</h4>
              <input type="text" placeholder="Name (e.g. Mom)" value={formData.emergencyContacts[0].name} onChange={e => updateContact(0, 'name', e.target.value)} />
              <input type="tel" placeholder="Phone Number" value={formData.emergencyContacts[0].phone} onChange={e => updateContact(0, 'phone', e.target.value)} />
            </div>

            <div className="contact-form">
              <h4>Contact 2</h4>
              <input type="text" placeholder="Name (e.g. Best Friend)" value={formData.emergencyContacts[1].name} onChange={e => updateContact(1, 'name', e.target.value)} />
              <input type="tel" placeholder="Phone Number" value={formData.emergencyContacts[1].phone} onChange={e => updateContact(1, 'phone', e.target.value)} />
            </div>

            <div className="btn-group">
              <button className="btn-secondary" onClick={handlePrev}>Back</button>
              <button className="btn-primary" onClick={finishOnboarding} disabled={!formData.emergencyContacts[0].phone}>Finish</button>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card glass">
        <h1>QuietCare</h1>
        <p className="subtitle">{t(formData.language, 'onboardingSubtitle')}</p>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${(step/4)*100}%`}}></div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
