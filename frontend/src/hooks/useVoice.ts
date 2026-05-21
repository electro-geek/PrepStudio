import { useState, useEffect, useRef } from "react";

export function useVoice() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
      if (!SpeechRecognition) {
        setBrowserSupportsSpeech(false);
        return;
      }
      
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setTranscript(currentTranscript);
          }
        };
        
        rec.onerror = (e: any) => {
          console.warn("Speech recognition handler error:", e);
          if (e.error === "not-allowed") {
            console.warn("Microphone access not permitted by browser settings.");
          }
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      } catch (err) {
        console.error("Failed to initialize speech recognition engine:", err);
        setBrowserSupportsSpeech(false);
      }
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not supported or initialized.");
      return;
    }
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start voice recognition capture:", e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error("Failed to stop voice recognition capture:", e);
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop any speech currently playing to avoid overlaps
    window.speechSynthesis.cancel();
    
    // Strip simple markdown formatting before speaking
    const cleanText = text
      .replace(/[*#_`~]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower for better professional articulation
    utterance.pitch = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  return {
    transcript,
    setTranscript,
    isListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    browserSupportsSpeech
  };
}
