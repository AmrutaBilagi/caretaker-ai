import React from 'react';
import { Camera, CameraOff, Mic, MicOff, BrainCircuit, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';

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

  // Helper to get translated stress label
  const getStressLabel = (score) => {
    if (score < 0.2) return t(lang, 'stressLow');
    if (score < 0.5) return t(lang, 'stressMild');
    if (score < 0.7) return t(lang, 'stressModerate');
    if (score < 0.9) return t(lang, 'stressHigh');
    return t(lang, 'stressSevere');
  };

  const getStressColor = (score) => {
    if (score < 0.2) return 'text-green-400';
    if (score < 0.5) return 'text-blue-400';
    if (score < 0.7) return 'text-yellow-400';
    if (score < 0.9) return 'text-orange-400';
    return 'text-red-500';
  };

  const audioRingScale = 1 + (audioLevel * 0.5);

  return (
    <div className="bg-brand-blue/30 backdrop-blur-xl border border-brand-teal/20 rounded-xl p-4 flex flex-col gap-3 max-w-sm w-full shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <BrainCircuit size={16} className="text-brand-teal" />
          {t(lang, 'multimodalCheckIn')}
        </h3>
        <button
          onClick={toggleEnabled}
          className={`p-2 rounded-lg transition-colors ${
            enabled ? 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
          title={enabled ? t(lang, 'disableMultimodal') : t(lang, 'enableMultimodal')}
        >
          {enabled ? <Camera size={16} /> : <CameraOff size={16} />}
        </button>
      </div>

      {enabled ? (
        <div className="relative rounded-lg overflow-hidden bg-black/50 aspect-video flex items-center justify-center border border-white/10">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />
          
          {/* Top right badges: Camera / Mic Status */}
          <div className="absolute top-2 right-2 flex gap-1">
             <div className="bg-black/60 backdrop-blur-md rounded px-2 py-1 flex items-center gap-1 border border-white/10">
               {isCameraOn ? <Camera size={12} className="text-brand-teal"/> : <CameraOff size={12} className="text-red-400"/>}
             </div>
             <div className="bg-black/60 backdrop-blur-md rounded px-2 py-1 flex items-center gap-1 border border-white/10 relative">
               {isListening ? (
                 <>
                   <div 
                     className="absolute inset-0 bg-brand-teal/20 rounded-full" 
                     style={{ transform: `scale(${audioRingScale})`, transition: 'transform 0.1s ease-out' }}
                   />
                   <Mic size={12} className="text-brand-teal relative z-10"/>
                 </>
               ) : <MicOff size={12} className="text-red-400"/>}
             </div>
          </div>

          {/* End & Send Action Button */}
          <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
             <button 
               onClick={toggleEnabled}
               className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white text-[11px] uppercase tracking-wider font-bold py-1.5 px-4 rounded-full shadow-lg flex items-center gap-2 transition-colors border border-white/20 pointer-events-auto"
               title="End video, stop listening, and send message"
             >
               <CameraOff size={14} />
               End & Send
             </button>
          </div>

          {/* Bottom badges: Emotion and Voice Stress */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t(lang, 'face')}</span>
              <span className="text-xs text-white capitalize font-medium">
                {detectedEmotion ? t(lang, detectedEmotion) : t(lang, 'detecting')}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t(lang, 'voiceStress')}</span>
              <span className={`text-xs font-medium ${getStressColor(voiceStressScore)} flex items-center gap-1`}>
                 <Activity size={10} />
                 {getStressLabel(voiceStressScore)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-black/20 aspect-video flex flex-col items-center justify-center border border-white/5 text-center p-4">
          <CameraOff size={24} className="text-gray-500 mb-2" />
          <p className="text-xs text-gray-400">{t(lang, 'multimodalDisabledNote')}</p>
        </div>
      )}
      <p className="text-[10px] text-gray-500 text-center">{t(lang, 'privacyNote')}</p>
    </div>
  );
};
