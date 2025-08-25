import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { loader, useMonaco } from "@monaco-editor/react";
// Simulate Monaco Editor with a basic code editor
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
});


const myTheme = {
  base: "vs-dark", // start from dark/light base
  inherit: true,
  rules: [
    { token: "", foreground: "f1f5f9", background: "0f172a" }, // default text
    { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
    { token: "keyword", foreground: "38bdf8" },
    { token: "string", foreground: "22c55e" },
    { token: "number", foreground: "facc15" },
    { token: "variable", foreground: "e5e7eb" },
  ],
  colors: {
    "editor.background": "#0f172a", // same as your textarea background
    "editor.foreground": "#f1f5f9", // text color
    "editorLineNumber.foreground": "#94a3b8",
    "editorCursor.foreground": "#f1f5f9",
    "editor.selectionBackground": "#33415566",
    "editor.lineHighlightBackground": "#1e293b",
  },
};

// Map display labels -> language ids
const LANG_MAP = {
  "C++": "cpp",
  C: "c",
  Java: "java",
  Python: "python",
};

// --- RESULTS PANEL ---
const PlagiarismResults = ({ plagiarized, unique, sources }) => {
  const r = 56;
  const circleCircumference = 2 * Math.PI * r;

  return (
    <div className="flex-1 flex flex-col h-full text-white animate-fade-in">
      {/* Fixed Donut - removed the 90-degree rotation issue */}
      <div className="flex flex-col items-center justify-center p-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="8"
              className="stroke-slate-700"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="8"
              className="stroke-cyan-400"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              initial={{ strokeDashoffset: circleCircumference }}
              animate={{
                strokeDashoffset:
                  circleCircumference - (plagiarized / 100) * circleCircumference,
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          {/* Fixed: Removed the extra rotate-90 class that was causing the issue */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-cyan-400">{plagiarized}%</span>
            <span className="text-sm text-slate-400">Plagiarized</span>
          </div>
        </div>
      </div>

      {/* Bars */}
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

      {/* Sources */}
      <div className="flex-1 overflow-y-auto px-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-200">Sources Found:</h3>
        <motion.ul
          className="space-y-3"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 1 } },
          }}
          initial="hidden"
          animate="visible"
        >
          {sources.map((source, index) => (
            <motion.li
              key={index}
              className="bg-slate-700/40 p-3 rounded-lg border border-slate-600/50 text-sm hover:border-cyan-400/30 transition-colors duration-300"
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            >
              <div className="flex justify-between items-center">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  {source.title}
                </a>
                <span className="ml-4 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-md text-xs font-semibold border border-cyan-400/30">
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
  const [mode, setMode] = useState("text");
  const [language, setLanguage] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);

  const editorKey = mode === "code" ? LANG_MAP[language] || "plaintext" : "text";
  const editorRef = useRef(null);

  const handleCheckPlagiarism = () => {
    if (!textInput.trim()) return;
    setIsChecking(true);
    setResults(null);

    setTimeout(() => {
      const plagiarizedPercent = Math.floor(Math.random() * 60) + 25;
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
    }, 1500);
  };

  const handleReset = () => {
    setTextInput("");
    setLanguage("");
    setResults(null);
    setIsChecking(false);
  };

  const handleMainButtonAction = () => {
    results ? handleReset() : handleCheckPlagiarism();
  };

const handleEditorMount = (editor, monaco) => {
  monaco.editor.defineTheme("my-custom-theme", myTheme);
  monaco.editor.setTheme("my-custom-theme");
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      {/* Enhanced Background Blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-purple-400/8 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-indigo-400/8 rounded-full blur-xl animate-pulse delay-3000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse"></div>
      </div>

      {/* Main Panel */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="relative z-10 w-full max-w-6xl">
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-600/30 shadow-2xl">
            {/* Header & Close */}
            <button
              onClick={() => window.location.href = "/"}
              className="absolute top-4 right-6 text-slate-400 hover:text-white text-2xl font-bold z-50 cursor-pointer transition-colors duration-200 hover:rotate-90 transform"
              aria-label="Close"
            >×</button>

            <div className="p-4 sm:p-6 border-b border-slate-700/50 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src="/logoGenReal.png" alt="Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  AI <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{mode === "text" ? "Text" : "Code"}</span> Checker
                </h1>
              </div>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                Detect {mode === "text" ? "AI & Human Text" : "Code"} Plagiarism with Precision.
              </p>
              <div className="mt-4 flex justify-center gap-4">
                {["text","code"].map(m=>(
                  <button key={m} onClick={()=>{setMode(m); handleReset();}}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      mode===m
                        ? m==="text"
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                    }`}>
                    {m==="text"?"Text":"Code"}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Split */}
            <div className="flex flex-col md:flex-row min-h-[500px] h-full">
              {/* Left Panel */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col">
                {mode==="code" && (
                  <div className="mb-4">
                    <h2 className="text-sm text-slate-300 mb-2 font-medium">Select Language:</h2>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(LANG_MAP).map(lang=>(
                        <button key={lang} onClick={()=>setLanguage(lang)}
                          className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 hover:scale-105 ${
                            language===lang
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                          }`}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{mode==="text"?"Enter Your Text":"Paste Your Code"}</h2>
                  <div className="text-sm text-slate-400 bg-slate-700/30 px-2 py-1 rounded-md">
                    {textInput.length}/5000
                  </div>
                </div>

                <div className="flex-1 mb-4 relative">
                  {mode==="code"?(
                    <div className="h-96 md:h-[420px] rounded-xl overflow-hidden border border-slate-600/40 shadow-lg">
                      <Editor
                        height="100%"
                        language={LANG_MAP[language] || "plaintext"}
                        value={textInput}
                        onChange={v => setTextInput(v ?? "")}
                        options={{
                          minimap: { enabled: false },
                          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                          fontSize: 14,
                          lineHeight: 26,
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          automaticLayout: true,
                          lineNumbers: "on",
                          roundedSelection: false,
                          scrollbar: { vertical: "auto", horizontal: "auto" },
                          renderLineHighlight: "line",
                          bracketPairColorization: { enabled: true },
                          overviewRulerBorder: false,
                        }}
                        onMount={handleEditorMount}
                      />


                    </div>
                  ):(
                    <textarea
                      value={textInput}
                      onChange={e=>setTextInput(e.target.value)}
                      placeholder="Paste your text here..."
                      className="w-full h-96 md:h-[420px] bg-slate-700/30 backdrop-blur-sm border border-slate-600/40 rounded-xl p-4 text-white placeholder-slate-400 outline-none resize-none text-base md:text-sm leading-relaxed focus:border-cyan-400/60 transition-all duration-300 focus:bg-slate-700/40 shadow-lg"
                      maxLength={5000}
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleMainButtonAction}
                    disabled={(!textInput.trim() && !results)||isChecking||(mode==="code"&&!language&&textInput.trim())}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm">
                    {isChecking?"Checking...":results?"Start New Check":"Check for Plagiarism"}
                  </button>
                  {(results||textInput)&&(
                    <button onClick={handleReset}
                      className="px-6 py-3 bg-slate-600/50 hover:bg-slate-600/70 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-300 hover:scale-105">
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {results?"Results":"Get Started"}
                </h2>
                <AnimatePresence mode="wait">
                  {!textInput.trim()&&!isChecking&&!results && (
                    <motion.div key="get-started" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      className="flex flex-col items-start justify-start h-full px-4 pt-2 text-slate-400 space-y-6 text-sm leading-relaxed">
                      <p><span className="text-white font-semibold">Step 1:</span> {mode==="text"?"Paste your text.":"Choose a language and paste your code."}</p>
                      <p><span className="text-white font-semibold">Step 2:</span> Click <span className="text-cyan-400 font-semibold">Check for Plagiarism</span>.</p>
                      <p><span className="text-white font-semibold">Step 3:</span> View detailed plagiarism analysis.</p>
                      <div className="mt-8 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                        <p className="text-cyan-400 font-medium mb-2">💡 Pro Tip:</p>
                        <p className="text-xs">Our AI can detect both human-written content that matches existing sources and AI-generated text patterns.</p>
                      </div>
                    </motion.div>
                  )}
                  {isChecking && (
                    <motion.div key="checking" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                        <p className="text-cyan-400 text-lg mb-2">Analyzing {mode==="text"?"Text":`${language||"Code"}`}...</p>
                        <p className="text-slate-400 text-sm">Checking for plagiarism sources</p>
                        <div className="mt-4 flex justify-center space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {results&&!isChecking && <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <PlagiarismResults {...results} />
                  </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}