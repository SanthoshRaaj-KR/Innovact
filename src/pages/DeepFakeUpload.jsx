import React, { useState } from 'react';
import UploadModal from '../components/Upload';
import Processing from '../components/processing';
import AudioResult from '../components/AudioResult';
import VideoResult from '../components/VideoResult';

function DeepfakeUploadPage() {
  const [view, setView] = useState('upload'); // 'upload', 'processing', 'audioResult', 'videoResult'
  const [analysisType, setAnalysisType] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // This function is called by UploadModal to start the process
  const handleAnalysisStart = (fileType, file) => {
    setAnalysisType(fileType);
    setFileData(file);
    setView('processing');
  };

  // This function is now passed to the Processing component.
  // It gets called automatically when the progress reaches 100%.
  const handleProcessingComplete = (result) => {
    setAnalysisResult(result);
    
    if (analysisType === 'audio') {
      setView('audioResult');
    } else if (analysisType === 'video') {
      setView('videoResult');
    }
  };

  const handleReset = () => {
    setView('upload');
    setFileData(null);
    setAnalysisResult(null);
    setAnalysisType(null);
  };

  switch (view) {
    case 'processing':
      return (
        <Processing 
          onComplete={handleProcessingComplete}
          fileData={fileData}
          analysisType={analysisType}
        />
      );
    case 'audioResult':
      return (
        <AudioResult 
          onReset={handleReset}
          analysisResult={analysisResult}
        />
      );
    case 'videoResult':
      return <VideoResult onReset={handleReset} />;
    case 'upload':
    default:
      return <UploadModal onAnalysisComplete={handleAnalysisStart} />;
  }
}

export default DeepfakeUploadPage;