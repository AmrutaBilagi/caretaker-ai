import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Phone, AlertTriangle, Save, Volume2, VolumeX } from 'lucide-react';
import vader from 'vader-sentiment';
import { saveChatSession, addMoodEntry, updateChatSession } from '../utils/db';
import { translateToSelectedLanguage, translateToEnglish } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';
import StayWithMeMode from '../components/StayWithMeMode';
import { useNavigate } from 'react-router-dom';
import { useMultimodalEmotion } from '../hooks/useMultimodalEmotion';
import { MultimodalCheckInCard } from '../components/MultimodalCheckInCard';
import { fuseMultimodalEmotion } from '../utils/emotionFusion';
import './Journal.css';

const SYSTEM_PROMPT = `You are an emotionally intelligent AI wellness assistant with multimodal text + facial emotion understanding. Detect the user’s mood from words, sentence style, typing pattern, voice tone, and their current facial expression (if provided). Respond naturally, warmly, and differently every time. Never sound robotic, repetitive, generic, or scripted.

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
const generateHeuristicResponse = (text, history, multimodalContext = {}) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/(suicide|kill myself|end it|want to die|can't go on|give up completely|no point in living)/)) {
    return {
      crisis: true,
      text: "I am so sorry you are feeling this much pain. Please know you are not alone. I need you to stay safe. I am triggering the Emergency Support module now. Please look at the resources on your screen or call someone you trust.",
      score: -1
    };
  }

  const { faceEmotion, faceStressScore, textStressScore } = multimodalContext;
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
    // Multimodal Fallback
    if (faceStressScore > 0.8 && compound > -0.05 && compound < 0.05) {
      selectedText = "You seem quite tense right now, even if your words are calm. Would you like to slow down and take a deep breath together? I am here for you.";
    } else if (faceEmotion === 'sad' && compound > -0.05 && compound < 0.05) {
      selectedText = "I sense a bit of sadness, even though your words are neutral. It's okay to not be okay. What is really weighing on your mind?";
    } else if (compound >= 0.05) {
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

const generateGeminiResponse = async (text, multimodalContextString, apiKey, history, multimodalContext) => {
  try {
    const historyPrompt = history.length > 0 ? `\nPrevious conversation context:\n${history.join('\n')}` : '';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: multimodalContextString + text + historyPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      let jsonText = data.candidates[0].content.parts[0].text;
      jsonText = jsonText.replace(/```json/gi, '').replace(/```/gi, '').trim();
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
    return generateHeuristicResponse(text, history, multimodalContext); // Fallback to heuristic
  }
};

// Removed GroundingModule

const Journal = ({ user, refreshUser }) => {
  const { selectedLanguage } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm here to listen. How was your day? You can type or use your voice.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [crisisStage, setCrisisStage] = useState('none');
  const [micError, setMicError] = useState(false);
  const [useVoice, setUseVoice] = useState(true); // Voice Toggle
  const [multimodalEnabled, setMultimodalEnabled] = useState(user?.preferences?.autoStartMultimodal || user?.preferences?.faceEmotionDetectionEnabled || false);
  const multimodalContextData = useMultimodalEmotion(multimodalEnabled);
  const { videoRef, isCameraOn, detectedEmotion, emotionConfidence, isListening, audioLevel, voiceStressScore, micError: hookMicError, getCurrentEmotionSnapshot } = multimodalContextData;
  const [responseHistory, setResponseHistory] = useState([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [cumulativeTextStress, setCumulativeTextStress] = useState(0);
  const [cumulativeFaceStress, setCumulativeFaceStress] = useState(0);
  const [cumulativeVoiceStress, setCumulativeVoiceStress] = useState(0);
  const [cumulativeFusedStress, setCumulativeFusedStress] = useState(0);
  const [sessionId] = useState(Date.now().toString());

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
        recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
        recognitionRef.current.start();
        setIsRecording(true);
        setMicError(false);
      } catch (err) {
        console.error("Microphone start error:", err);
      }
    }
  };

  const toggleMultimodal = () => {
    if (!multimodalEnabled) {
      setMultimodalEnabled(true);
      if (!isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
          recognitionRef.current.start();
          setIsRecording(true);
          setMicError(false);
        } catch (err) {
          console.error("Microphone start error:", err);
        }
      }
    } else {
      if (input.trim()) {
        handleSend();
      }
      setMultimodalEnabled(false);
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-IN';
      utterance.lang = langCode;
      
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice = voices.find(v => v.lang.startsWith(langCode) && (v.name.includes('Female') || v.name.includes('Samantha')));
      if (!preferredVoice) preferredVoice = voices.find(v => v.lang.startsWith(langCode));
      if (!preferredVoice) preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
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

    const apiKey = user?.preferences?.geminiApiKey || 'AIzaSyCCDer6McuSdtr2nmlzjzkrVbQCA3hyyrg';
    let aiResponse;
    
    const englishUserText = await translateToEnglish(userText, selectedLanguage, apiKey);
    
    let fusedScore = 0;
    let currentTextStress = 0;
    let currentFaceStress = 0;
    let currentVoiceStress = 0;
    let currentFusedStress = 0;
    let fallbackContext = {};
    
    const snapshot = getCurrentEmotionSnapshot();
    let fusionResult = null;

    if (multimodalEnabled) {
       fusionResult = fuseMultimodalEmotion(englishUserText, snapshot.face.detectedEmotion, snapshot.face.confidence, snapshot.voice);
       currentTextStress = fusionResult.textStressScore;
       currentFaceStress = fusionResult.faceStressScore;
       currentVoiceStress = fusionResult.voiceStressScore || 0;
       currentFusedStress = fusionResult.fusedStressScore;
       fusedScore = (1 - fusionResult.fusedStressScore) * 2 - 1; // map 0-1 stress to 1 to -1 score
       fallbackContext = {
         faceEmotion: snapshot.face.detectedEmotion,
         faceConfidence: snapshot.face.confidence,
         textStressScore: currentTextStress,
         faceStressScore: currentFaceStress,
         voiceStressScore: currentVoiceStress,
         fusedStressScore: currentFusedStress
       };
    } else {
       const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(englishUserText);
       fusedScore = intensity.compound;
       currentTextStress = ((-intensity.compound) + 1) / 2; // map to 0-1 stress
       currentFusedStress = currentTextStress;
    }

    setCumulativeTextStress(prev => prev + currentTextStress);
    setCumulativeFaceStress(prev => prev + currentFaceStress);
    setCumulativeVoiceStress(prev => prev + currentVoiceStress);
    setCumulativeFusedStress(prev => prev + currentFusedStress);

    const multimodalContextString = multimodalEnabled ? `[System Note: The user's current facial expression is detected as ${snapshot.face.detectedEmotion || 'neutral'} with ${Math.round((snapshot.face.confidence || 0) * 100)}% confidence. Voice stress is ${Math.round((snapshot.voice.stressScore || 0) * 100)}%. User's overall stress is assessed at ${Math.round(currentFusedStress * 100)}%. ${fusionResult?.isMasking ? 'CRITICAL: The user is likely masking negative emotions behind positive words.' : ''} ${fusionResult?.isSilentStruggle ? 'CRITICAL: The user is experiencing a silent struggle; their face/voice indicates high stress despite neutral words.' : ''}]\n` : '';
    
    if (apiKey) {
      aiResponse = await generateGeminiResponse(englishUserText, multimodalContextString, apiKey, responseHistory, fallbackContext);
      aiResponse.score = (aiResponse.score + fusedScore) / 2; // Average Gemini score and Fused score
    } else {
      aiResponse = generateHeuristicResponse(englishUserText, responseHistory, fallbackContext);
      aiResponse.score = fusedScore;
    }
      
    setSessionScore(prev => prev + aiResponse.score);
    setMessageCount(prev => prev + 1);

    setResponseHistory(prev => {
    const newHistory = [...prev, `User: ${userText}`, `AI: ${aiResponse.text}`];
      if (newHistory.length > 10) newHistory.shift();
      if (newHistory.length > 10) newHistory.shift();
      return newHistory;
    });

    const translatedText = await translateToSelectedLanguage(aiResponse.text, selectedLanguage, apiKey);
    aiResponse.text = translatedText;

    const newMessages = [...messages, 
      { id: Date.now(), text: userText, sender: 'user' },
      { id: Date.now() + 1, text: translatedText, sender: 'ai' }
    ];
    setMessages(newMessages);

    // Save progressively to DB
    const avgTextStress = (cumulativeTextStress + currentTextStress) / (messageCount + 1);
    const avgFaceStress = (cumulativeFaceStress + currentFaceStress) / (messageCount + 1);
    const avgVoiceStress = (cumulativeVoiceStress + currentVoiceStress) / (messageCount + 1);
    const avgFusedStress = (cumulativeFusedStress + currentFusedStress) / (messageCount + 1);

    const sessionSummary = {
      avgTextScore: avgTextStress,
      avgFaceStress: avgFaceStress,
      avgVoiceStress: avgVoiceStress,
      avgFusedStress: avgFusedStress,
      dominantFaceEmotion: snapshot.face.detectedEmotion || null,
      usedCamera: multimodalEnabled
    };

    const sessionMetadata = {
      multimodal: multimodalEnabled,
      faceEmotionUsed: multimodalEnabled && !!snapshot.face.detectedEmotion,
      source: multimodalEnabled ? 'multimodal' : 'text',
      faceEmotion: snapshot.face.detectedEmotion || null,
      fusedStress: avgFusedStress,
      textStress: avgTextStress,
      faceStress: avgFaceStress,
      voiceStress: avgVoiceStress,
      sessionSummary
    };
    
    updateChatSession(user.id, sessionId, newMessages, sessionMetadata);
    
    if (useVoice) {
      speakText(translatedText);
    }

    if (aiResponse.crisis) {
      setCrisisStage('5');
    }
  };

  const handleEndSession = async () => {
    if (messages.length > 1 && user) {
      const avgCompound = messageCount > 0 ? (sessionScore / messageCount) : 0;
      const moodScale = Math.round(((avgCompound + 1) / 2) * 4) + 1; // Maps 0-2 to 1-5
      
      const avgTextStress = messageCount > 0 ? (cumulativeTextStress / messageCount) : 0;
      const avgFaceStress = messageCount > 0 ? (cumulativeFaceStress / messageCount) : 0;
      const avgVoiceStress = messageCount > 0 ? (cumulativeVoiceStress / messageCount) : 0;
      const avgFusedStress = messageCount > 0 ? (cumulativeFusedStress / messageCount) : 0;
      
      const sessionSummary = {
        avgTextScore: avgTextStress,
        avgFaceStress: avgFaceStress,
        avgVoiceStress: avgVoiceStress,
        avgFusedStress: avgFusedStress,
        dominantFaceEmotion: detectedEmotion || null,
        usedCamera: multimodalEnabled
      };

      const sessionMetadata = {
        multimodal: multimodalEnabled,
        faceEmotionUsed: multimodalEnabled && !!detectedEmotion,
        source: multimodalEnabled && !!detectedEmotion ? 'multimodal' : 'text',
        faceEmotion: detectedEmotion || null,
        fusedStress: avgFusedStress,
        textStress: avgTextStress,
        faceStress: avgFaceStress,
        voiceStress: avgVoiceStress,
        sessionSummary
      };

      updateChatSession(user.id, sessionId, messages, sessionMetadata);
      addMoodEntry(user.id, moodScale, sessionMetadata);
      
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
            onClick={toggleMultimodal}
            className="btn-secondary"
            title={multimodalEnabled ? "Disable Multimodal" : "Enable Multimodal"}
          >
            {multimodalEnabled ? "Multimodal On" : "Multimodal Off"}
          </button>
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
          <StayWithMeMode 
            user={user} 
            onExit={() => setCrisisStage('none')} 
          />
        )}
      </AnimatePresence>

      <div className="chat-area relative">
        <div className="messages-container relative">
          {multimodalEnabled && (
            <div className="absolute top-4 right-4 z-10 w-[90%] max-w-xs sm:w-80">
               <MultimodalCheckInCard 
                  videoRef={videoRef} 
                  isCameraOn={isCameraOn}
                  detectedEmotion={detectedEmotion} 
                  emotionConfidence={emotionConfidence} 
                  isListening={isListening}
                  audioLevel={audioLevel}
                  voiceStressScore={voiceStressScore}
                  enabled={multimodalEnabled} 
                  toggleEnabled={toggleMultimodal} 
               />
            </div>
          )}
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



