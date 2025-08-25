import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Editor component since we can't import Monaco in this environment
const Editor = ({ height, language, value, onChange, options }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={`Enter your ${language || 'code'} here...`}
    className="w-full h-full bg-slate-800 text-slate-100 p-4 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none"
    style={{ height, minHeight: height }}
  />
);

const myTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "f1f5f9", background: "0f172a" },
    { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
    { token: "keyword", foreground: "38bdf8" },
    { token: "string", foreground: "22c55e" },
    { token: "number", foreground: "facc15" },
    { token: "variable", foreground: "e5e7eb" },
  ],
  colors: {
    "editor.background": "#0f172a",
    "editor.foreground": "#f1f5f9",
    "editorLineNumber.foreground": "#94a3b8",
    "editorCursor.foreground": "#f1f5f9",
    "editor.selectionBackground": "#33415566",
    "editor.lineHighlightBackground": "#1e293b",
  },
};

const LANG_MAP = {
  "C++": "cpp",
  C: "c",
  Java: "java",
  Python: "python",
};

// --- RESULTS PANEL ---
const PlagiarismResults = ({ prediction, confidence, probabilities }) => {
  // Determine if content is AI-generated (plagiarized) or human-generated (original)
  const isOriginal = prediction === 'original';
  const predictionText = isOriginal ? 'Human Generated' : 'AI Generated';
  const predictionIcon = isOriginal ? '✓' : '⚠';
  const predictionColor = isOriginal ? 'text-green-400' : 'text-red-400';
  const bgColor = isOriginal ? 'bg-green-500/20' : 'bg-red-500/20';

  return (
    <div className="flex-1 flex flex-col h-full text-white animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8">
        {/* Prediction */}
        <div className={`px-4 py-2 rounded-full text-sm font-medium mb-4 ${bgColor} ${predictionColor}`}>
          {predictionIcon} {predictionText}
        </div>

        {/* Confidence */}
        <div className="bg-slate-700/30 rounded-xl p-6 w-full mb-4 text-center">
          <span className="text-slate-300 block mb-2">Confidence</span>
          <span className="text-cyan-400 text-2xl font-semibold">{confidence}%</span>
        </div>

        {/* Probabilities */}
        {probabilities && (
          <div className="bg-slate-700/30 rounded-xl p-6 w-full text-center space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Human Generated:</span>
              <span className="text-green-400 font-semibold">{probabilities.Human}%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>AI Generated:</span>
              <span className="text-red-400 font-semibold">{probabilities.AI}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AIPlagiarismChecker() {
  const [mode, setMode] = useState("text");
  const [language, setLanguage] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleCheckPlagiarism = async () => {
    if (!textInput.trim()) return;
    
    setIsChecking(true);
    setResults(null);
    setError(null);

    try {
      if (mode === "text") {
        console.log('Sending text for analysis:', textInput.substring(0, 100) + '...');

        // TEXT MODE - Send as form data (like your Python example)
        const formData = new FormData();
        formData.append("text", textInput);

        const response = await fetch("http://localhost:5001/api/plagiarism/check/text", {
          method: "POST",
          body: formData, // Send as FormData to match your Python example
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Text analysis response:", data);

        // Validate response format
        if (!data.prediction || data.confidence === undefined) {
          throw new Error("Invalid response format from server");
        }

        setResults({
          prediction: data.prediction,
          confidence: data.confidence,
          probabilities: data.probabilities || { Human: 50, AI: 50 },
        });

      } else if (mode === "code") {
        // CODE MODE - Call code endpoint with file upload
        if (!language) {
          setError("Please select a programming language first.");
          setIsChecking(false);
          return;
        }

        console.log('Sending code for analysis:', language, textInput.substring(0, 100) + '...');

        const file = new Blob([textInput], { type: "text/plain" });
        const formData = new FormData();
        formData.append("file", file, `code.${LANG_MAP[language] || 'txt'}`);
        formData.append("language", language);

        const response = await fetch("http://localhost:5001/api/plagiarism/check/code", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Code analysis response:", data);
        
        // Validate response format
        if (!data.prediction || data.confidence === undefined) {
          throw new Error("Invalid response format from server");
        }

        setResults({
          prediction: data.prediction,
          confidence: data.confidence,
          probabilities: data.probabilities || { Human: 50, AI: 50 },
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze content. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setTextInput("");
    setLanguage("");
    setResults(null);
    setError(null);
    setIsChecking(false);
  };

  const handleMainButtonAction = () => {
    results ? handleReset() : handleCheckPlagiarism();
  };

  const handleEditorMount = (editor, monaco) => {
    if (monaco) {
      monaco.editor.defineTheme("my-custom-theme", myTheme);
      monaco.editor.setTheme("my-custom-theme");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header with title and home button */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              ←
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AI Code Detector
            </h1>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
          >
            🏠 <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>

      <div className="flex items-start justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6">
        <div className="relative z-10 w-full max-w-7xl">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-600/30 shadow-2xl">
            {/* Mode switch */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-200">Detection Mode</h2>
                <div className="text-sm text-slate-400">
                  Powered by AI Analysis Engine
                </div>
              </div>
              <div className="flex gap-4">
                {["text", "code"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      handleReset();
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      mode === m
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {m === "text" ? "📝 Text Analysis" : "💻 Code Analysis"}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                <p className="font-medium">Analysis Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Left Panel - Input */}
              <div className="w-full lg:w-3/5 p-6 border-b lg:border-b-0 lg:border-r border-slate-700/50">
                <div className="h-full flex flex-col">
                  {mode === "code" && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-200 mb-3">Select Programming Language:</h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.keys(LANG_MAP).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              language === lang
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">
                      {mode === "text" ? "Enter your text:" : "Enter your code:"}
                    </h3>
                    
                    {mode === "code" ? (
                      <div className="flex-1 rounded-xl overflow-hidden border border-slate-600/30">
                        <Editor
                          height="350px"
                          language={LANG_MAP[language] || "plaintext"}
                          value={textInput}
                          onChange={(v) => setTextInput(v ?? "")}
                          onMount={handleEditorMount}
                          options={{ 
                            minimap: { enabled: false }, 
                            wordWrap: "on",
                            fontSize: 14,
                            lineHeight: 1.5,
                            padding: { top: 16 }
                          }}
                        />
                      </div>
                    ) : (
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste your text here to check if it's AI-generated..."
                        className="flex-1 min-h-[350px] bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 focus:border-cyan-500/50 focus:outline-none resize-none text-slate-100 placeholder-slate-400"
                      />
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleMainButtonAction}
                      disabled={!textInput.trim() || isChecking || (mode === "code" && !language)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none"
                    >
                      {isChecking
                        ? "🔍 Analyzing..."
                        : results
                        ? "🔄 Start New Check"
                        : "🚀 Check AI Detection"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Results */}
              <div className="w-full lg:w-2/5 p-6">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-200">Analysis Results</h3>
                    {results && (
                      <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        ✓ Complete
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {!textInput.trim() && !isChecking && !results && (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center text-slate-400 py-12"
                        >
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-700/30 flex items-center justify-center text-4xl">
                            🔍
                          </div>
                          <p className="text-lg mb-2">Ready to analyze</p>
                          <p className="text-sm">Enter your {mode} content and click check</p>
                        </motion.div>
                      )}
                      
                      {isChecking && (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center py-12"
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin"></div>
                          <p className="text-cyan-400 font-medium">Analyzing with AI...</p>
                          <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
                        </motion.div>
                      )}
                      
                      {results && !isChecking && (
                        <motion.div 
                          key="results"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="w-full"
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
    </div>
  );
}