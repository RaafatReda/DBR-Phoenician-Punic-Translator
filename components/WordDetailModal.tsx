import React, { useState, useEffect } from 'react';
import { GlossaryEntry, PhoenicianWordDetails, PronunciationResult, PhoenicianDialect } from '../types';
import { getPhoenicianWordDetails, reconstructPronunciation } from '../services/geminiService';
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
  const [isSaved, setIsSaved] = useState(false);
  const [activeAudio, setActiveAudio] = useState<'phoenician' | 'arabic' | 'latin' | null>(null);

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

  useEffect(() => {
    if (!isSpeaking) {
      setActiveAudio(null);
    }
  }, [isSpeaking]);

  const handlePlayAudio = (type: 'phoenician' | 'arabic' | 'latin') => {
    if (!details || isSpeaking) return;
    setActiveAudio(type);
    switch (type) {
      case 'phoenician':
        if (pronunciation) speak(pronunciation.tts_full_sentence, 'ar-SA');
        break;
      case 'arabic':
        speak(details.exampleSentence.arabic, 'ar-SA');
        break;
      case 'latin':
        speak(details.exampleSentence.latin, 'en-US');
        break;
    }
  };

  const handleSave = () => {
    if (details) {
      onSaveSentence(details);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  if (!isOpen || !entry) return null;

  const fontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-5xl' : '[font-family:var(--font-phoenician)] text-4xl';
  const sentenceFontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-4xl' : '[font-family:var(--font-phoenician)] text-3xl';
  
  const uiIsRtl = uiLang === 'ar';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="word-detail-title">
        <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-sm flex flex-col animate-pop-in" onClick={(e) => e.stopPropagation()}>
          <header className="flex justify-between items-center p-4">
            <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-white" aria-label={t('close')}><CloseIcon className="w-6 h-6"/></button>
            <p id="word-detail-title" className={`text-[color:var(--color-primary)] ${fontClass}`} dir="rtl">{entry.phoenician}</p>
          </header>

          <div className="px-6">
            <hr className="border-[color:var(--color-border)] opacity-30" />
          </div>

          <main className="p-6 text-center min-h-[250px] flex flex-col items-center justify-center">
            {isLoading ? <Loader className="w-8 h-8 text-[color:var(--color-primary)]" /> :
             error ? <p className="text-red-400">{error}</p> :
             details && (
              <div className="w-full space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-[color:var(--color-text-muted)] tracking-wider" dir={uiIsRtl ? 'rtl' : 'ltr'}>
                    {t('dailyWordUsage')}
                  </h3>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <button onClick={() => handlePlayAudio('phoenician')} disabled={!pronunciation || isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking && activeAudio === 'phoenician'} /></button>
                        <p className={`flex-grow text-center text-white ${sentenceFontClass}`} dir="rtl">{details.exampleSentence.phoenician}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => handlePlayAudio('arabic')} disabled={isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking && activeAudio === 'arabic'} /></button>
                        <p className="flex-grow text-center text-lg text-gray-300" dir="rtl">{details.exampleSentence.arabic}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <button onClick={() => handlePlayAudio('latin')} disabled={isSpeaking} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking && activeAudio === 'latin'} /></button>
                        <p className="flex-grow text-center text-base italic text-gray-400" dir="ltr">{details.exampleSentence.latin}</p>
                    </div>
                </div>
              </div>
            )}
          </main>

          <footer className="p-4 pt-2 flex flex-col space-y-3">
              <div className="px-2">
                <div className="w-full h-1.5 bg-[color:var(--color-primary)] rounded-full opacity-75"></div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsTutorOpen(true)} disabled={!details} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50" title={t('askAi')}>
                      <ChatBubbleIcon className="w-6 h-6"/>
                  </button>
                   <button onClick={handleSave} disabled={!details} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 min-w-[120px] gap-2">
                      <BookmarkIcon className="w-6 h-6" isFilled={isSaved}/>
                      <span className="text-sm font-semibold">{isSaved ? t('saveSuccess') : t('saveTitle')}</span>
                  </button>
                   <button onClick={() => handlePlayAudio('phoenician')} disabled={!pronunciation || isSpeaking} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50" title={t('repeat')}>
                      <RefreshIcon className="w-6 h-6"/>
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
