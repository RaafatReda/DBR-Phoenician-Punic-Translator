import React from 'react';
import { PronunciationResult, PhoenicianDialect } from '../types';
import Loader from './Loader';
import SpeakerIcon from './icons/SpeakerIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import SparklesIcon from './icons/SparklesIcon';
import VoiceSelector from './VoiceSelector';
import PencilIcon from './icons/PencilIcon';

type TtsGender = 'male' | 'female';

interface PronunciationResultDisplayProps {
  result: PronunciationResult | null;
  isLoading: boolean;
  error: string | null;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onDiscuss: () => void;
  t: (key: string) => string;
  dialect: PhoenicianDialect;
  ttsGender: TtsGender;
  onTtsGenderChange: (gender: TtsGender) => void;
  onUpdatePronunciation: (result: PronunciationResult) => void;
}

const PronunciationResultDisplay: React.FC<PronunciationResultDisplayProps> = ({ 
    result, isLoading, error, isSpeaking, onSpeak, onDiscuss, t, dialect,
    ttsGender, onTtsGenderChange
}) => {
  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const fontClass = isPunic ? '[font-family:var(--font-punic)] text-3xl' : '[font-family:var(--font-phoenician)] text-2xl';

  const ResultCard: React.FC<{ titleKey: string; children: React.ReactNode; hasAction?: boolean; onAction?: () => void; actionDisabled?: boolean; actionLabelKey?: string; }> = 
  ({ titleKey, children, hasAction, onAction, actionDisabled, actionLabelKey }) => (
    <div className="bg-black/20 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-secondary)]">{t(titleKey)}</h4>
        {hasAction && onAction && actionLabelKey && (
          <button onClick={onAction} disabled={actionDisabled} className="p-2 -m-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 disabled:opacity-50" aria-label={t(actionLabelKey)}>
            <SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking} />
          </button>
        )}
      </div>
      <div className="text-lg text-[color:var(--color-text)] break-words">{children}</div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mt-6">
      {isLoading || error || result ? (
        <>
          <div className="flex items-center justify-center gap-2 mb-4">
              <SpeakerWaveIcon className="w-6 h-6 text-[color:var(--color-secondary)]" />
              <h3 className="text-xl font-semibold text-[color:var(--color-text-muted)]">{t('pronunciationSuggestion')}</h3>
          </div>
          <div className="glass-panel rounded-[var(--border-radius)] p-6 min-h-[15rem] flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex items-center text-[color:var(--color-primary)]">
                <Loader className="w-6 h-6 mr-3" />
                <span>{t('reconstructing')}...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-400">
                <p className="font-semibold">{t('dailyWordError')}</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : result && (
              <div className="w-full">
                <div className="w-full space-y-4 animate-text-glow-fade-in" style={{ animationDuration: '0.5s' }}>
                  <ResultCard titleKey="transliteration">
                    <p className="italic">{result.transliteration}</p>
                  </ResultCard>
                  <ResultCard titleKey="ipa">
                    <p className="font-mono">[{result.ipa}]</p>
                  </ResultCard>
                  
                   <div className="bg-black/20 p-4 rounded-lg">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-secondary)] mb-3">{t('voiceSelection')}</h4>
                      <VoiceSelector selectedGender={ttsGender} onGenderChange={onTtsGenderChange} t={t} />
                   </div>

                  <ResultCard titleKey="wordByWordReading">
                    <div className="flex flex-wrap gap-2" dir="rtl">
                      {result.word_pronunciations.map((item, index) => (
                        <button 
                            key={index}
                            onClick={() => onSpeak(item.tts)}
                            className={`px-3 py-1 bg-white/5 text-[color:var(--color-text)] rounded-md hover:bg-white/10 transition-colors ${fontClass}`}
                            aria-label={`${t('speakPronunciation')} ${item.phoenician}`}
                            disabled={isSpeaking}
                        >
                            {item.phoenician}
                        </button>
                      ))}
                    </div>
                  </ResultCard>
                  <ResultCard 
                    titleKey="fullSentenceReading" 
                    hasAction={true} 
                    onAction={() => onSpeak(result.tts_full_sentence)}
                    actionDisabled={isSpeaking}
                    actionLabelKey="speakFullSentence"
                  >
                    <p dir="rtl" className="text-xl">{result.tts_full_sentence}</p>
                  </ResultCard>
                  <ResultCard titleKey="linguisticNotes">
                    <p className="text-base text-gray-400">{result.note}</p>
                  </ResultCard>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button 
                        onClick={onDiscuss}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 text-[color:var(--color-primary)] hover:bg-white/20 transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                        {t('editPronunciation')}
                    </button>
                    <button 
                        onClick={onDiscuss}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 text-[color:var(--color-primary)] hover:bg-white/20 transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {t('discussPronunciation')}
                    </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full min-h-[15rem] flex items-center justify-center text-center text-[color:var(--color-text-muted)]">
            <p>{t('reconstructorPlaceholder')}</p>
        </div>
      )}
    </div>
  );
};

export default PronunciationResultDisplay;