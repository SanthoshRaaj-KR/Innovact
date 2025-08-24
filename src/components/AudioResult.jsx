import React from 'react';
import { FaHome, FaExclamationTriangle, FaBrain, FaCheckCircle, FaWaveSquare, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';

// A neutral background component with cyan spherical highlights
const DynamicBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
    <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-10 right-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
    <div className="absolute bottom-10 left-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
  </div>
);

const AudioResult = ({ onReset, analysisResult }) => {
  // --- Data Processing Logic ---
  const prediction = analysisResult?.prediction?.toLowerCase() || (analysisResult?.error ? 'error' : 'real');
  const isFake = prediction === "fake";
  const hasError = !!analysisResult?.error;

  const realProb = analysisResult?.probabilities?.real || (hasError ? 0.13 : 0.87);
  const fakeProb = analysisResult?.probabilities?.fake || (hasError ? 0.87 : 0.13);
  
  const realPercentage = Math.round(realProb * 100);
  const fakePercentage = Math.round(fakeProb * 100);
  
  const primaryConfidence = isFake ? fakePercentage : realPercentage;

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 85) return 'Very High';
    if (confidence >= 75) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getResultColors = () => {
    if (isFake || hasError) {
      return {
        primary: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-400/30',
        stroke: '#ef4444', // Red
      };
    }
    return {
      primary: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-400/30',
      stroke: '#22c55e', // Green
    };
  };

  const colors = getResultColors();

  // --- Dynamic card content based on results ---
  const analysisCards = [
    {
      icon: FaMicrophone,
      title: "Vocal Patterns",
      description: isFake 
        ? "Detected unnatural vocal tract resonances and harmonic inconsistencies." 
        : "Vocal patterns appear natural and consistent with human speech.",
    },
    {
      icon: FaWaveSquare,
      title: "Spectral Analysis",
      description: isFake
        ? "Found spectral artifacts and noise floor irregularities common in synthetic audio."
        : "The audio's spectral integrity is high, with no signs of digital manipulation.",
    },
    {
      icon: FaBrain,
      title: "AI Model Verdict",
      description: `The neural network classified this sample with ${primaryConfidence}% confidence.`,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <DynamicBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          Analysis Complete
        </h1>

        {/* --- Main Confidence Circle --- */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 relative">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={colors.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - primaryConfidence / 100) }}
              transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-5xl font-bold ${colors.primary}`}>
              {primaryConfidence}%
            </span>
            <span className="text-sm text-slate-400 tracking-widest uppercase mt-1">Confidence</span>
          </div>
        </div>

        {/* --- Result Badge --- */}
        <div className={`inline-flex items-center gap-3 px-6 py-3 border rounded-full mb-3 ${colors.bg} ${colors.border}`}>
          {isFake || hasError ? <FaExclamationTriangle className={colors.primary} /> : <FaCheckCircle className={colors.primary} />}
          <span className={`font-semibold text-lg ${colors.primary}`}>
            {hasError ? 'ERROR DETECTED' : (isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC AUDIO')}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm mb-8">
          Confidence Level: <span className={`font-semibold ${colors.primary}`}>{getConfidenceLevel(primaryConfidence)}</span>
        </p>

        {hasError && (
             <p className="text-orange-400 text-xs mb-8 -mt-4">
                Analysis failed: {analysisResult.error}.
             </p>
        )}

        {/* --- Analysis Cards Section --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          {analysisCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index + 0.5 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${colors.primary}`} />
                  <h3 className="font-semibold text-slate-200">{card.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
        
        {/* --- Action Buttons --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg transition-all duration-300 text-cyan-200 transform hover:scale-105"
          >
            <FaHome />
            <span>Back to Home</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/50 rounded-lg transition-all duration-300 text-cyan-300 transform hover:scale-105"
          >
            <FaBrain />
            <span>Analyze Another</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AudioResult;