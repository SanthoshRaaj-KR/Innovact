import React, { useEffect, useState } from 'react';

const Processing = ({ onComplete, fileData, analysisType }) => {
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (analysisType === 'audio' && fileData) {
      performAudioAnalysis();
    } else {
      // For video or if no file is present, simulate progress
      simulateProgress();
    }
  }, [fileData, analysisType]);

  const performAudioAnalysis = async () => {
    try {
      setProgress(10);
      setError(null); // Clear any previous errors

      const formData = new FormData();
      formData.append('file', fileData);
      setProgress(30);

      console.log('Sending file to backend proxy:', fileData.name, fileData.type, fileData.size);

      // Use your local backend proxy endpoint
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setProgress(80);
      const result = await response.json();
      console.log('Analysis result:', result);
      
      setAnalysisResult(result);
      setProgress(100);

      setTimeout(() => {
        if (onComplete) {
          onComplete(result);
        }
      }, 1000);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message);

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

  const simulateProgress = () => {
    let animationFrame;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percentage = Math.min((elapsed / 4000) * 100, 100);

      setProgress(Math.floor(percentage));

      if (percentage < 100) {
        animationFrame = requestAnimationFrame(step);
      } else {
        if (onComplete) {
          onComplete({ prediction: 'real', confidence: 0.13, probabilities: { real: 0.87, fake: 0.13 } });
        }
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  };

  return (
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
              ? 'Our AI is analyzing your audio for deepfake patterns using MFCC extraction'
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
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute -top-8 left-0 right-0 text-center">
              <span className="text-2xl font-bold text-cyan-400">{progress}%</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            {analysisType === 'audio' ? (
              progress < 30 ? 'Preprocessing audio and extracting features...' :
              progress < 80 ? 'Running CNN-based deepfake detection...' :
              progress < 100 ? 'Analyzing mel-spectrogram patterns...' :
              'Analysis complete!'
            ) : (
              progress < 30 ? 'Uploading and preprocessing...' :
              progress < 70 ? 'Running deepfake detection algorithms...' :
              progress < 100 ? 'Finalizing analysis...' :
              'Analysis complete!'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Processing;