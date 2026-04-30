import React from 'react';
import { Camera, CameraOff, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export const FaceEmotionPanel = ({ videoRef, detectedEmotion, emotionConfidence, enabled, toggleEnabled }) => {
  return (
    <div className="bg-brand-blue/30 backdrop-blur-xl border border-brand-teal/20 rounded-xl p-4 flex flex-col gap-3 max-w-xs w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <BrainCircuit size={16} className="text-brand-teal" />
          Face Analytics
        </h3>
        <button
          onClick={toggleEnabled}
          className={`p-2 rounded-lg transition-colors ${
            enabled ? 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
          title={enabled ? "Disable Camera" : "Enable Camera"}
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
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10">
            <span className="text-xs text-white capitalize font-medium">
              {detectedEmotion ? detectedEmotion : "Detecting..."}
            </span>
            {detectedEmotion && (
              <span className="text-xs text-brand-teal">
                {Math.round(emotionConfidence * 100)}%
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-black/20 aspect-video flex flex-col items-center justify-center border border-white/5 text-center p-4">
          <CameraOff size={24} className="text-gray-500 mb-2" />
          <p className="text-xs text-gray-400">Camera disabled. Enable for multimodal empathy.</p>
        </div>
      )}
      <p className="text-[10px] text-gray-500 text-center">Processed locally. Video never leaves your device.</p>
    </div>
  );
};
