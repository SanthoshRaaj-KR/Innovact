import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (remain the same) ---
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
);
const WaveIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 11-1.415-1.414A3.987 3.987 0 0013.5 12a3.987 3.987 0 00-.672-2.243 1 1 0 010-1.414z"/></svg>
);
const VideoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/></svg>
);


// --- Centralized Data Configuration ---
const analysisData = {
  audio: {
    title: "Audio Analysis",
    subtitle: "Voice Deepfake Detection",
    Icon: WaveIcon,
    theme: {
      backgroundGradient: "from-purple-900/20",
      titleGradient: "from-purple-400 to-pink-400",
      scoreGradientId: "scoreGradient",
    },
    features: [
      { title: "Voice Pattern Analysis", description: "Advanced spectral analysis detected inconsistencies in vocal tract modeling and pitch variations typical of synthetic speech generation.", score: 84, details: ["Formant frequency anomalies", "Unnatural pitch transitions", "Missing micro-prosodic features"], icon: "🎵", gradient: "from-purple-500 to-indigo-600" },
      { title: "Temporal Coherence Check", description: "AI-powered temporal analysis found irregular breathing patterns and inconsistent speech timing that indicate artificial generation.", score: 78, details: ["Irregular silence patterns", "Unnatural speech rhythm", "Missing background noise consistency"], icon: "⏱️", gradient: "from-cyan-500 to-blue-600" },
      { title: "Neural Artifact Detection", description: "Deep learning model identified compression artifacts and neural network fingerprints characteristic of voice synthesis technology.", score: 91, details: ["GAN-specific artifacts detected", "Compression signature mismatch", "Neural processing residuals"], icon: "🧠", gradient: "from-emerald-500 to-green-600" },
    ],
  },
  video: {
    title: "Video Analysis",
    subtitle: "Visual Deepfake Detection",
    Icon: VideoIcon,
    theme: {
      backgroundGradient: "from-blue-900/20",
      titleGradient: "from-blue-400 to-cyan-400",
      scoreGradientId: "scoreGradient",
    },
    features: [
        { title: "Facial Micro-Expression Analysis", description: "Advanced computer vision detected unnatural facial muscle movements and inconsistent micro-expressions across video frames.", score: 87, details: ["Asymmetric facial movements", "Missing eye blink patterns", "Unnatural muscle tension"], icon: "👁️", gradient: "from-blue-500 to-purple-600" },
        { title: "Frame Consistency Detection", description: "Temporal analysis found inconsistencies in lighting, shadows, and background elements typical of deepfake generation.", score: 76, details: ["Inconsistent lighting direction", "Temporal artifacts in backgrounds", "Frame-to-frame quality variations"], icon: "🎬", gradient: "from-cyan-500 to-teal-600" },
        { title: "Neural Network Fingerprinting", description: "AI model identified specific compression patterns and neural network artifacts characteristic of deepfake generation algorithms.", score: 92, details: ["GAN-specific compression patterns", "Neural upsampling artifacts", "Model-specific noise signatures"], icon: "🔍", gradient: "from-emerald-500 to-green-600" },
    ],
  },
};


// --- The Single, Reusable Result Component ---
const AnalysisResult = ({ title, subtitle, Icon, theme, features }) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const averageScore = Math.round(features.reduce((acc, f) => acc + f.score, 0) / features.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] ${theme.backgroundGradient} via-slate-900 to-slate-900`}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Logo */}
          <div className="absolute left-[2vw] flex items-center">
            <img src="/logoGenReal.png" alt="GenReal.AI Logo" className="h-[3.5rem]" 
             onClick={() => window.location.href = "/"}
            />
          </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Score Circle */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-4xl font-bold mb-4">
                <span className={`bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent`}>{title}</span>
              </motion.h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex items-center justify-center gap-2 text-slate-400">
                <Icon />
                <span>{subtitle}</span>
              </motion.div>
            </div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, duration: 1, type: "spring", stiffness: 100 }} className="relative">
              <div className="w-80 h-80 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id={theme.scoreGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-700"/>
                  <motion.circle cx="100" cy="100" r="90" stroke={`url(#${theme.scoreGradientId})`} strokeWidth="12" fill="transparent" strokeDasharray={`${averageScore * 5.65} 565`} strokeLinecap="round" initial={{ strokeDasharray: "0 565" }} animate={animationStarted ? { strokeDasharray: `${averageScore * 5.65} 565` } : {}} transition={{ delay: 1, duration: 2, ease: "easeOut" }}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 0.8 }} className="text-7xl font-black text-red-400 mb-4">{averageScore}%</motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.6 }} className="text-slate-400 text-xl">Deepfake Risk</motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 0.6 }} className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-full">
                <AlertIcon />
                <span className="text-red-400 font-semibold">High Risk Detected</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Detection Analysis</h2>
              <p className="text-slate-400 text-lg">AI models analyzed your file across multiple detection vectors</p>
            </div>

            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl font-bold shadow-lg`}>{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <div className="text-2xl font-bold text-red-400">{feature.score}%</div>
                    </div>
                    <p className="text-slate-300 mb-4 leading-relaxed">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span className="text-slate-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${feature.score}%` }} transition={{ delay: 1.2 + index * 0.2, duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"/>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Actions */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="flex justify-center mt-12"
        >
        <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 hover:scale-105 border border-slate-600/50"
        >
            <HomeIcon />
            <span>Back to Home</span>
        </button>
        </motion.div>
    </div>
  );
};


// --- Main Result Component (now much simpler) ---
const Result = () => {
  // Simulate file type detection - in a real app, this would come from props or state
  const [fileType] = useState('video'); // Change to 'audio' to test the other result

  const currentData = analysisData[fileType];

  return (
    <AnimatePresence mode="wait">
      <AnalysisResult key={fileType} {...currentData} />
    </AnimatePresence>
  );
};

export default Result;