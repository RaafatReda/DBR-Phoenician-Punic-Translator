import React, { useState, useEffect, useCallback } from 'react';
import { GlossaryEntry, PhoenicianWordDetails, PronunciationResult, PhoenicianDialect } from '../types';
import { getPhoenicianWordDetails, reconstructPronunciation } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import RefreshIcon from './icons/RefreshIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import SentenceTutorModal from './SentenceTutorModal';

interface WordDetailModalProps {
  entry: GlossaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onUseWord: (word: string) => void;
  onSaveSentence: (details: PhoenicianWordDetails) => void;
  t: (key: string) => string;
  speak: (text: string, lang: string, gender?: 'male' | 'female') => void;
  isSpeaking: boolean;
  dialect: PhoenicianDialect;
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({ entry, isOpen, onClose, onUseWord, onSaveSentence, t, speak, isSpeaking, dialect }) => {
  const [details, setDetails] = useState<PhoenicianWordDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  const uiLang = (localStorage.getItem('dbr-translator-lang') as UILang) || 'en';

  useEffect(() => {
    if (entry && isOpen) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        setDetails(null);
        setPronunciation(null);
        try {
          const wordDetails = await getPhoenicianWordDetails(entry.phoenician);
          setDetails(wordDetails);
          // Pre-fetch pronunciation for the Phoenician sentence
          const pron = await reconstructPronunciation(wordDetails.exampleSentence.phoenician, dialect, uiLang);
          setPronunciation(pron);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [entry, isOpen, t, dialect, uiLang]);

  const handlePlayAudio = (type: 'phoenician' | 'arabic' | 'latin') => {
    if (!details) return;
    switch (type) {
      case 'phoenician':
        if (pronunciation) speak(pronunciation.tts_full_sentence, 'ar-SA');
        break;
      case 'arabic':
        speak(details.exampleSentence.arabic, 'ar-SA');
        break;
      case 'latin':
        // No standard lang code for Phoenician Latin translit, use a generic one
        speak(details.exampleSentence.latin, 'en-US'); 
        break;
    }
  };
  
  const handleSave = () => {
    if(details) {
      onSaveSentence(details);
      onClose(); // Close modal after saving
    }
  };

  if (!isOpen || !entry) return null;

  const fontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-5xl' : '[font-family:var(--font-phoenician)] text-4xl';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[60] p-4" onClick={onClose} role="dialog">
        <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-pop-in" onClick={(e) => e.stopPropagation()}>
          <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)]">
            <p className={`text-[color:var(--color-primary)] ${fontClass}`} dir="rtl">{entry.phoenician}</p>
            <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-white" aria-label={t('close')}><CloseIcon className="w-6 h-6"/></button>
          </header>

          <main className="p-6 text-center min-h-[250px] flex items-center justify-center">
            {isLoading ? <Loader className="w-8 h-8 text-[color:var(--color-primary)]" /> :
             error ? <p className="text-red-400">{error}</p> :
             details && (
              <div className="w-full space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-[color:var(--color-text-muted)] tracking-wider">{t('dailyWordUsage')}</h3>
                </div>
                
                <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                        <p className={`text-2xl ${fontClass.replace(/text-..xl/, '')}`} dir="rtl">{details.exampleSentence.phoenician}</p>
                        <button onClick={() => handlePlayAudio('phoenician')} disabled={!pronunciation || isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-lg" dir="rtl">{details.exampleSentence.arabic}</p>
                         <button onClick={() => handlePlayAudio('arabic')} disabled={isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-base italic text-gray-400" dir="ltr">{details.exampleSentence.latin}</p>
                         <button onClick={() => handlePlayAudio('latin')} disabled={isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" /></button>
                    </div>
                </div>
              </div>
            )}
          </main>

          <footer className="p-4 border-t border-[color:var(--color-border)] flex flex-col space-y-3">
             <button
                onClick={() => { onUseWord(entry.phoenician); onClose(); }}
                className="w-full py-2.5 px-4 bg-[color:var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('useThisWord')}
              </button>
              <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handlePlayAudio('phoenician')} disabled={!pronunciation || isSpeaking} className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50">
                      <RefreshIcon className="w-5 h-5"/>
                      <span className="text-xs mt-1">{t('repeat')}</span>
                  </button>
                   <button onClick={handleSave} disabled={!details} className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50">
                      <BookmarkIcon className="w-5 h-5"/>
                      <span className="text-xs mt-1">{t('saveTitle')}</span>
                  </button>
                   <button onClick={() => setIsTutorOpen(true)} disabled={!details} className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50">
                      <ChatBubbleIcon className="w-5 h-5"/>
                      <span className="text-xs mt-1">{t('askAi')}</span>
                  </button>
              </div>
          </footer>
        </div>
      </div>
      {details && (
        <SentenceTutorModal 
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          wordDetails={details}
          t={t}
          uiLang={uiLang}
        />
      )}
    </>
  );
};

export default WordDetailModal;
