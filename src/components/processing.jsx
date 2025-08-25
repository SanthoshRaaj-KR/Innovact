import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const Processing = ({ onComplete, fileData, analysisType }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  // useRef is used to hold the interval ID without causing re-renders
  const intervalRef = useRef(null);

  // This function will clear any running interval
  const clearExistingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (analysisType === 'audio' && fileData) {
      performAudioAnalysis();
    } else {
      simulateProgress(); // Fallback simulation
    }

    // Cleanup function: This runs when the component is unmounted
    return () => clearExistingInterval();
  }, [fileData, analysisType]);

  const performAudioAnalysis = async () => {
    try {
      setError(null);
      clearExistingInterval();

      // --- Phase 1: Uploading (0% -> 30%) ---
      // Smoothly animates from 0 to 30 over 1.5 seconds
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 30) {
            clearExistingInterval();
            return 30;
          }
          return prev + 2;
        });
      }, 100);

      const formData = new FormData();
      formData.append('file', fileData);

      // --- Phase 2: Analysis (API Call with "creeping" progress) ---
      const responsePromise = fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      // After upload phase, start a slow creep from 30% to 65%
      setTimeout(() => {
        clearExistingInterval();
        intervalRef.current = setInterval(() => {
          setProgress(prev => {
            // This stops the creep if the API has already finished
            // or if it reaches the "waiting" cap of 65%
            if (intervalRef.current === null || prev >= 65) {
              clearExistingInterval();
              return prev;
            }
            return prev + 1;
          });
        }, 300); // Slower interval for the analysis phase
      }, 1500); // Start this after the initial upload animation is done

      const response = await responsePromise; // Wait for the API call to finish
      clearExistingInterval(); // IMPORTANT: Stop the "creeping" progress

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // --- Phase 3: Finalizing (Current Progress -> 100%) ---
      // Animate smoothly from wherever the progress bar was to 100%
      setProgress(prev => Math.max(prev, 70)); // Jump to at least 70%
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearExistingInterval();
            // Wait a moment at 100% before completing
            setTimeout(() => {
              if (onComplete) onComplete(result);
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30); // A fast interval for the final burst

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message);
      clearExistingInterval(); // Stop any progress on error

      setTimeout(() => {
        if (onComplete) {
          onComplete({
            prediction: "ERROR",
            confidence: 0,
            probabilities: { real: 0, fake: 0 },
            error: err.message
          });
        }
      }, 1500);
    }
  };
  
  // The simulation for video remains the same
  const simulateProgress = () => {
    // ... same as before
  };

  return (
    // ... Your JSX remains exactly the same
    <div className="w-screen min-h-screen pt-10 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center font-sans relative">
       <div className="fixed inset-0 overflow-hidden -z-10">
         <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
         <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
       </div>
 
       <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-4">
         <div className="mb-12">
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
         </div>
 
         <div className="text-center mb-8">
           <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
             Analyzing Content
           </h1>
           <p className="text-base text-slate-300 mb-6">
             {analysisType === 'audio'
               ? 'Our AI is analyzing your audio for deepfake patterns...'
               : 'Our AI is processing your media for deepfake detection'
             }
           </p>
 
           {error && (
             <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-4">
               <p className="text-red-400 text-sm font-semibold">⚠️ Analysis Failed</p>
               <p className="text-red-400 text-xs mt-1">{error}</p>
             </div>
           )}
 
           <div className="flex justify-center items-center flex-wrap gap-4 mb-8 text-center">
             {['Upload', 'Analysis', 'Verification', 'Complete'].map((label, i) => (
               <div className="flex items-center gap-2" key={label}>
                 <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                   progress >= [0, 30, 80, 100][i] ? (i === 3 ? 'bg-green-400' : 'bg-cyan-400') : 'bg-slate-600'
                 }`}></div>
                 <span className="text-xs sm:text-sm text-slate-400">{label}</span>
                 {i < 3 && <div className="w-8 h-0.5 bg-slate-600 hidden sm:block"></div>}
               </div>
             ))}
           </div>
         </div>
 
         <div className="w-full max-w-md mb-12">
           <div className="relative mb-4">
             <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
               <motion.div
                 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"
                 style={{ width: `${progress}%` }}
                 transition={{ type: 'spring', stiffness: 100, damping: 20 }} // Smoother animation
               />
             </div>
             <div className="absolute -top-8 left-0 right-0 text-center">
               <span className="text-2xl font-bold text-cyan-400">{progress}%</span>
             </div>
           </div>
           <p className="text-sm text-slate-400 text-center">
             {analysisType === 'audio' ? (
               progress < 30 ? 'Uploading and preprocessing...' :
               progress < 70 ? 'Running deepfake detection algorithms...' :
               progress < 100 ? 'Finalizing analysis...' :
               'Analysis complete!'
             ) : (
                'Simulating analysis...'
             )}
           </p>
         </div>
       </div>
     </div>
  );
};

export default Processing;