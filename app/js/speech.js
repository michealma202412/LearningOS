// speech.js
// Module for speech recognition functionality

export class SpeechToText {
  constructor(lang = 'zh-CN') {
    this.recognition = null;
    this.isListening = false;
    this.lang = lang;
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Browser does not support speech recognition');
    }
    
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }
  
  setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (this.onResult) {
        this.onResult(finalTranscript, interimTranscript);
      }
    };
    
    this.recognition.onerror = (event) => {
      if (this.onError) {
        this.onError(event.error);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd();
      }
    };
  }
  
  start(cb) {
    if (!this.recognition) {
      return false;
    }
    
    try {
      this.onResult = cb;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      if (this.onError) {
        this.onError(error.message);
      }
      return false;
    }
  }
  
  stop() {
    if (!this.recognition) {
      return;
    }
    
    this.recognition.stop();
    this.isListening = false;
  }
  
  setOnError(callback) {
    this.onError = callback;
  }
  
  setOnEnd(callback) {
    this.onEnd = callback;
  }
}