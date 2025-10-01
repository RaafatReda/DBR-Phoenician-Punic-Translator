import React from 'react';
import { PronunciationResult } from '../types';
import Loader from './Loader';
import SpeakerIcon from './icons/SpeakerIcon';

interface PronunciationResultDisplayProps {
  result: PronunciationResult | null;
  isLoading: boolean;
  error: string | null;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  t: (key: string) => string;
}

const PronunciationResultDisplay: React.FC<PronunciationResultDisplayProps> = ({ result, isLoading, error, isSpeaking, onSpeak, t }) => {
  const ResultCard: React.FC<{ titleKey: string; children: React.ReactNode; hasAction?: boolean; onAction?: () => void; actionDisabled?: boolean; }> = 
  ({ titleKey, children, hasAction, onAction, actionDisabled }) => (
    <div className="bg-black/20 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[color:var(--color-secondary)]">{t(titleKey)}</h4>
        {hasAction && onAction && (
          <button onClick={onAction} disabled={actionDisabled} className="p-2 -m-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 disabled:opacity-50" aria-label={t('speakPronunciation')}>
            <SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking} />
          </button>
        )}
      </div>
      <div className="text-lg text-[color:var(--color-text)] break-words">{children}</div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mt-6">
      <div className="glass-panel rounded-[var(--border-radius)] p-6 min-h-[15rem] flex items-center justify-center">
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
        ) : result ? (
          <div className="w-full space-y-4 animate-text-glow-fade-in" style={{ animationDuration: '0.5s' }}>
            <ResultCard titleKey="latinTransliterationLabel">
              <p className="italic">{result.latinTransliteration}</p>
            </ResultCard>
            <ResultCard titleKey="ipaReconstructionLabel">
              <p className="font-mono">[{result.ipaReconstruction}]</p>
            </ResultCard>
            <ResultCard 
              titleKey="ttsFriendlyLabel" 
              hasAction={true} 
              onAction={() => onSpeak(result.ttsFriendly)}
              actionDisabled={isSpeaking}
            >
              <p className="font-semibold">{result.ttsFriendly}</p>
            </ResultCard>
          </div>
        ) : (
          <div className="text-center text-[color:var(--color-text-muted)]">
            <p>{t('reconstructorPlaceholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationResultDisplay;
