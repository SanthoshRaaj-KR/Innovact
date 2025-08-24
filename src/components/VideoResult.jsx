import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaExclamationTriangle, FaVideo, FaUserSecret, FaFilm } from 'react-icons/fa';

const VideoResult = ({ onReset }) => {
  const confidenceScore = 87;
  
  const videoFeatures = [
    { 
      name: "Facial Anomaly Detection", 
      score: 92, 
      icon: <FaVideo />,
      description: "Inconsistencies in facial landmarks detected"
    },
    { 
      name: "Behavioral Pattern Analysis", 
      score: 84, 
      icon: <FaUserSecret />,
      description: "Unnatural blinking and expression patterns"
    },
    { 
      name: "Frame Inconsistency", 
      score: 88, 
      icon: <FaFilm />,
      description: "Artifacts and inconsistencies between frames"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 text-cyan-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-cyan-400/15 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-300/20 rounded-full blur-md"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-cyan-500/12 rounded-full blur-lg"></div>
      </div>
          <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }} 
        className="w-full max-w-4xl text-center relative z-10"
      >
        {/* Header */}
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4 text-cyan-300"
        >
          Video Analysis Complete
        </motion.h1>
        
        {/* Confidence Score */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke={confidenceScore < 40 ? "#22c55e" : confidenceScore < 65 ? "#f97316" : "#ef4444"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - confidenceScore / 100) }}
                transition={{ delay: 1.2, duration: 2.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <motion.span 
                className="text-2xl font-bold text-cyan-300"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                {confidenceScore}%
              </motion.span>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full mb-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-red-400 font-medium">Likely Deepfake Detected</span>
          </div>
          <p className="text-slate-400 text-sm">Confidence Level: High</p>
        </motion.div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {videoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.5 }}
              className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-cyan-800/30 hover:border-cyan-600/50 transition-all duration-300"
            >
              <div className="text-2xl mb-3 text-cyan-400">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-cyan-200">{feature.name}</h3>
              <div className="text-2xl font-bold text-cyan-300 mb-2">{feature.score}%</div>
              <p className="text-sm text-slate-400">{feature.description}</p>
              
              <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                <motion.div
                  className="h-2 rounded-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.score}%` }}
                  transition={{ delay: 0.1 * index + 1, duration: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test More Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-slate-900/30 border border-cyan-800/20 rounded-xl p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-cyan-300 mb-3">What's Next?</h2>
          <p className="text-slate-400 mb-6">
            Continue exploring our deepfake detection capabilities or return to the main page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 rounded-lg transition-colors text-cyan-200"
            >
              <FaHome />
              <span>Back to Home</span>
            </button>
            <button 
              onClick={() => window.location.href = '/deepfake-detection'}
              className="flex items-center gap-3 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg transition-colors text-cyan-300"
            >
              <FaVideo />
              <span>Try Another Detection</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VideoResult;