import { useState, useEffect, useRef } from 'react';

export const useVoiceStressDetection = (enabled) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceStressScore, setVoiceStressScore] = useState(0);
  const [speechActivity, setSpeechActivity] = useState(false);
  const [micError, setMicError] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      stopMic();
      return;
    }

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        setIsListening(true);
        setMicError(false);
        analyzeAudio();
      } catch (err) {
        console.error("Microphone access error:", err);
        setMicError(true);
        setIsListening(false);
      }
    };

    let stressAccumulator = 0;
    let baselineLevel = 0.05;

    const analyzeAudio = () => {
      if (!analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] / 128.0) - 1.0;
        sumSquares += normalized * normalized;
      }
      
      const rms = Math.sqrt(sumSquares / bufferLength);
      const smoothedLevel = Math.min(1, rms * 5); // amplify visual level
      setAudioLevel(smoothedLevel);

      // Heuristic Voice Stress estimation
      // 1. Detect if speaking
      const isSpeaking = smoothedLevel > 0.05;
      setSpeechActivity(isSpeaking);

      if (isSpeaking) {
        // Adjust baseline slowly
        baselineLevel = baselineLevel * 0.99 + smoothedLevel * 0.01;
        
        // Sudden spikes or sustained high energy above baseline indicate stress
        const energySpike = Math.max(0, smoothedLevel - baselineLevel * 1.5);
        stressAccumulator = Math.min(1, stressAccumulator + energySpike * 0.1);
      } else {
        // Decay stress slowly when quiet
        stressAccumulator = Math.max(0, stressAccumulator - 0.005);
      }
      
      setVoiceStressScore(stressAccumulator);
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    startMic();

    return () => {
      stopMic();
    };
  }, [enabled]);

  const stopMic = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    setSpeechActivity(false);
    setVoiceStressScore(0);
  };

  return {
    isListening,
    audioLevel,
    voiceStressScore,
    speechActivity,
    micError
  };
};
