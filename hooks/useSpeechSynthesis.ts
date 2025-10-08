import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
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
        // Clean the text of markdown characters to prevent TTS from reading them aloud.
        const cleanText = text.replace(/(\*\*|\*|_|#|`)/g, '');
        if (cleanText !== '') {
            const utterThis = new SpeechSynthesisUtterance(cleanText);
            utterThis.lang = lang;
            
            const voices = synth.getVoices();
            let selectedVoice: SpeechSynthesisVoice | null = null;
            
            const langCode = lang.split('-')[0];
            const langVoices = voices.filter(v => v.lang.startsWith(langCode));

            if (langVoices.length > 0) {
                const qualityKeywords = ['natural', 'premium', 'enhanced', 'neural', 'pro', 'google', 'microsoft'];
                const femaleKeywords = ['female', 'woman', 'femme', 'frau', 'kobieta', 'امرأة', 'zira', 'monica', 'paulina'];
                
                // Prioritize voices based on a scoring system for a more natural sound
                const scoredVoices = langVoices.map(voice => {
                    let score = 0;
                    const nameLower = voice.name.toLowerCase();
            
                    // Highest priority: voices with descriptive quality keywords
                    if (qualityKeywords.some(kw => nameLower.includes(kw))) {
                        score += 10;
                    }
            
                    // High priority: local service voices are often higher quality
                    if (voice.localService) {
                        score += 5;
                    }
                    
                    // Preference for female voices, which can sound warmer
                    if (femaleKeywords.some(kw => nameLower.includes(kw))) {
                        score += 3;
                    }

                    // Slight preference for default system voices
                    if (voice.default) {
                        score += 2;
                    }
                    
                    // Slight preference for voices matching the full lang code (e.g., 'en-US' over 'en')
                    if (voice.lang === lang) {
                        score += 1;
                    }
                    
                    return { voice, score };
                });
            
                // Sort by score descending to find the best available voice
                scoredVoices.sort((a, b) => b.score - a.score);
                
                selectedVoice = scoredVoices.length > 0 ? scoredVoices[0].voice : langVoices[0];
            }
            
            utterThis.voice = selectedVoice;

            // Adjust speech parameters for a more natural, warm, and expressive tone
            utterThis.pitch = 1.1; // A slightly higher pitch adds expressiveness and avoids a monotone delivery.
            utterThis.rate = 0.9;  // A slightly slower rate improves clarity and mimics a more natural speaking pace.
            utterThis.volume = 1;  // Use maximum volume.


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