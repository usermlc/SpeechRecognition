let question = window.document.getElementById('question');
let answer = window.document.getElementById('answer');
let buttonGo = window.document.getElementById('buttonGo');
let buttonStop = window.document.getElementById('buttonStop');

class webkitSpeechRecognizer {
  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = 'en-US';
    this.isRecognizing = false;
  }

  start() {
    if (!this.isRecognizing) {
      this.recognition.start();
      this.isRecognizing = true;
      console.log("Speech recognition started.");
    }
  }

  stop() {
    if (this.isRecognizing) {
      this.recognition.stop();
      this.isRecognizing = false;
      console.log("Speech recognition stopped.");
    }
  }

  onResult(callback) {
    this.recognition.onresult = function(event) {
      console.log(event.results);
      let result = event.results[0][0].transcript;
      callback(result);
    };
  }

  onError(callback) {
    this.recognition.onerror = function(event) {
      callback('Error occurred in speech recognition: ' + event.error);
    };
  }
}

const requestFunc = () => {
  if (question.innerText) {
    let message = {
      "role": "user",
      "content": `${question.innerText}`
    };

    let params = {
      "model": "gpt-3.5-turbo",
      "messages": [message]
    };

    axios.post('https://api.openai.com/v1/chat/completions', params, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log(response);
        answer.textContent = (response.data.choices[0].message.content);

        talkAnswer(response.data.choices[0].message.content);
      })
      .catch(error => {
        console.error(error);
      });
  }
};

let speechRecognizer = new webkitSpeechRecognizer();

const startSpeechRecognition = () => {
  if (!speechRecognizer.isRecognizing) {
    speechRecognizer.start();
  }
};

const stopSpeechRecognition = () => {
  if (speechRecognizer.isRecognizing) {
    speechRecognizer.stop();
  }
};

const stopTextToSpeech = () => {
  speechSynthesis.cancel();
};

buttonGo.addEventListener('click', startSpeechRecognition);
buttonStop.addEventListener('click', stopSpeechRecognition);
buttonStop.addEventListener('click', stopTextToSpeech);

speechRecognizer.onResult(function(result) {
  question.textContent = result;
  talkQuestion(result);
  speechRecognizer.stop();
  requestFunc();
});

const talkQuestion = (text) =>{
  let textToTalk = new SpeechSynthesisUtterance(text);
  textToTalk.lang = 'en-US';
  speechSynthesis.speak(textToTalk);
}

const talkAnswer = (text) =>{
  let textToTalk = new SpeechSynthesisUtterance(text);
  textToTalk.lang = 'en-US';
  speechSynthesis.speak(textToTalk);
}