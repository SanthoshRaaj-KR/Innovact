import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Processing = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let animationFrame;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percentage = Math.min((elapsed / 8000) * 100, 100); // Adjusted duration to 8 seconds
      
      setProgress(Math.floor(percentage));

      if (percentage < 100) {
        animationFrame = requestAnimationFrame(step);
      } else {
        // When progress reaches 100%, call the onComplete callback from the parent
        if (onComplete) {
          onComplete();
        }
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onComplete]);

  return (
    <div className="w-screen min-h-screen pt-10 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center font-sans relative">
      {/* Fixed background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-4">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-cyan-400/30 shadow-2xl">
              <img
                src="/logoGenReal.png"
                alt="GenReal.AI Logo"
                className="h-[3.5rem]"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping"></div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Analyzing Content
          </h1>
          <p className="text-base text-slate-300">
            Our AI is processing your media for deepfake detection
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md mb-12"
        >
          <div className="relative mb-4">
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="absolute -top-8 left-0 right-0 text-center">
              <span className="text-2xl font-bold text-cyan-400">{progress}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            {progress < 30 ? 'Uploading and preprocessing...' :
             progress < 70 ? 'Running deepfake detection algorithms...' :
             progress < 100 ? 'Finalizing analysis...' :
             'Analysis complete!'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Processing;