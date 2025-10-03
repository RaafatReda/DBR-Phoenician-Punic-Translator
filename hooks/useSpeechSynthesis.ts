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
            
            const voices = synth.getVoices();
            let selectedVoice: SpeechSynthesisVoice | null = null;

            // Filter for voices matching the language (e.g., 'ar' for 'ar-SA')
            const langCode = lang.split('-')[0];
            const langVoices = voices.filter(v => v.lang.startsWith(langCode));

            if (langVoices.length > 0) {
                const femaleKeywords = ['female', 'woman', 'femme', 'frau', 'kobieta', 'امرأة', 'laila', 'zira', 'monica', 'paulina'];
                const maleKeywords = ['male', 'man', 'homme', 'mann', 'mężczyzna', 'رجل', 'maged', 'david', 'zaki', 'diego', 'jorge'];
                
                // 1. Try to find a female voice by positive match
                selectedVoice = langVoices.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))) || null;
                
                // 2. If not found, try to find one that DOESN'T match a male voice (negative match)
                if (!selectedVoice) {
                     selectedVoice = langVoices.find(v => !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))) || null;
                }
                
                // 3. Fallback to the first available voice for the language if gender search still fails
                if (!selectedVoice) {
                    selectedVoice = langVoices.find(v => v.lang === lang) || langVoices[0];
                }
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
