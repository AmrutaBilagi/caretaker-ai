import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { pipeline, env } from '@xenova/transformers';

// Disable local models to prevent Vite from returning index.html instead of model files
env.allowLocalModels = false;
import './Journal.css';

const Journal = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "I'm here to listen. How was your day?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [classifier, setClassifier] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Load Transformer Model (Sentiment Analysis)
  useEffect(() => {
    const loadModel = async () => {
      try {
        const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        setClassifier(() => pipe);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading model:", error);
      }
    };
    loadModel();
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const analyzeSentimentAndRespond = async (text) => {
    if (!classifier) return "I hear you.";
    
    const result = await classifier(text);
    const sentiment = result[0]; // e.g., { label: 'NEGATIVE', score: 0.98 }
    
    console.log("Invisible Insight:", sentiment);
    
    // Provide non-medicalized, gentle support based on sentiment
    if (sentiment.label === 'NEGATIVE' && sentiment.score > 0.8) {
      return "It sounds like you've been carrying a heavy load today. Remember that it's okay to take a moment for yourself. You're doing a tough job.";
    } else if (sentiment.label === 'NEGATIVE') {
      return "That sounds challenging. I'm here for you. Whenever you feel overwhelmed, try taking three deep breaths.";
    } else {
      return "Thank you for sharing that with me. It's important to reflect on your day.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);

    // Analyze silently and generate response
    const aiResponse = await analyzeSentimentAndRespond(userText);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="journal-container animate-fade-in">
      <div className="journal-header">
        <h2>Invisible Journal</h2>
        <p>A private space to vent. Your voice never leaves this device.</p>
        {isModelLoading && (
          <div className="model-loader">
            <Loader2 className="spinner" size={16} />
            <span>Loading privacy AI...</span>
          </div>
        )}
      </div>

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

        <div className="input-area">
          <button 
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
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
