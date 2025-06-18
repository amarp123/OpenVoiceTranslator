const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ✅ CORS Setup
const allowedOrigins = ['https://openvoice-92569.web.app', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Not allowed by CORS'));
    }
  }
}));

app.use(bodyParser.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send({ status: 'Server running', time: new Date().toISOString() });
});

// ✅ Translation Endpoint
app.post('/translate', async (req, res) => {
  const { text, fromLanguage, toLanguage, mode } = req.body;
  console.log('\n🟢 New Request Received');
  console.log('Text:', text);
  console.log('From:', fromLanguage);
  console.log('To:', toLanguage);
  console.log('Mode:', mode);

  if (!text || !fromLanguage || !toLanguage || !mode) {
    console.error('❌ Missing fields in request');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: fromLanguage,
      target: toLanguage,
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const translatedText = response.data.translatedText;
    console.log('✅ Translation Success:', translatedText);
    res.json({ translated_text: translatedText });

  } catch (error) {
    console.error('❌ Translation Failed');
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: 'Translation failed',
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
