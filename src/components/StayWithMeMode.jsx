import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getText } from '../utils/translations';

const promptList = {
  en: [
    "Take a slow breath with me",
    "Tell me one thing around you",
    "You're not alone, I'm here",
    "Stay with me, we’ll get through this",
    "Feel your feet on the ground",
    "Let your shoulders drop"
  ],
  hi: [
    "मेरे साथ एक धीमी सांस लें",
    "मुझे अपने आस-पास की एक चीज़ बताएं",
    "आप अकेले नहीं हैं, मैं यहाँ हूँ",
    "मेरे साथ रहें, हम इससे पार पा लेंगे",
    "ज़मीन पर अपने पैरों को महसूस करें",
    "अपने कंधों को ढीला छोड़ दें"
  ],
  kn: [
    "ನನ್ನೊಂದಿಗೆ ನಿಧಾನವಾಗಿ ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳಿ",
    "ನಿಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಒಂದು ವಿಷಯವನ್ನು ನನಗೆ ತಿಳಿಸಿ",
    "ನೀವು ಒಂಟಿಯಲ್ಲ, ನಾನಿಲ್ಲಿದ್ದೇನೆ",
    "ನನ್ನ ಜೊತೆಗಿರಿ, ನಾವು ಇದನ್ನು ದಾಟುತ್ತೇವೆ",
    "ನೆಲದ ಮೇಲೆ ನಿಮ್ಮ ಪಾದಗಳನ್ನು ಅನುಭವಿಸಿ",
    "ನಿಮ್ಮ ಭುಜಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ"
  ]
};

const defaultEmergencyContact = { name: 'KIRAN Helpline', phone: '18005990019' };

const StayWithMeMode = ({ onExit, user }) => {
  const { selectedLanguage } = useLanguage();
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isLooping, setIsLooping] = useState(false);
  const synth = window.speechSynthesis;
  const promptIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const lastPromptIndex = useRef(-1);

  const primaryContact = user?.preferences?.emergencyContacts?.[0] || defaultEmergencyContact;
  const secondaryContact = user?.preferences?.emergencyContacts?.[1] || { name: '', phone: '' };

  const speak = (text) => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.lang = langCode;
    utterance.rate = 0.85; // Slow and calming
    utterance.pitch = 1.0;
    
    const voices = synth.getVoices();
    let preferredVoice = voices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Female') || v.name.includes('Samantha')));
    if (!preferredVoice) preferredVoice = voices.find(v => v.lang.startsWith(langCode));
    if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    synth.speak(utterance);
  };

  const getNewPrompt = () => {
    const list = promptList[selectedLanguage] || promptList['en'];
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * list.length);
    } while (nextIndex === lastPromptIndex.current && list.length > 1);
    lastPromptIndex.current = nextIndex;
    return list[nextIndex];
  };

  const cyclePrompt = () => {
    const nextPrompt = getNewPrompt();
    setCurrentPrompt(nextPrompt);
    speak(nextPrompt);
  };

  useEffect(() => {
    const introMsg = selectedLanguage === 'hi' 
      ? "मैं यहाँ आपके साथ हूँ। आइए अगले 2 मिनट के लिए एक साथ रहें।"
      : selectedLanguage === 'kn'
      ? "ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ಮುಂದಿನ 2 ನಿಮಿಷಗಳ ಕಾಲ ಒಟ್ಟಿಗೆ ಇರೋಣ."
      : "I'm here with you. Let's stay together for the next 2 minutes.";
      
    speak(introMsg);
    
    // Start loop after brief delay
    const initialDelay = setTimeout(() => {
      cyclePrompt();
      promptIntervalRef.current = setInterval(cyclePrompt, 18000); // ~18 seconds
    }, 6000);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsLooping(true);
          const loopMsg = selectedLanguage === 'hi'
            ? "मैं अभी भी आपके साथ हूँ। आइए थोड़ा और साथ रहें।"
            : selectedLanguage === 'kn'
            ? "ನಾನು ಇನ್ನೂ ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ಸ್ವಲ್ಪ ಹೆಚ್ಚು நேரம் ಒಟ್ಟಿಗೆ ಇರೋಣ."
            : "I'm still here with you. Let's stay together a little longer.";
          speak(loopMsg);
          return 120; // reset to 2 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(promptIntervalRef.current);
      clearInterval(timerRef.current);
      synth.cancel();
    };
  }, [selectedLanguage]);

  const handleExit = () => {
    synth.cancel();
    clearInterval(promptIntervalRef.current);
    clearInterval(timerRef.current);
    onExit();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="crisis-overlay" style={{ zIndex: 9999 }}>
      <motion.div 
        className="crisis-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-card)', border: '2px solid var(--accent-primary)', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ marginBottom: '2rem' }}
        >
          <ShieldCheck size={64} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
        </motion.div>
        
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.8rem' }}>
          {isLooping 
            ? (selectedLanguage === 'hi' ? "मैं अभी भी आपके साथ हूँ।" : selectedLanguage === 'kn' ? "ನಾನು ಇನ್ನೂ ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ." : "I'm still here with you.")
            : (selectedLanguage === 'hi' ? "मैं यहाँ आपके साथ हूँ।" : selectedLanguage === 'kn' ? "ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ." : "I'm here with you.")}
        </h2>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPrompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1 }}
            style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <h3 style={{ color: 'var(--accent-secondary)', fontSize: '1.5rem', fontWeight: 'normal', margin: 0 }}>
              "{currentPrompt}"
            </h3>
          </motion.div>
        </AnimatePresence>

        <div className="breathing-container" style={{ margin: '3rem 0' }}>
          <motion.div 
            className="breathing-circle"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'white', fontWeight: 'bold' }}
          >
          </motion.div>
        </div>

        <div className="crisis-actions" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href={`tel:${primaryContact.phone}`} className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--error)' }}>
            <Phone size={20} />
            {selectedLanguage === 'hi' ? `कॉल करें ${primaryContact.name}` : selectedLanguage === 'kn' ? `ಕರೆ ಮಾಡಿ ${primaryContact.name}` : `Call ${primaryContact.name}`}
          </a>
          
          {secondaryContact.name && (
             <a href={`tel:${secondaryContact.phone}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Phone size={20} />
              {selectedLanguage === 'hi' ? `कॉल करें ${secondaryContact.name}` : selectedLanguage === 'kn' ? `ಕರೆ ಮಾಡಿ ${secondaryContact.name}` : `Call ${secondaryContact.name}`}
            </a>
          )}

          <button onClick={handleExit} className="btn-secondary" style={{ marginTop: '1rem', border: 'none', background: 'transparent', textDecoration: 'underline' }}>
            {selectedLanguage === 'hi' ? "मैं ठीक हूँ" : selectedLanguage === 'kn' ? "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ" : "I'm okay"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StayWithMeMode;
