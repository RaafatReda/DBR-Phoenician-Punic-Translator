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

  const speak = useCallback((text: string, lang: string, gender?: 'male' | 'female') => {
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
            let selectedVoice: SpeechSynthesisVoice | null = null;
            const langVoices = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
            
            if (gender) {
                if (gender === 'male') {
                    // Heuristic for male voices based on common names in voice lists
                    selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Maged') || v.name.includes('David') || v.name.includes('Google US English Male')) || null;
                } else { // female
                    selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Laila') || v.name.includes('Google US English Female')) || null;
                }
            }

            // Fallback logic if gender-specific voice not found
            if (!selectedVoice) {
                const specificVoice = voices.find(voice => voice.lang === lang);
                const genericVoice = langVoices[0]; // Get the first available for the language
                selectedVoice = specificVoice || genericVoice || null;
            }

            utterThis.voice = selectedVoice;

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
      const loadVoices = () => {
        // This is just to trigger the loading.
        synth.getVoices();
      };
      synth.onvoiceschanged = loadVoices;
      loadVoices(); // Initial call
    }
  }, []);

  return { speak, cancel, isSpeaking, supported };
};