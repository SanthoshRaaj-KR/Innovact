import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaExclamationTriangle, FaVolumeUp, FaWaveSquare, FaBrain } from 'react-icons/fa';

const AudioResult = ({ onReset }) => {
  const audioFeatures = [
    { name: "Voice Biometric Analyzer", score: 72, icon: <FaVolumeUp/> },
    { name: "Spectral Anomaly Detector", score: 64, icon: <FaWaveSquare/> },
    { name: "Neural Audio Classifier", score: 79, icon: <FaBrain/> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Audio Analysis Complete</h1>
        <p className="text-slate-300 mb-8">High probability of synthetic voice detected.</p>
        
        <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
          {audioFeatures.map((feature, index) => (
            <motion.div key={index} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 * index }}>
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-3xl font-bold text-orange-400">{feature.score}%</p>
            </motion.div>
          ))}
        </div>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/20 border border-orange-500/30 rounded-full">
            <FaExclamationTriangle className="text-orange-400" />
            <span className="text-orange-400 font-semibold">Likely Synthetic</span>
        </div>

        <motion.button onClick={onReset} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-10 flex items-center gap-3 mx-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
          <FaHome />
          <span>Analyze Another File</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AudioResult;