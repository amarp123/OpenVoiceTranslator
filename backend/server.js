const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/translate', async (req, res) => {
  const { text, fromLanguage, toLanguage, mode } = req.body;
  console.log('Request Body:', req.body);

  if (!text || !fromLanguage || !toLanguage || !mode) {
    return res.status(400).json({ error: 'Text, fromLanguage, toLanguage, or mode missing' });
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
    console.log('Translated Text:', translatedText);
    res.json({ translated_text: translatedText });

  } catch (error) {
    console.error('Translation failed:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send({ activeStatus: true, error: false });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
