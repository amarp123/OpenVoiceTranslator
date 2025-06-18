const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ✅ Allow Firebase & localhost frontend
const allowedOrigins = [
  'https://openvoice-92569.web.app', // Firebase
  'http://localhost:3000'            // Dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Translation route
app.post('/translate', async (req, res) => {
  const { text, fromLanguage, toLanguage, mode } = req.body;
  console.log('Request:', req.body);

  if (!text || !fromLanguage || !toLanguage || !mode) {
    return res.status(400).json({ error: 'Missing input fields' });
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
    console.log('Translated:', translatedText);

    res.json({ translated_text: translatedText });

  } catch (err) {
    console.error('Translation Error:', err.message);
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send({ status: 'Backend live', error: false });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
