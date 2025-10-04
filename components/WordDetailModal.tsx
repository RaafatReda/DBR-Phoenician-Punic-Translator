import React, { useState, useEffect } from 'react';
import { GlossaryEntry, PhoenicianWordDetails, PronunciationResult, PhoenicianDialect, GlossaryLang } from '../types';
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
  speak: (text: string, lang: string) => void;
  isSpeaking: boolean;
  dialect: PhoenicianDialect;
  glossaryLang: GlossaryLang;
}

const WordDetailModal: React.FC<WordDetailModalProps> = ({ entry, isOpen, onClose, onUseWord, onSaveSentence, t, speak, isSpeaking, dialect, glossaryLang }) => {
  const [details, setDetails] = useState<PhoenicianWordDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pronunciation, setPronunciation] = useState<PronunciationResult | null>(null);
  const [sentencePronunciation, setSentencePronunciation] = useState<PronunciationResult | null>(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const uiLang = (localStorage.getItem('dbr-translator-lang') as UILang) || 'en';

  useEffect(() => {
    if (entry && isOpen) {
      const fetchDetailsAndPronunciations = async () => {
        setIsLoading(true);
        setError(null);
        setDetails(null);
        setPronunciation(null);
        setSentencePronunciation(null);
        setIsSaved(false);
        try {
          // Step 1: Get word details including the example sentence
          const wordDetails = await getPhoenicianWordDetails(entry.phoenician, entry.meaning);
          setDetails(wordDetails);

          // Step 2: Fetch pronunciations for the word and the new sentence in parallel
          const [wordPron, sentencePron] = await Promise.all([
              reconstructPronunciation(entry.phoenician, dialect, uiLang),
              reconstructPronunciation(wordDetails.exampleSentence.phoenician, dialect, uiLang)
          ]);
          setPronunciation(wordPron);
          setSentencePronunciation(sentencePron);

        } catch (err) {
          setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetailsAndPronunciations();
    }
  }, [entry, isOpen, t, dialect, uiLang]);
  
  const handlePlayWord = () => {
    if (pronunciation && !isSpeaking) {
      speak(pronunciation.tts_full_sentence, 'ar-SA');
    }
  };

  const handlePlayExampleSentence = () => {
    if (sentencePronunciation && !isSpeaking) {
      speak(sentencePronunciation.tts_full_sentence, 'ar-SA');
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
  const sentenceFontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-3xl' : '[font-family:var(--font-phoenician)] text-2xl';
  
  const meaning = (entry.meaning as any)[glossaryLang] || entry.meaning.en;

  const exampleTranslation = 
    details ? (
        uiLang === 'fr' ? details.exampleSentence.french :
        uiLang === 'ar' ? details.exampleSentence.arabic :
        details.exampleSentence.english
    ) : '';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="word-detail-title">
        <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-pop-in" onClick={(e) => e.stopPropagation()}>
          
          <header className="flex justify-between items-start p-4 border-b border-[color:var(--color-border)]">
              <button onClick={() => { onUseWord(entry.phoenician); onClose(); }} className="px-3 py-1.5 text-xs font-semibold bg-white/10 rounded-lg hover:bg-white/20 text-[color:var(--color-primary)]" title={t('useThisWord')}>
                {t('useThisWord')}
              </button>
              <h2 id="word-detail-title" className="sr-only">{entry.phoenician}</h2>
              <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-white" aria-label={t('close')}><CloseIcon className="w-6 h-6"/></button>
          </header>

          <main className="p-6 text-center min-h-[350px] flex flex-col items-center justify-center">
            {isLoading ? <Loader className="w-8 h-8 text-[color:var(--color-primary)]" /> :
             error ? <p className="text-red-400">{error}</p> :
             details && pronunciation && (
              <div className="w-full space-y-4">
                
                {/* Word Section */}
                <div className="flex items-center justify-center gap-3">
                    <p className={`text-[color:var(--color-primary)] ${fontClass}`} dir="rtl">{entry.phoenician}</p>
                    <button onClick={handlePlayWord} disabled={isSpeaking || !pronunciation} className="p-2 rounded-full hover:bg-white/10 text-[color:var(--color-secondary)] disabled:opacity-50"><SpeakerIcon className="w-6 h-6" isSpeaking={isSpeaking} /></button>
                </div>
                
                {/* Transcription Section */}
                <div className="text-sm text-gray-400 grid grid-cols-3 gap-2">
                    <div className="font-mono">[{pronunciation.ipa}]</div>
                    <div className="italic">{entry.latin}</div>
                    <div dir="rtl">{(pronunciation.word_pronunciations[0] || {}).tts}</div>
                </div>

                <p className="text-lg capitalize font-semibold" dir={glossaryLang === 'ar' ? 'rtl' : 'ltr'}>{meaning}</p>
                
                <hr className="border-[color:var(--color-border)] opacity-30 my-4" />

                {/* Example Sentence Section */}
                <div className="w-full text-left space-y-2">
                    <h3 className="text-sm font-semibold uppercase text-[color:var(--color-text-muted)] tracking-wider mb-3 text-center" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                        {t('dailyWordUsage')}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        <p className={`text-white ${sentenceFontClass}`} dir="rtl">
                            {details.exampleSentence.phoenician.split(entry.phoenician).map((part, i) => 
                                <React.Fragment key={i}>
                                    {part}
                                    {i < details.exampleSentence.phoenician.split(entry.phoenician).length - 1 && (
                                        <span className="text-[color:var(--color-secondary)]">{entry.phoenician}</span>
                                    )}
                                </React.Fragment>
                            )}
                        </p>
                         <button onClick={handlePlayExampleSentence} disabled={isSpeaking || !sentencePronunciation} className="p-1 text-[color:var(--color-secondary)] disabled:opacity-50">
                            <SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking} />
                        </button>
                    </div>
                     <p className="text-sm text-center text-gray-400" dir="ltr">
                         <strong>IPA:</strong> <span className="font-mono">[{sentencePronunciation?.ipa}]</span>
                    </p>
                     <p className="text-sm text-center text-gray-400" dir="ltr">
                         <strong>Latin:</strong> <span className="italic">{details.exampleSentence.latin}</span>
                    </p>
                     <p className="text-sm text-center text-gray-400" dir="rtl">
                         <strong>Arabic:</strong> {details.exampleSentence.arabicTransliteration}
                    </p>
                    <p className="text-base text-center text-gray-300 pt-2" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                        <em>&ldquo;{exampleTranslation}&rdquo;</em>
                    </p>
                </div>

              </div>
            )}
          </main>

          <footer className="p-4 pt-2 flex items-center justify-center gap-2">
                <button onClick={() => setIsTutorOpen(true)} disabled={!details} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50" title={t('askAi')}>
                    <ChatBubbleIcon className="w-6 h-6"/>
                </button>
                <button onClick={handleSave} disabled={!details} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 min-w-[120px] gap-2">
                    <BookmarkIcon className="w-6 h-6" isFilled={isSaved}/>
                    <span className="text-sm font-semibold">{isSaved ? t('saveSuccess') : t('saveTitle')}</span>
                </button>
                <button onClick={handlePlayWord} disabled={!pronunciation || isSpeaking} className="flex-1 flex items-center justify-center p-3 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50" title={t('repeat')}>
                    <RefreshIcon className="w-6 h-6"/>
                </button>
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