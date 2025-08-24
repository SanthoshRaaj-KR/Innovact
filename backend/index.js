// server.js (Express backend)
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your React app URLs
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Modal API
app.post('/api/predict', upload.single('file'), async (req, res) => {
  try {
    console.log('Received file upload request');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate environment variables
    if (!process.env.TOKEN_ID || !process.env.TOKEN_SECRET) {
      console.error('Missing API credentials');
      return res.status(500).json({ error: 'Server configuration error - missing API credentials' });
    }

    // Create FormData for the Modal API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || 'audio/mpeg'
    });

    console.log('Sending request to Modal API...');

    // Make request to Modal API with your credentials
    const response = await axios.post(
      'https://binshilin63--deepfake-detector-deepfakeaudioapi-predict.modal.run',
      formData,
      {
        headers: {
          'Modal-Key': process.env.TOKEN_ID,
          'Modal-Secret': process.env.TOKEN_SECRET,
          ...formData.getHeaders()
        },
        timeout: 60000, // 60 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB
        maxBodyLength: 50 * 1024 * 1024 // 50MB
      }
    );

    
    console.log('Modal API response:', response.status);
    res.json(response.data);

  } catch (error) {
    console.error('Proxy error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? Object.keys(error.config.headers) : []
      }
    });

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout - analysis took too long' });
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: error.response.data || `API Error: ${error.response.status}`,
        details: error.response.statusText
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ error: 'Unable to reach analysis service' });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/predict`);
});