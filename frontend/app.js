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
  console.log('Start Speaking button clicked');
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  if (!recognition) {
    console.error('Speech recognition not supported');
    return;
  }
  recognition.lang = inputLanguageSelect.value;
  recognition.start();
  recognition.onstart = () => {
    console.log('Speech recognition started');
  };
  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    console.log('Speech recognition result:', spokenText);
    output.textContent = spokenText;
  };
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
});

// Voice Feedback
function giveVoiceFeedback(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utterance);
}

// Translate Text
translateButton.addEventListener('click', async () => {
  const textToTranslate = output.textContent;
  const fromLanguage = inputLanguageSelect.value.split('-')[0];
  const toLanguage = outputLanguageSelect.value;
  let mode = document.getElementById('translation-mode').value;

  if (!navigator.onLine) {
    mode = 'offline';
    console.warn('No internet connection detected. Switching to offline mode.');
  }

  console.log(`Text to Translate: ${textToTranslate}`);
  console.log(`From Language: ${fromLanguage}`);
  console.log(`To Language: ${toLanguage}`);
  console.log(`Mode: ${mode}`);

  if (!textToTranslate || !fromLanguage || !toLanguage || !mode) {
    console.error('Required input is missing');
    return;
  }

  try {
    const response = await fetch('https://open-voice-translator.vercel.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToTranslate, fromLanguage, toLanguage, mode })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`Translated Text: ${result.translated_text}`);
      translatedOutput.textContent = result.translated_text;
      saveToHistory(textToTranslate, result.translated_text);
      giveVoiceFeedback(`Translation completed. The translated text is ${result.translated_text}`);
    } else {
      console.error(`Translation failed: ${response.statusText}`);
      giveVoiceFeedback('Translation failed. Please try again.');
    }
  } catch (error) {
    console.warn('Online mode failed. Trying offline mode...');
    try {
      const fallbackResponse = await fetch('https://open-voice-translator.vercel.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, fromLanguage, toLanguage, mode: 'offline' })
      });

      if (fallbackResponse.ok) {
        const result = await fallbackResponse.json();
        console.log(`Translated Text: ${result.translated_text}`);
        translatedOutput.textContent = result.translated_text;
        saveToHistory(textToTranslate, result.translated_text);
        giveVoiceFeedback(`Translation completed. The translated text is ${result.translated_text}`);
      } else {
        console.error(`Offline translation failed: ${fallbackResponse.statusText}`);
        giveVoiceFeedback('Offline translation failed. Please try again.');
      }
    } catch (retryError) {
      console.error('Both online and offline modes failed:', retryError);
      giveVoiceFeedback('An error occurred. Please try again.');
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
  history.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `Original: ${item.original}, Translated: ${item.translated}`;
    historyList.appendChild(listItem);
  });
  historySection.style.display = 'block';
});

// Clear Translation History
clearHistoryButton.addEventListener('click', () => {
  localStorage.removeItem('translationHistory');
  historyList.innerHTML = '';
  giveVoiceFeedback('Translation history has been cleared.');
});
