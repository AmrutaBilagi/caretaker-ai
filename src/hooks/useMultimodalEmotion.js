import { useFaceEmotionDetection } from './useFaceEmotionDetection';
import { useVoiceStressDetection } from './useVoiceStressDetection';

export const useMultimodalEmotion = (enabled) => {
  const {
    videoRef,
    modelsLoaded,
    detectedEmotion,
    emotionConfidence,
    hasStream: isFaceCameraOn
  } = useFaceEmotionDetection(enabled);

  const {
    isListening,
    audioLevel,
    voiceStressScore,
    speechActivity,
    micError
  } = useVoiceStressDetection(enabled);

  const getCurrentEmotionSnapshot = () => {
    return {
      timestamp: Date.now(),
      face: {
        enabled,
        detectedEmotion,
        confidence: emotionConfidence,
        isFaceDetected: !!detectedEmotion
      },
      voice: {
        enabled,
        audioLevel,
        stressScore: voiceStressScore,
        speechActivity
      }
    };
  };

  return {
    videoRef,
    modelsLoaded,
    isCameraOn: isFaceCameraOn,
    detectedEmotion,
    emotionConfidence,
    isListening,
    audioLevel,
    voiceStressScore,
    speechActivity,
    micError,
    getCurrentEmotionSnapshot
  };
};
