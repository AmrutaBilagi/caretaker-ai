import vader from 'vader-sentiment';

/**
 * Maps face-api.js expressions to a basic stress or negativity score (0.0 to 1.0).
 * 1.0 = highly stressed/negative
 * 0.0 = highly relaxed/positive
 */
export const getStressScoreFromFace = (emotion, confidence) => {
  if (!emotion) return 0.5; // neutral baseline
  
  // Weights for different emotions indicating stress or negativity
  const stressWeights = {
    angry: 0.9,
    disgusted: 0.8,
    fearful: 0.9,
    sad: 0.7,
    neutral: 0.3,
    surprised: 0.4,
    happy: 0.1
  };

  const weight = stressWeights[emotion] || 0.5;
  
  // Modulate based on confidence. If low confidence, it skews towards 0.5
  return 0.5 + (weight - 0.5) * confidence;
};

/**
 * Returns voice stress score based on voice metrics.
 */
export const getVoiceStressScore = (voiceStressScore) => {
  return voiceStressScore || 0; // The voice hook already calculates a 0 to 1 score
};

/**
 * Fuses text sentiment with facial emotion to produce a comprehensive stress score.
 * @param {string} text - User's input text
 * @param {string} facialEmotion - The detected facial emotion (e.g. 'sad', 'happy')
 * @param {number} faceConfidence - The confidence of the detected emotion
 * @param {object} voiceMetrics - The voice snapshot containing stressScore
 * @returns {object} - Fused analysis including overall stress and dominant signals.
 */
export const fuseMultimodalEmotion = (text, facialEmotion, faceConfidence, voiceMetrics = null) => {
  // 1. Analyze text sentiment
  let textCompound = 0;
  if (text && text.trim().length > 0) {
    const textSentiment = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    textCompound = textSentiment.compound; // -1 to 1
  }

  // Convert VADER compound (-1 to 1) to a stress score (0 to 1)
  // -1 (very negative) -> 1 (high stress)
  // 1 (very positive) -> 0 (low stress)
  const textStressScore = ((-textCompound) + 1) / 2;

  // 2. Analyze face sentiment
  const faceStressScore = getStressScoreFromFace(facialEmotion, faceConfidence);

  // 3. Analyze voice sentiment
  const voiceStressScore = voiceMetrics ? getVoiceStressScore(voiceMetrics.stressScore) : null;

  // 4. Fusion Logic
  let fusedStressScore = 0;
  
  if (voiceStressScore !== null) {
    // We weight text 50%, face 25%, voice 25%
    fusedStressScore = (textStressScore * 0.5) + (faceStressScore * 0.25) + (voiceStressScore * 0.25);
  } else {
    // If no voice, fallback to text 60% face 40%
    fusedStressScore = (textStressScore * 0.6) + (faceStressScore * 0.4);
  }

  // Anomaly detection: "Smiling depression" or masking
  const isMasking = textStressScore > 0.7 && faceStressScore < 0.3;
  
  // Silent struggle: text is neutral/positive but face/voice is fearful/angry/sad/tense
  const faceOrVoiceHigh = Math.max(faceStressScore, voiceStressScore || 0);
  const isSilentStruggle = textStressScore < 0.5 && faceOrVoiceHigh > 0.7;

  if (isSilentStruggle) {
    // Elevate the stress score because the user's face/voice is betraying their neutral words
    fusedStressScore = Math.max(fusedStressScore, faceOrVoiceHigh * 0.9);
  }

  return {
    fusedStressScore: Math.max(0, Math.min(1, fusedStressScore)),
    textStressScore,
    faceStressScore,
    voiceStressScore,
    primaryFacialEmotion: facialEmotion,
    isMasking,
    isSilentStruggle,
    needsImmediateAttention: fusedStressScore > 0.8
  };
};
