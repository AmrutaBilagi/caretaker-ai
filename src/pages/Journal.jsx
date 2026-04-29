import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Phone, AlertTriangle } from 'lucide-react';
import vader from 'vader-sentiment';
import './Journal.css';

// Pre-defined response templates based on VADER sentiment to simulate AI
const responses = {
  positive: [
    "I'm really glad to hear that. Finding moments of peace and positivity as a caregiver is so important. What is something small that brought you comfort today?",
    "It sounds like you're having a good moment. You deserve to feel this way. Hold onto this feeling.",
    "That's wonderful to hear. Caregiving is a journey, and celebrating the good times is vital for your well-being.",
    "I can feel the positivity in your words! Keep nurturing that energy.",
    "Thank you for sharing that joy with me. It brightens the space."
  ],
  negative: [
    "I hear the heaviness in your words. It takes strength to admit when you're struggling. I'm here to listen without judgment.",
    "It sounds like you're carrying a massive burden right now. Caregiving is incredibly taxing, and it is entirely valid to feel exhausted.",
    "I'm so sorry you're going through this. Please know that your feelings are completely valid and you are allowed to feel upset.",
    "This sounds really difficult. Remember to take a deep breath. You are doing the best you can in a hard situation.",
    "It's okay to feel overwhelmed. You don't have to be strong all the time. I'm here for you."
  ],
  neutral: [
    "Thank you for sharing that with me. As a caregiver, your feelings are valid. Tell me more about what's on your mind today.",
    "I'm here for you. Take things one step at a time.",
    "I am listening. Sometimes just writing things out can help process the day.",
    "Got it. Feel free to elaborate if you'd like, or just rest for a moment.",
    "I understand. How are you holding up physically with everything else going on?"
  ]
};

// Simulated AI Generator with Anti-Repetition
const generateEmpatheticResponse = (text, history) => {
  const lowerText = text.toLowerCase();
  
  // 1. Crisis Detection Module (Highest Priority)
  if (lowerText.match(/(suicide|kill myself|end it|want to die|can't go on|give up completely|no point in living)/)) {
    return {
      crisis: true,
      text: "I am so sorry you are feeling this much pain. Please know you are not alone. I need you to stay safe. I am triggering the Emergency Support module now. Please look at the resources on your screen or call someone you trust."
    };
  }

  // 2. VADER Sentiment Analysis
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  const compound = intensity.compound;

  let category = 'neutral';
  if (compound >= 0.05) category = 'positive';
  else if (compound <= -0.05) category = 'negative';

  // 3. Select a response that hasn't been used recently
  const possibleResponses = responses[category];
  const availableResponses = possibleResponses.filter(r => !history.includes(r));
  
  // Fallback if all have been used (reset history conceptually)
  const selectedText = availableResponses.length > 0 
    ? availableResponses[Math.floor(Math.random() * availableResponses.length)]
    : possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

  return { crisis: false, text: selectedText };
};

const Journal = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm here to listen. How was your day? You can type or use your voice.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [micError, setMicError] = useState(false);
  const [responseHistory, setResponseHistory] = useState([]);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition Safely
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

    // Simulated API Call Delay
    setTimeout(() => {
      const aiResponse = generateEmpatheticResponse(userText, responseHistory);
      
      // Update history to prevent repetition (keep last 10)
      setResponseHistory(prev => {
        const newHistory = [...prev, aiResponse.text];
        if (newHistory.length > 10) newHistory.shift();
        return newHistory;
      });

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse.text, sender: 'ai' }]);
      speakText(aiResponse.text);

      if (aiResponse.crisis) {
        setIsCrisis(true);
      }
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="journal-container animate-fade-in">
      <div className="journal-header">
        <h2>Emotion-Aware Support</h2>
        <p>Your private, safe space. Data is encrypted and stays locally on your device.</p>
      </div>

      <AnimatePresence>
        {isCrisis && (
          <motion.div 
            className="crisis-modal"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="crisis-header">
              <AlertTriangle size={32} color="var(--error)" />
              <h3>Emergency Support Triggered</h3>
            </div>
            <p>You are not alone. Please reach out to someone who can help you right now.</p>
            
            <div className="crisis-actions">
              <a href="tel:18005990019" className="crisis-btn main-helpline" style={{textDecoration: 'none'}}>
                <Phone size={20} />
                Call KIRAN Helpline (1800-599-0019)
              </a>
              <a href="tel:1234567890" className="crisis-btn contact-btn" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Phone size={20} style={{marginRight: '8px'}} />
                Call Trusted Contact (Dr. Sharma)
              </a>
            </div>
            
            <div className="grounding-exercise">
              <h4>Grounding Technique (5-4-3-2-1)</h4>
              <p>Take a slow, deep breath. Look around you and find:</p>
              <ul>
                <li><strong>5</strong> things you can see</li>
                <li><strong>4</strong> things you can physically feel</li>
                <li><strong>3</strong> things you can hear</li>
                <li><strong>2</strong> things you can smell</li>
                <li><strong>1</strong> thing you can taste</li>
              </ul>
            </div>
            
            <button className="dismiss-crisis" onClick={() => setIsCrisis(false)}>I am safe now</button>
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
              <div className={`message ${msg.sender}`}>
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

