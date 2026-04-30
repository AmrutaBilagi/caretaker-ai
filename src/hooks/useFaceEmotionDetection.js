import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceEmotionDetection = (enabled) => {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
      }
    };
    
    if (enabled && !modelsLoaded) {
      loadModels();
    }
  }, [enabled, modelsLoaded]);

  useEffect(() => {
    let activeStream = null;

    const startVideo = async () => {
      if (!enabled || !modelsLoaded) return;
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    if (enabled && modelsLoaded && !stream) {
      startVideo();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled, modelsLoaded]);

  useEffect(() => {
    let intervalId;

    const detectEmotion = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || !enabled) {
        return;
      }

      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detection && detection.expressions) {
          // Find the emotion with the highest probability
          const expressions = detection.expressions;
          const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
          const primaryEmotion = sorted[0][0];
          const confidence = sorted[0][1];

          setDetectedEmotion(primaryEmotion);
          setEmotionConfidence(confidence);
        } else {
          setDetectedEmotion(null);
          setEmotionConfidence(0);
        }
      } catch (error) {
        console.error("Detection error:", error);
      }
    };

    if (enabled && modelsLoaded && stream) {
      intervalId = setInterval(detectEmotion, 800); // Check every 800ms
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, modelsLoaded, stream]);

  return {
    videoRef,
    modelsLoaded,
    detectedEmotion,
    emotionConfidence,
    hasStream: !!stream
  };
};
