const startButton = document.getElementById('start-button');
const output = document.getElementById('output');
const translateButton = document.getElementById('translate-button');
const translatedOutput = document.getElementById('translated-output');
const inputLanguageSelect = document.getElementById('input-language');
const outputLanguageSelect = document.getElementById('output-language');
const darkModeButton = document.getElementById('toggle-dark-mode');
const viewHistoryButton = document.getElementById('view-history-button');
const clearHistoryButton = document.getElementById('clear-history-button');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');

// Initialize light mode
document.body.classList.add('light-mode');

// Toggle Dark Mode
darkModeButton.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode');
});

// Start Speech Recognition
startButton.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  if (!recognition) {
    console.error('Speech recognition not supported on this browser.');
    giveVoiceFeedback('Sorry, your browser does not support speech recognition.');
    return;
  }
  recognition.lang = inputLanguageSelect.value;
  recognition.start();

  recognition.onstart = () => {
    console.log('Speech recognition started...');
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    output.textContent = spokenText;
    console.log('Recognized:', spokenText);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    giveVoiceFeedback('Speech recognition error occurred.');
  };
});

// Voice Feedback
function giveVoiceFeedback(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utterance);
}

// Translate Text
translateButton.addEventListener('click', async () => {
  const textToTranslate = output.textContent.trim();
  const fromLanguage = inputLanguageSelect.value.split('-')[0];
  const toLanguage = outputLanguageSelect.value;
  let mode = document.getElementById('translation-mode').value;

  if (!textToTranslate || !fromLanguage || !toLanguage || !mode) {
    giveVoiceFeedback('Please enter text and select languages.');
    return;
  }

  if (!navigator.onLine) {
    mode = 'offline';
    console.warn('No internet connection. Using offline mode.');
  }

  try {
    const response = await fetch('https://open-voice-translator.vercel.app/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToTranslate, fromLanguage, toLanguage, mode })
    });

    if (!response.ok) throw new Error('Translation failed');

    const result = await response.json();
    translatedOutput.textContent = result.translated_text;
    saveToHistory(textToTranslate, result.translated_text);
    giveVoiceFeedback(`Translated: ${result.translated_text}`);
  } catch (error) {
    console.warn('Primary translation failed, trying offline fallback...');
    try {
      const fallbackResponse = await fetch('https://open-voice-translator.vercel.app/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, fromLanguage, toLanguage, mode: 'offline' })
      });

      if (!fallbackResponse.ok) throw new Error('Offline fallback also failed');

      const fallbackResult = await fallbackResponse.json();
      translatedOutput.textContent = fallbackResult.translated_text;
      saveToHistory(textToTranslate, fallbackResult.translated_text);
      giveVoiceFeedback(`Offline translation: ${fallbackResult.translated_text}`);
    } catch (retryError) {
      console.error('Both online and offline translation failed.');
      giveVoiceFeedback('Sorry, translation failed. Please try again.');
    }
  }
});

// Save Translation to History
function saveToHistory(originalText, translatedText) {
  const history = JSON.parse(localStorage.getItem('translationHistory')) || [];
  history.push({ original: originalText, translated: translatedText });
  localStorage.setItem('translationHistory', JSON.stringify(history));
}

// View Translation History
viewHistoryButton.addEventListener('click', () => {
  const history = JSON.parse(localStorage.getItem('translationHistory')) || [];
  historyList.innerHTML = '';
  if (history.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.textContent = 'No history yet.';
    historyList.appendChild(emptyMsg);
  } else {
    history.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = `Original: ${item.original} → Translated: ${item.translated}`;
      historyList.appendChild(listItem);
    });
  }
  historySection.style.display = 'block';
});

// Clear Translation History
clearHistoryButton.addEventListener('click', () => {
  localStorage.removeItem('translationHistory');
  historyList.innerHTML = '';
  giveVoiceFeedback('Translation history cleared.');
});
