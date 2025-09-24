import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  // Using a ref for synth to avoid re-renders when it's accessed.
  // FIX: Added useRef import.
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, lang: string) => {
    const synth = synthRef.current;
    if (!synth || !supported) return;

    if (synth.speaking) {
      synth.cancel();
    }
    
    // Some browsers need a moment to cancel before speaking again.
    setTimeout(() => {
        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.lang = lang;
            
            // Find a suitable voice
            const voices = synth.getVoices();
            const specificVoice = voices.find(voice => voice.lang === lang);
            const langPrefix = lang.split('-')[0];
            const genericVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
            
            utterThis.voice = specificVoice || genericVoice || null;

            utterThis.onend = () => {
                setIsSpeaking(false);
            };

            utterThis.onerror = (e) => {
                console.error('SpeechSynthesis Error', e);
                setIsSpeaking(false);
            };

            setIsSpeaking(true);
            synth.speak(utterThis);
        }
    }, 100);
  }, [supported]);

  const cancel = useCallback(() => {
    const synth = synthRef.current;
    if (!synth || !supported) return;

    if (synth.speaking) {
      synth.cancel();
    }
    setIsSpeaking(false);
  }, [supported]);

  // Cleanup on unmount
  useEffect(() => {
    const synth = synthRef.current;
    return () => {
      if (synth?.speaking) {
        synth.cancel();
      }
    };
  }, []);

  // Ensure voices are loaded. Some browsers load them asynchronously.
  useEffect(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.onvoiceschanged = () => {
        // Voices loaded, this is just to trigger the loading.
      };
    }
  }, []);

  return { speak, cancel, isSpeaking, supported };
};
