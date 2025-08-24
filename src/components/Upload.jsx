import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { FiUploadCloud, FiMic, FiVideo, FiAlertTriangle } from 'react-icons/fi';
import Processing from './processing';

const UploadModal = () => {
  const [activeTab, setActiveTab] = useState('voice'); // default to voice
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [showFormatError, setShowFormatError] = useState(false);
  const [formatErrorMessage, setFormatErrorMessage] = useState('');

  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const errorPopupRef = useRef(null);

  // File type configurations (only audio + video)
  const fileTypes = {
    voice: {
      accept: '.mp3,.wav',
      formats: ['mp3', 'wav'],
      description: 'Audio: MP3, WAV',
      maxSize: '50MB'
    },
    video: {
      accept: '.mp4',
      formats: ['mp4'],
      description: 'Video: MP4',
      maxSize: '100MB'
    }
  };

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { x: 200, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.8, ease: 'power3.out' }
    );
  }, []);

  // Paste file from clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          if (validateFileType(blob)) {
            setFile(blob);
            setToastMessage("📋 File pasted from clipboard!");
            setTimeout(() => setToastMessage(null), 3000);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeTab]);

  const validateFileType = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedFormats = fileTypes[activeTab].formats;
    
    if (!allowedFormats.includes(fileExtension)) {
      showFormatErrorPopup(fileExtension, allowedFormats);
      return false;
    }
    return true;
  };

  const showFormatErrorPopup = (fileExt, allowedFormats) => {
    setFormatErrorMessage(
      `Invalid file format: .${fileExt}\nPlease upload ${allowedFormats.map(f => `.${f}`).join(', ')} files only.`
    );
    setShowFormatError(true);
    
    if (errorPopupRef.current) {
      gsap.fromTo(
        errorPopupRef.current,
        { scale: 0, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  };

  const closeFormatError = () => {
    if (errorPopupRef.current) {
      gsap.to(errorPopupRef.current, {
        scale: 0,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => setShowFormatError(false)
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFileType(droppedFile)) {
        setFile(droppedFile);
        setToastMessage("📁 File Dropped!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFileType(selectedFile)) {
      setFile(selectedFile);
      setToastMessage("✅ File Selected!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setLinkInput('');
  };

  const handleConfirm = async () => {
    if (!file && !linkInput.trim()) {
      setToastMessage("⚠️ Please select a file or enter a link");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setShowProcessing(true);
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'voice': return <FiMic className="w-5 h-5" />;
      case 'video': return <FiVideo className="w-5 h-5" />;
      default: return <FiFile className="w-5 h-5" />;
    }
  };

  if (showProcessing) return <Processing />;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative font-exo text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-slate-800/90 backdrop-blur-sm border border-cyan-400/30 rounded-3xl px-6 sm:px-10 md:px-12 py-8 w-[95vw] max-w-[900px] shadow-2xl z-10"
      >
        <button
          onClick={() => window.location.replace('/')}
          className="absolute top-3 right-4 text-white text-2xl font-bold hover:text-cyan-400 transition"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Upload your content
        </h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-700/50 rounded-2xl p-2 flex space-x-2">
            {Object.keys(fileTypes).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-300 font-inter ${
            dragging ? 'border-cyan-400 bg-cyan-400/10 scale-105' : 'border-cyan-400/50 bg-slate-700/30'
          }`}
        >
          <label htmlFor="file-upload" className="cursor-pointer block">
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept={fileTypes[activeTab].accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mb-4">
              <FiUploadCloud className="text-cyan-400 text-6xl mx-auto animate-pulse" />
            </div>
            <p className="font-semibold text-lg mb-2">
              {file ? (
                <span className="text-green-400">📁 {file.name}</span>
              ) : (
                `Drag and drop your ${activeTab} here`
              )}
            </p>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              <span className="text-cyan-400 font-semibold">{fileTypes[activeTab].description}</span>
              <br />
              <span className="text-yellow-400">Max file size: {fileTypes[activeTab].maxSize}</span>
            </p>
          </label>
        </div>

        {/* Separator */}
        <div className="text-center text-slate-400 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative bg-slate-800 px-4 text-sm">or paste a link</div>
        </div>

        {/* Link input field */}
        <div className="mb-8">
          <label htmlFor="link-input" className="block mb-2 text-sm font-semibold text-slate-300">
            Paste a {activeTab} link here
          </label>
          <input
            type="text"
            id="link-input"
            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder={`https://example.com/your-${activeTab}.${fileTypes[activeTab].formats[0]}`}
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => window.location.replace('/')}
          >
            Cancel
          </button>
          <button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
          >
            Analyze {activeTab}
          </button>
        </div>
      </div>

      {/* Format Error Popup */}
      {showFormatError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={errorPopupRef}
            className="bg-slate-800 border border-red-400/50 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
          >
            <div className="mb-4">
              <FiAlertTriangle className="text-red-400 text-5xl mx-auto animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-4">Invalid File Format</h3>
            <p className="text-slate-300 mb-6 whitespace-pre-line leading-relaxed">
              {formatErrorMessage}
            </p>
            <button
              onClick={closeFormatError}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-fade-in-out z-50 backdrop-blur-sm border border-cyan-400/30">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default UploadModal;
