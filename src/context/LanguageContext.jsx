import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../utils/db';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // Initialize from user preferences or localStorage
    const user = getCurrentUser();
    if (user?.preferences?.language) {
      setSelectedLanguage(user.preferences.language);
    } else {
      const savedLang = localStorage.getItem('caregiver_language');
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem('caregiver_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
