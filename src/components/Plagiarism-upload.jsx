import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- NEW RESULTS COMPONENT ---
const PlagiarismResults = ({ plagiarized, unique, sources }) => {
  const circleCircumference = 2 * Math.PI * 56; // 2 * pi * radius

  return (
    <div className="flex-1 flex flex-col h-full text-white animate-fade-in">
      {/* Score Donut Chart */}
      <div className="flex flex-col items-center justify-center p-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle cx="60" cy="60" r="56" fill="none" strokeWidth="8" className="stroke-slate-700" />
            {/* Progress Circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              strokeWidth="8"
              className="stroke-cyan-400 -rotate-90 origin-center"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              initial={{ strokeDashoffset: circleCircumference }}
              animate={{ strokeDashoffset: circleCircumference - (plagiarized / 100) * circleCircumference }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-cyan-400">{plagiarized}%</span>
            <span className="text-sm text-slate-400">Plagiarized</span>
          </div>
        </div>
      </div>

      {/* Breakdown Bars */}
      <div className="px-4 space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-cyan-400">Plagiarized</span>
            <span>{plagiarized}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-cyan-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${plagiarized}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-green-400">Unique</span>
            <span>{unique}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-green-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${unique}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
            />
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto px-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">Sources Found:</h3>
        <motion.ul
          className="space-y-3"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 1 },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {sources.map((source, index) => (
            <motion.li
              key={index}
              className="bg-slate-700/40 p-3 rounded-lg border border-slate-600/50 text-sm"
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="flex justify-between items-center">
                <a href={source.url} target="_blank" rel="noreferrer" className="truncate text-slate-300 hover:text-cyan-400 transition-colors">
                  {source.title}
                </a>
                <span className="ml-4 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-md text-xs font-semibold">
                  {source.match}%
                </span>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
};


export default function AIPlagiarismChecker() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("text"); // "text" | "code"
  const [language, setLanguage] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  // --- STATE UPDATED to hold result object ---
  const [results, setResults] = useState(null);

  const handleCheckPlagiarism = () => {
    if (!textInput.trim()) return;
    setIsChecking(true);
    setResults(null); // Clear previous results

    // Fake API delay and data generation
    setTimeout(() => {
      const plagiarizedPercent = Math.floor(Math.random() * 60) + 25; // 25% to 85%
      const uniquePercent = 100 - plagiarizedPercent;
      
      setResults({
        plagiarized: plagiarizedPercent,
        unique: uniquePercent,
        sources: [
          { title: "www.wikipedia.org/wiki/AI", url: "#", match: Math.floor(plagiarizedPercent * 0.6) },
          { title: "www.researchgate.net/publication/3...", url: "#", match: Math.floor(plagiarizedPercent * 0.3) },
          { title: "www.randomblog.com/ai-ethics", url: "#", match: Math.floor(plagiarizedPercent * 0.1) },
        ],
      });
      setIsChecking(false);
    }, 3000);
  };

  const handleReset = () => {
    setTextInput("");
    setLanguage("");
    setResults(null);
    setIsChecking(false);
  };

  const handleMainButtonAction = () => {
    if (results) {
      navigate("/"); // Go home if results are shown
    } else {
      handleCheckPlagiarism();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-purple-400/8 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="relative z-10 w-full max-w-6xl">
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-600/30 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => navigate("/")}
              className="absolute top-4 right-6 text-slate-400 hover:text-white text-2xl font-bold z-50 cursor-pointer transition-colors duration-200"
              aria-label="Close"
            >
              ×
            </button>

            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-700/50 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src="/logoGenReal.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {mode === "text" ? (
                    <>
                      AI{" "}
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Text
                      </span>{" "}
                      Checker
                    </>
                  ) : (
                    <>
                      AI{" "}
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Code
                      </span>{" "}
                      Checker
                    </>
                  )}
                </h1>
              </div>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                Detect {mode === "text" ? "AI & Human Text" : "Code"} Plagiarism
                with Precision. Built for educators, developers, and
                institutions.
              </p>

              {/* Toggle between Text / Code */}
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setMode("text");
                    handleReset();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "text"
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => {
                    setMode("code");
                    handleReset();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "code"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {/* Split Layout */}
            <div className="flex flex-col md:flex-row min-h-[500px] h-full">
              {/* Left Side */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-700/50">
                <div className="h-full flex flex-col">
                  {/* Language Picker (only for Code mode) */}
                  {mode === "code" && (
                    <div className="mb-4">
                      <h2 className="text-sm text-slate-300 mb-2">
                        Select Language:
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {["C++", "C", "Java", "Python", "JavaScript"].map(
                          (lang) => (
                            <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                                language === lang
                                  ? "bg-cyan-500 text-white"
                                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              }`}
                            >
                              {lang}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {mode === "text" ? "Enter Your Text" : "Paste Your Code"}
                    </h2>
                    <div className="text-sm text-slate-400">
                      {textInput.length}/5000
                    </div>
                  </div>

                  <div className="flex-1 mb-4 relative">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={
                        mode === "text"
                          ? "Paste your text here..."
                          : "Paste your code here..."
                      }
                      className="w-full h-full min-h-[200px] bg-slate-700/30 backdrop-blur-sm border border-slate-600/40 rounded-xl p-4 text-white placeholder-slate-400 outline-none resize-none text-base md:text-sm leading-relaxed focus:border-cyan-400/60 transition-all duration-300 focus:bg-slate-700/40"
                      maxLength={5000}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleMainButtonAction}
                      disabled={
                        (!textInput.trim() && !results) ||
                        isChecking ||
                        (mode === "code" && !language && textInput.trim())
                      }
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm"
                    >
                      {isChecking
                        ? "Checking..."
                        : results
                        ? "Start New Check"
                        : "Check for Plagiarism"}
                    </button>

                    {(results || textInput) && (
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-slate-600/50 hover:bg-slate-600/70 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-300"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Results */}
              <div className="w-full md:w-1/2 p-4 sm:p-6">
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">
                    {results ? "Results" : "Get Started"}
                  </h2>
                  <AnimatePresence mode="wait">
                    {!textInput.trim() && !isChecking && !results && (
                      <motion.div
                        key="get-started"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-start justify-start h-full px-4 pt-2 text-slate-400 space-y-6 text-sm leading-relaxed"
                      >
                         <p>
                           <span className="text-white font-semibold">Step 1:</span>{" "}
                           {mode === "text" ? "Paste your text." : "Choose a language and paste your code."}
                         </p>
                         <p>
                           <span className="text-white font-semibold">Step 2:</span> Click{" "}
                           <span className="text-cyan-400 font-semibold">Check for Plagiarism</span>.
                         </p>
                         <p>
                           <span className="text-white font-semibold">Step 3:</span> View detailed plagiarism analysis.
                         </p>
                      </motion.div>
                    )}

                    {isChecking && (
                       <motion.div
                        key="checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex items-center justify-center"
                       >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                          <p className="text-cyan-400 text-lg mb-2">
                            Analyzing {mode === "text" ? "Text" : `${language} Code`}...
                          </p>
                          <p className="text-slate-400 text-sm">
                            Checking for plagiarism sources
                          </p>
                        </div>
                       </motion.div>
                    )}
                    
                    {results && !isChecking && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                       <PlagiarismResults {...results} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}