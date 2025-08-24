import React, { useState } from 'react';
import UploadModal from '../components/Upload';
import Processing from '../components/Processing';
import AudioResult from '../components/AudioResult';
import VideoResult from '../components/VideoResult';

function DeepfakeUploadPage() {
  const [view, setView] = useState('upload'); // 'upload', 'processing', 'audioResult', 'videoResult'
  const [analysisType, setAnalysisType] = useState(null);

  // This function is called by UploadModal to start the process
  const handleAnalysisStart = (fileType) => {
    setAnalysisType(fileType);
    setView('processing');
  };

  // This function is now passed to the Processing component.
  // It gets called automatically when the progress reaches 100%.
  const handleProcessingComplete = () => {
    if (analysisType === 'audio') {
      setView('audioResult');
    } else if (analysisType === 'video') {
      setView('videoResult');
    }
  };

  const handleReset = () => {
    setView('upload');
  };

  switch (view) {
    case 'processing':
      // Pass the completion handler to the Processing component
      return <Processing onComplete={handleProcessingComplete} />;
    case 'audioResult':
      return <AudioResult onReset={handleReset} />;
    case 'videoResult':
      return <VideoResult onReset={handleReset} />;
    case 'upload':
    default:
      return <UploadModal onAnalysisComplete={handleAnalysisStart} />;
  }
}

export default DeepfakeUploadPage;