import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Phone, AlertTriangle, Save, Volume2, VolumeX } from 'lucide-react';
import vader from 'vader-sentiment';
import { saveChatSession, addMoodEntry } from '../utils/db';
import { useNavigate } from 'react-router-dom';
import './Journal.css';

// Expressive AI Generator with Keyword Matching
const generateEmpatheticResponse = (text, history) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/(suicide|kill myself|end it|want to die|can't go on|give up completely|no point in living)/)) {
    return {
      crisis: true,
      text: "I am so sorry you are feeling this much pain. Please know you are not alone. I need you to stay safe. I am triggering the Emergency Support module now. Please look at the resources on your screen or call someone you trust.",
      score: -1
    };
  }

  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  const compound = intensity.compound;

  let selectedText = "";

  // Expressive Keyword Matching
  if (lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('sleepy')) {
    selectedText = "I can hear the exhaustion in your words. Caregiving drains you physically and mentally. Please remember that resting is not a luxury, it's a necessity. If possible, try to step away for just 5 minutes today to close your eyes. You deserve a break.";
  } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) {
    selectedText = "It is completely valid to feel frustrated and angry. You are giving so much of yourself, and it often feels unfair or overwhelming. Take a deep breath. Let that anger out here where it's safe. It's okay to feel this way.";
  } else if (lowerText.includes('lonely') || lowerText.includes('alone') || lowerText.includes('isolated')) {
    selectedText = "Caregiving can be one of the most isolating experiences. It feels like no one else understands the weight you carry. I am here listening to you. Please consider reaching out to a friend or a support group when you feel ready.";
  } else if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('relieved')) {
    selectedText = "I am so glad to hear that. Finding these moments of light and relief is what keeps us going. Hold onto this feeling, and be proud of yourself for navigating this journey. What made today feel a bit lighter for you?";
  } else {
    // Fallback to VADER sentiment
    if (compound >= 0.05) {
      selectedText = "It sounds like there's a gentle positivity in what you're saying. Cultivating these moments is so important for your own well-being. Tell me more about what's bringing you comfort right now.";
    } else if (compound <= -0.05) {
      selectedText = "I hear the heaviness in your words. The burden you carry is massive, and you don't have to be strong all the time. I'm right here with you. What is weighing on you the most right now?";
    } else {
      selectedText = "Thank you for sharing that with me. Your thoughts and feelings matter here. I am listening. Sometimes just getting it all out into the open can relieve a little bit of the pressure.";
    }
  }

  // Anti-Repetition Fallback (simple suffix)
  if (history.includes(selectedText)) {
    selectedText += " I'm still here, and I'm still listening.";
  }

  return { crisis: false, text: selectedText, score: compound };
};

const Journal = ({ user, refreshUser }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm here to listen. How was your day? You can type or use your voice.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [micError, setMicError] = useState(false);
  const [useVoice, setUseVoice] = useState(true); // Voice Toggle
  const [responseHistory, setResponseHistory] = useState([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const primaryContact = user?.preferences?.emergencyContacts?.[0] || { name: 'KIRAN Helpline', phone: '18005990019' };
  const secondaryContact = user?.preferences?.emergencyContacts?.[1] || { name: 'Trusted Contact', phone: '' };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev.endsWith(' ') ? '' : ' ') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setMicError(true);
        setTimeout(() => setMicError(false), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setMicError(true);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setMicError(true);
        setTimeout(() => setMicError(false), 3000);
        return;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setMicError(false);
      } catch (err) {
        console.error("Microphone start error:", err);
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.9; 
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);

    setTimeout(() => {
      const aiResponse = generateEmpatheticResponse(userText, responseHistory);
      
      setSessionScore(prev => prev + aiResponse.score);
      setMessageCount(prev => prev + 1);

      setResponseHistory(prev => {
        const newHistory = [...prev, aiResponse.text];
        if (newHistory.length > 10) newHistory.shift();
        return newHistory;
      });

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse.text, sender: 'ai' }]);
      
      if (useVoice) {
        speakText(aiResponse.text);
      }

      if (aiResponse.crisis) {
        setIsCrisis(true);
      }
    }, 1500);
  };

  const handleEndSession = async () => {
    if (messages.length > 1 && user) {
      const avgCompound = messageCount > 0 ? (sessionScore / messageCount) : 0;
      const moodScale = Math.round(((avgCompound + 1) / 2) * 4) + 1; // Maps 0-2 to 1-5
      
      await saveChatSession(user.id, messages);
      await addMoodEntry(user.id, moodScale);
      
      if (refreshUser) refreshUser();
      
      navigate('/recent-chats'); // Navigate to recent chats after finishing
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="journal-container animate-fade-in">
      <div className="journal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2>QuietCare Journal</h2>
          <p>Your private, safe space. Data is encrypted and stays locally on your device.</p>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button 
            onClick={() => setUseVoice(!useVoice)}
            className="btn-secondary" 
            style={{display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderRadius: '20px'}}
            title={useVoice ? "Mute AI Voice" : "Enable AI Voice"}
          >
            {useVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {useVoice ? "Voice On" : "Voice Off"}
          </button>
          <button className="btn-primary" onClick={handleEndSession} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <Save size={18} /> Finish Session
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCrisis && (
          <motion.div 
            className="crisis-modal glass"
            style={{background: 'white', color: 'var(--text-primary)'}}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="crisis-header">
              <AlertTriangle size={32} color="var(--error)" />
              <h3 style={{color: 'var(--text-primary)'}}>Emergency Support Triggered</h3>
            </div>
            <p style={{color: 'var(--text-secondary)'}}>You are not alone. Please reach out to someone who can help you right now.</p>
            
            <div className="crisis-actions">
              <a href={`tel:${primaryContact.phone}`} className="crisis-btn main-helpline" style={{textDecoration: 'none'}}>
                <Phone size={20} />
                Call {primaryContact.name}
              </a>
              {secondaryContact.phone && (
                <a href={`tel:${secondaryContact.phone}`} className="crisis-btn contact-btn" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Phone size={20} style={{marginRight: '8px'}} />
                  Call {secondaryContact.name}
                </a>
              )}
            </div>
            
            <button className="dismiss-crisis" style={{color: 'var(--text-primary)', border: '1px solid var(--text-secondary)'}} onClick={() => setIsCrisis(false)}>I am safe now</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-area glass">
        <div className="messages-container">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              className={`message-wrapper ${msg.sender}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`message ${msg.sender}`} style={msg.sender === 'ai' ? {background: 'rgba(255,255,255,0.8)', color: 'var(--text-primary)'} : {}}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area" style={{ position: 'relative' }}>
          {micError && (
            <div style={{ position: 'absolute', top: '-40px', left: '10px', background: 'var(--error)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '12px' }}>
              Microphone unavailable or denied.
            </div>
          )}
          <button 
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            title="Use Voice (Speech-to-Text)"
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak how you're feeling..."
            style={{background: 'rgba(255,255,255,0.5)', color: 'var(--text-primary)'}}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;



