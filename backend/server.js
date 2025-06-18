const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ✅ Define allowed origins (for production and development)
const allowedOrigins = [
  'https://openvoice-92569.web.app', // Firebase hosted frontend
  'http://localhost:3000'            // Local dev frontend
];

// ✅ Use custom CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Not allowed by CORS'));
    }
  }
}));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// ✅ Translation endpoint
app.post('/translate', async (req, res) => {
  const { text, fromLanguage, toLanguage, mode } = req.body;
  console.log('Incoming translation request:', req.body);

  // Validate input
  if (!text || !fromLanguage || !toLanguage || !mode) {
    return res.status(400).json({
      error: 'Text, fromLanguage, toLanguage, or mode is missing'
    });
  }

  try {
    // Call LibreTranslate API
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: fromLanguage,
      target: toLanguage,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const translatedText = response.data.translatedText;
    console.log('Translated Text:', translatedText);

    res.json({ translated_text: translatedText });

  } catch (error) {
    console.error('Translation failed:', error.message);
    res.status(500).json({
      error: 'Translation failed',
      details: error.message
    });
  }
});

// ✅ Health check route
app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
