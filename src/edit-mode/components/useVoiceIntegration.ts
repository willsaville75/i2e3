import { useState, useRef, useEffect } from 'react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceIntegration = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [audioModeEnabled, setAudioModeEnabled] = useState(false);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const voicesPreloadedRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      setRecognition(recognitionInstance);
    }

    // Initialize speech synthesis
    if (('speechSynthesis' in window)) {
      const synthInstance = window.speechSynthesis;
      setSynthesis(synthInstance);
      
      const preloadVoices = () => {
        const voices = synthInstance.getVoices();
        if (voices.length > 0 && !voicesPreloadedRef.current) {
          voicesPreloadedRef.current = true;
        }
      };
      
      preloadVoices();
      synthInstance.onvoiceschanged = preloadVoices;
    }
  }, []);

  const startRecording = (onResult: (text: string) => void) => {
    if (!recognition) return;

    setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const speakText = async (text: string) => {
    if (!text.trim()) return;
    
    setIsSpeaking(true);
    
    // Use browser speech synthesis
    if (synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = 1.0;
      utterance.volume = 0.9;
      
      const voices = synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    setIsSpeaking(false);
  };

  const toggleMessageAudio = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  };

  const toggleAudioMode = () => {
    setAudioModeEnabled(!audioModeEnabled);
  };

  return {
    isRecording,
    isSpeaking,
    audioModeEnabled,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    toggleMessageAudio,
    toggleAudioMode
  };
}; 