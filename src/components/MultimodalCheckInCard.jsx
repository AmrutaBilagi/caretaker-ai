import React, { useMemo } from 'react';
import { Camera, CameraOff, Mic, MicOff, Activity, StopCircle, HeartPulse } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { getStressScoreFromFace } from '../utils/emotionFusion';

export const MultimodalCheckInCard = ({ 
  videoRef, 
  isCameraOn,
  detectedEmotion, 
  emotionConfidence, 
  isListening,
  audioLevel,
  voiceStressScore,
  enabled, 
  toggleEnabled 
}) => {
  const { selectedLanguage: lang } = useLanguage();

  const faceStressScore = useMemo(() => {
    return getStressScoreFromFace(detectedEmotion, emotionConfidence);
  }, [detectedEmotion, emotionConfidence]);

  const currentOverallStress = useMemo(() => {
    if (!detectedEmotion && voiceStressScore === 0) return 0;
    return (faceStressScore * 0.5) + (voiceStressScore * 0.5);
  }, [faceStressScore, voiceStressScore, detectedEmotion]);

  // Glow color based on overall stress
  const glowColor = useMemo(() => {
    if (!enabled) return 'rgba(13, 148, 136, 0.2)'; // default teal glow
    if (currentOverallStress < 0.3) return 'rgba(16, 185, 129, 0.4)'; // Emerald / Green
    if (currentOverallStress < 0.6) return 'rgba(250, 204, 21, 0.4)'; // Yellow
    if (currentOverallStress < 0.8) return 'rgba(249, 115, 22, 0.4)'; // Orange
    return 'rgba(239, 68, 68, 0.5)'; // Red
  }, [currentOverallStress, enabled]);

  // Border color based on overall stress
  const borderColor = useMemo(() => {
    if (!enabled) return 'rgba(13, 148, 136, 0.3)';
    if (currentOverallStress < 0.3) return 'rgba(16, 185, 129, 0.5)';
    if (currentOverallStress < 0.6) return 'rgba(250, 204, 21, 0.5)';
    if (currentOverallStress < 0.8) return 'rgba(249, 115, 22, 0.5)';
    return 'rgba(239, 68, 68, 0.6)';
  }, [currentOverallStress, enabled]);

  const getEmpatheticFeedback = () => {
    if (!detectedEmotion) return t(lang, 'feedbackDetecting');
    
    // Capitalize first letter to match translation keys exactly
    const key = `feedback${detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}`;
    const translated = t(lang, key);
    return translated !== key ? translated : t(lang, 'feedbackDetecting');
  };

  const audioRingScale = 1 + (audioLevel * 0.5);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="backdrop-blur-2xl rounded-2xl p-4 flex flex-col gap-4 max-w-sm w-full transition-all duration-500 ease-out"
      style={{
        background: 'var(--bg-card)',
        boxShadow: `0 8px 32px 0 ${glowColor}`,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <HeartPulse size={18} className="text-brand-teal" />
          QuietCare Analytics
        </h3>
        <button
          onClick={toggleEnabled}
          className={`p-2 rounded-xl transition-all duration-300 ${
            enabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
          title={enabled ? t(lang, 'disableMultimodal') : t(lang, 'enableMultimodal')}
        >
          {enabled ? <StopCircle size={18} /> : <Camera size={18} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {enabled ? (
          <motion.div 
            key="camera-on"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform -scale-x-100 opacity-90"
              />
              
              {/* Top right badges: Camera / Mic Status */}
              <div className="absolute top-3 right-3 flex gap-2">
                 <div className="bg-black/30 backdrop-blur-md rounded-full p-2 flex items-center justify-center border border-white/10 shadow-sm">
                   {isCameraOn ? <Camera size={14} className="text-brand-teal"/> : <CameraOff size={14} className="text-red-400"/>}
                 </div>
                 <div className="bg-black/30 backdrop-blur-md rounded-full p-2 flex items-center justify-center border border-white/10 shadow-sm relative">
                   {isListening ? (
                     <>
                       <motion.div 
                         className="absolute inset-0 bg-brand-teal/30 rounded-full" 
                         animate={{ scale: audioRingScale }}
                         transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                       />
                       <Mic size={14} className="text-brand-teal relative z-10"/>
                     </>
                   ) : <MicOff size={14} className="text-red-400"/>}
                 </div>
              </div>

              {/* End & Send Action Button */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                 <button 
                   onClick={toggleEnabled}
                   className="bg-red-500/80 hover:bg-red-500 backdrop-blur-xl text-white text-[11px] uppercase tracking-[0.15em] font-bold py-2.5 px-6 rounded-full shadow-[0_4px_15px_rgba(239,68,68,0.3)] flex items-center gap-2 transition-all border border-white/20 pointer-events-auto"
                 >
                   <StopCircle size={15} />
                   End & Send
                 </button>
              </div>
            </div>

            {/* Premium Metrics Area */}
            <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-4 border border-white/5 shadow-sm">
              {/* Empathetic Text */}
              <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                <Activity size={18} className="text-brand-teal mt-0.5" />
                <span className="text-[15px] text-white font-serif italic tracking-wide leading-relaxed">
                  "{getEmpatheticFeedback()}"
                </span>
              </div>

              {/* Confidence Bar */}
              {detectedEmotion && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    <span>Detection Confidence</span>
                    <span>{Math.round(emotionConfidence * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-teal to-blue-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(emotionConfidence * 100)}%` }}
                      transition={{ type: 'spring', bounce: 0 }}
                    />
                  </div>
                </div>
              )}

              {/* Voice Stress Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  <span>Voice Tension</span>
                  <span>{Math.round(voiceStressScore * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full"
                    style={{
                      background: `linear-gradient(90deg, #10B981, #FACC15, #EF4444)`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(voiceStressScore * 100)}%` }}
                    transition={{ type: 'spring', bounce: 0 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="camera-off"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-black/10 aspect-video flex flex-col items-center justify-center border border-white/5 text-center p-6"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <CameraOff size={24} className="text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Camera Paused</h4>
            <p className="text-xs text-gray-500">{t(lang, 'multimodalDisabledNote')}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-[10px] text-gray-500 text-center font-medium opacity-70">
        {t(lang, 'privacyNote')}
      </p>
    </motion.div>
  );
};
