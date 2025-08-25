const express = require('express');
const cors = require('cors');
const FormData = require('form-data');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PLAGIARISM_PORT || 5001; 

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// --- Middleware ---
// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Enable JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data parsing

// --- Error Handling Helper ---
const handleApiError = (error, res, type) => {
  console.error(`${type} API error details:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    config: {
      url: error.config?.url,
      method: error.config?.method,
    }
  });

  if (error.code === 'ECONNABORTED') {
    return res.status(408).json({
      error: `Request timeout - ${type} analysis took too long`,
      details: 'The plagiarism detection service may be experiencing high load.'
    });
  }

  if (error.response) {
    return res.status(error.response.status).json({
      error: error.response.data?.error || `${type} API Error: ${error.response.status}`,
      details: error.response.statusText
    });
  } else if (error.request) {
    return res.status(503).json({
      error: `Unable to reach ${type} analysis service`,
      details: 'The service may be temporarily unavailable.'
    });
  } else {
    return res.status(500).json({
      error: 'Internal server error during plagiarism check',
      details: error.message,
    });
  }
};

// --- Helper function to format Modal API response ---
const formatModalResponse = (modalResponse, isTextMode = true) => {
  console.log('Raw Modal API response:', modalResponse);
  
  // Handle the Modal API response format directly
  let isAiGenerated, confidence, humanProb, aiProb;
  
  if (modalResponse.prediction && modalResponse.confidence !== undefined && modalResponse.probabilities) {
    // Direct format from Modal API
    isAiGenerated = modalResponse.prediction === 'AI' || modalResponse.prediction === 'MACHINE_GENERATED' || modalResponse.prediction === 1;
    confidence = modalResponse.confidence;
    
    // Use probabilities directly from Modal response
    if (modalResponse.probabilities.Human !== undefined && modalResponse.probabilities.AI !== undefined) {
      humanProb = Math.round(modalResponse.probabilities.Human * 100);
      aiProb = Math.round(modalResponse.probabilities.AI * 100);
    } else if (modalResponse.probabilities.HUMAN_GENERATED !== undefined && modalResponse.probabilities.AI_GENERATED !== undefined) {
      humanProb = Math.round(modalResponse.probabilities.HUMAN_GENERATED * 100);
      aiProb = Math.round(modalResponse.probabilities.AI_GENERATED * 100);
    } else {
      // Fallback calculation
      if (isAiGenerated) {
        aiProb = Math.round(confidence * 100);
        humanProb = 100 - aiProb;
      } else {
        humanProb = Math.round(confidence * 100);
        aiProb = 100 - humanProb;
      }
    }
  } else if (modalResponse.label) {
    // Label format (fallback)
    isAiGenerated = modalResponse.label === 'AI_GENERATED' || modalResponse.label === 'MACHINE_GENERATED';
    confidence = modalResponse.confidence || 0.8;
    
    if (isAiGenerated) {
      aiProb = Math.round(confidence * 100);
      humanProb = 100 - aiProb;
    } else {
      humanProb = Math.round(confidence * 100);
      aiProb = 100 - humanProb;
    }
  } else {
    // Fallback
    isAiGenerated = false;
    confidence = 0.5;
    humanProb = 50;
    aiProb = 50;
  }
  
  const confidencePercent = Math.round(confidence * 100);
  
  return {
    prediction: isAiGenerated ? 'plagiarized' : 'original',
    confidence: confidencePercent,
    probabilities: {
      Human: humanProb,
      AI: aiProb
    }
  };
};

// --- API Routes ---

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ service: 'Plagiarism Checker', status: 'OK', timestamp: new Date().toISOString() });
});

// Text Plagiarism Check Endpoint
app.post('/api/plagiarism/check/text', upload.none(), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Request headers:', req.headers);
    
    // Handle both JSON and form-data requests
    let text;
    if (req.body.text) {
      text = req.body.text;
    } else if (req.body && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        text = parsed.text;
      } catch (e) {
        text = req.body;
      }
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required.' });
    }

    console.log(`Checking text plagiarism for ${text.length} characters...`);

    // Use the CORRECT Modal API endpoint for TEXT analysis
    const apiUrl = 'https://binshilin63--text-plagiarism-aihumantextdetectorapi-predict.modal.run';
    
    // Send as form data exactly like your Python example
    const params = new URLSearchParams();
    params.append('text', text);

    const response = await axios.post(apiUrl, params, {
      headers: {
        'Modal-Key': process.env.TOKEN_ID,
        'Modal-Secret': process.env.TOKEN_SECRET,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 300000, // 5 minutes for analysis
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024,
    });

    console.log('Modal API response:', response.data);

    // Format the Modal response for frontend
    const formattedResponse = formatModalResponse(response.data, true);

    console.log('Text plagiarism analysis completed:', formattedResponse);
    res.json(formattedResponse);

  } catch (error) {
    console.error('Text plagiarism check failed:', error);
    handleApiError(error, res, 'Text');
  }
});

// Code Plagiarism Check Endpoint (File upload)
app.post('/api/plagiarism/check/code', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Code file is required.' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const language = req.body.language || 'unknown';

    if (!fileContent.trim()) {
      return res.status(400).json({ error: 'Code file appears to be empty.' });
    }

    console.log(`Checking code plagiarism for ${language} file (${fileContent.length} characters)...`);

    // Use the Modal API endpoint for CODE deepfake detection
    const apiUrl = 'https://binshilin63--code-deepfake-detector-deepfakecodeapi-predict.modal.run';
    
    const formData = new FormData();
    formData.append('code', fileContent); // Modal expects 'code' parameter for code analysis

    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Modal-Key': process.env.TOKEN_ID,
        'Modal-Secret': process.env.TOKEN_SECRET,
        ...formData.getHeaders()
      },
      timeout: 300000, // 5 minutes for code analysis
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024,
    });

    // Format the Modal response for frontend
    const formattedResponse = formatModalResponse(response.data, false);

    console.log('Code plagiarism analysis completed:', {
      language: language,
      ...formattedResponse
    });

    res.json(formattedResponse);

  } catch (error) {
    console.error('Code plagiarism check failed:', error);
    handleApiError(error, res, 'Code');
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/plagiarism/check', upload.single('file'), async (req, res) => {
  // Check if it's a file upload (code) or text data
  if (req.file) {
    // Redirect to code endpoint
    req.url = '/api/plagiarism/check/code';
    return app._router.handle(req, res);
  } else if (req.body.text) {
    // Redirect to text endpoint  
    req.url = '/api/plagiarism/check/text';
    return app._router.handle(req, res);
  } else {
    return res.status(400).json({ 
      error: 'Invalid request format. Use /api/plagiarism/check/text for text or /api/plagiarism/check/code for file uploads.' 
    });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Plagiarism checker server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Text API endpoint: http://localhost:${PORT}/api/plagiarism/check/text`);
  console.log(`💻 Code API endpoint: http://localhost:${PORT}/api/plagiarism/check/code`);
  console.log(`🔗 Legacy endpoint: http://localhost:${PORT}/api/plagiarism/check`);
});