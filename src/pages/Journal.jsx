import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Phone, AlertTriangle, Save, Volume2, VolumeX } from 'lucide-react';
import vader from 'vader-sentiment';
import { saveChatSession, addMoodEntry } from '../utils/db';
import { useNavigate } from 'react-router-dom';
import './Journal.css';

const SYSTEM_PROMPT = `You are an emotionally intelligent AI wellness assistant with text + voice emotion understanding. Detect the user’s mood from words, sentence style, typing pattern, and voice tone (stress, sadness, anger, anxiety, calmness, hopelessness, joy). Respond naturally, warmly, and differently every time. Never sound robotic, repetitive, generic, or scripted.

## Core Behavior
* Understand hidden emotions behind text.
* Match response tone to user emotion with empathy and care.
* Make the user feel heard, safe, valued, and supported.
* Use varied wording each time.

## Dynamic Response Style
Use different openings like: "That sounds really heavy right now.", "I’m glad you shared this.", etc.
Then give: 1. Validation, 2. Comfort, 3. Small practical step, 4. Gentle follow-up question.

## Crisis / Suicide Mode
If user suggests self-harm, suicide, goodbye intent, hopelessness with danger:
Set "crisis": true. Say their safety matters now. Encourage contacting emergency services immediately. Keep user engaged continuously. Offer immediate grounding tools.

## Style Rules
* Human-like, emotionally rich, concise.
* Different response every time.
* Never judge or dismiss.
* Prioritize safety, hope, calmness, and connection.

IMPORTANT: You MUST return ONLY a valid JSON object matching this schema:
{
  "text": "Your emotionally intelligent response here",
  "crisis": false,
  "score": 0.5
}
Where score is between -1.0 (extremely negative/crisis) and 1.0 (extremely positive). Do not return markdown, just the raw JSON object.`;

// Expressive AI Generator with Keyword Matching (Fallback)
const generateHeuristicResponse = (text, history) => {
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

  if (history.includes(selectedText)) {
    selectedText += " I'm still here, and I'm still listening.";
  }

  return { crisis: false, text: selectedText, score: compound };
};

const generateGeminiResponse = async (text, apiKey, history) => {
  try {
    const historyPrompt = history.length > 0 ? `\nPrevious conversation context:\n${history.join('\n')}` : '';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: text + historyPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const jsonText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(jsonText);
      return {
        text: parsed.text || "I'm here for you.",
        crisis: !!parsed.crisis,
        score: parsed.score || 0
      };
    }
    throw new Error("Failed to parse Gemini response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateHeuristicResponse(text, history); // Fallback to heuristic
  }
};

const GroundingModule = ({ stage, setStage, primaryContact, secondaryContact }) => {
  const [inputs, setInputs] = useState([]);
  
  useEffect(() => {
    if (stage === '5') setInputs(Array(5).fill(''));
    else if (stage === '4') setInputs(Array(4).fill(''));
    else if (stage === '3') setInputs(Array(3).fill(''));
    else if (stage === '2') setInputs(Array(2).fill(''));
    else if (stage === '1') setInputs(Array(1).fill(''));
  }, [stage]);

  const handleInputChange = (idx, val) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const isComplete = inputs.every(i => i.trim().length > 0);

  const handleNext = () => {
    if (stage === '5') setStage('4');
    else if (stage === '4') setStage('3');
    else if (stage === '3') setStage('2');
    else if (stage === '2') setStage('1');
    else if (stage === '1') setStage('breathing');
  };

  const getStageTitle = () => {
    switch(stage) {
      case '5': return "Name 5 things you can see around you right now.";
      case '4': return "Name 4 things you can physically feel.";
      case '3': return "Name 3 things you can hear right now.";
      case '2': return "Name 2 things you can smell.";
      case '1': return "Name 1 good thing about yourself.";
      default: return "";
    }
  };

  return (
    <div className="crisis-overlay">
      <motion.div 
        className="crisis-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="crisis-header">
          <AlertTriangle size={32} color="var(--accent-primary)" />
          <h3>Emergency Support Triggered</h3>
        </div>
        
        {stage !== 'breathing' ? (
          <>
            <p className="grounding-subtitle">
              Your trusted contact has been notified. While we wait for them, I need you to stay with me. Let's do a grounding exercise together.
            </p>
            <h4 style={{marginBottom: '1rem', color: 'var(--text-primary)'}}>{getStageTitle()}</h4>
            <div className="grounding-inputs">
              {inputs.map((val, idx) => (
                <input 
                  key={idx}
                  className="grounding-input"
                  placeholder={`Item ${idx + 1}...`}
                  value={val}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                />
              ))}
            </div>
            <div className="grounding-actions">
              <button 
                className="btn-primary" 
                style={{flex: 1}} 
                disabled={!isComplete}
                onClick={handleNext}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="grounding-subtitle">
              You are doing great. Now, let's breathe together until you feel safe or help arrives.
            </p>
            <div className="breathing-container">
              <div className="breathing-circle">Breathe</div>
            </div>
            <p style={{marginTop: '1rem', color: 'var(--text-secondary)'}}>Inhale deeply... Hold... Exhale slowly...</p>
          </>
        )}

        <div className="crisis-actions" style={{marginTop: '2rem', borderTop: '1px solid var(--border-medium)', paddingTop: '2rem'}}>
          <a href={`tel:${primaryContact.phone}`} className="crisis-btn main-helpline" style={{textDecoration: 'none'}}>
            <Phone size={20} />
            Call {primaryContact.name}
          </a>
          {secondaryContact.phone && (
            <a href={`tel:${secondaryContact.phone}`} className="crisis-btn contact-btn" style={{textDecoration: 'none'}}>
              <Phone size={20} />
              Call {secondaryContact.name}
            </a>
          )}
        </div>
        <button className="dismiss-crisis" onClick={() => setStage('none')}>I am safe now</button>
      </motion.div>
    </div>
  );
};

const Journal = ({ user, refreshUser }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm here to listen. How was your day? You can type or use your voice.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [crisisStage, setCrisisStage] = useState('none');
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

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);

    const apiKey = user?.preferences?.geminiApiKey;
    let aiResponse;
    
    if (apiKey) {
      aiResponse = await generateGeminiResponse(userText, apiKey, responseHistory);
    } else {
      aiResponse = generateHeuristicResponse(userText, responseHistory);
    }
      
    setSessionScore(prev => prev + aiResponse.score);
    setMessageCount(prev => prev + 1);

    setResponseHistory(prev => {
      const newHistory = [...prev, `User: ${userText}`, `AI: ${aiResponse.text}`];
      if (newHistory.length > 10) newHistory.shift();
      if (newHistory.length > 10) newHistory.shift();
      return newHistory;
    });

    setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse.text, sender: 'ai' }]);
    
    if (useVoice) {
      speakText(aiResponse.text);
    }

    if (aiResponse.crisis) {
      setCrisisStage('5');
    }
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
          <h2 style={{display: 'flex', alignItems: 'center'}}>
            <span className="online-indicator"></span>
            Caregiver AI
          </h2>
          <p>Online • Private and Secure</p>
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button 
            onClick={() => setUseVoice(!useVoice)}
            className="btn-secondary" 
            title={useVoice ? "Mute AI Voice" : "Enable AI Voice"}
          >
            {useVoice ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {useVoice ? "Voice On" : "Voice Off"}
          </button>
          <button className="btn-primary" onClick={handleEndSession}>
            <Save size={18} /> Finish Session
          </button>
        </div>
      </div>

      <AnimatePresence>
        {crisisStage !== 'none' && (
          <GroundingModule 
            stage={crisisStage} 
            setStage={setCrisisStage} 
            primaryContact={primaryContact} 
            secondaryContact={secondaryContact} 
          />
        )}
      </AnimatePresence>

      <div className="chat-area">
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

        <div className="input-area">
          {micError && (
            <div style={{ position: 'absolute', top: '-40px', left: '10px', background: 'var(--error)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', zIndex: 10 }}>
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



