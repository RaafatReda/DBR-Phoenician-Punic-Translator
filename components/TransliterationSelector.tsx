

import React from 'react';
import { TransliterationMode, PhoenicianDialect } from '../types';
import ScriptIcon from './icons/ScriptIcon';

interface TransliterationSelectorProps {
  currentMode: TransliterationMode;
  onModeChange: (mode: TransliterationMode) => void;
  isDisabled: boolean;
  t: (key: string) => string;
  dialect: PhoenicianDialect;
}

const TransliterationSelector: React.FC<TransliterationSelectorProps> = ({ currentMode, onModeChange, isDisabled, t, dialect }) => {
  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  const modes = [TransliterationMode.PHOENICIAN, TransliterationMode.LATIN, TransliterationMode.ARABIC, TransliterationMode.BOTH];
  
  const cycleMode = () => {
    if (isDisabled) return;
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onModeChange(modes[nextIndex]);
  };

  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  const getButtonText = () => {
      if (currentMode === TransliterationMode.PHOENICIAN) {
          return dialect === PhoenicianDialect.PUNIC ? t('punic') : t('phoenician');
      }
      return t(currentMode.toLowerCase());
  };

  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  const nextModeRaw = modes[(modes.indexOf(currentMode) + 1) % modes.length];
  const nextModeText = nextModeRaw === TransliterationMode.PHOENICIAN
    ? (dialect === PhoenicianDialect.PUNIC ? t('punic') : t('phoenician'))
    : t(nextModeRaw.toLowerCase());


  return (
    <div className="flex items-center space-x-3">
      <ScriptIcon className="w-5 h-5 text-[color:var(--color-text-muted)]" />
      <span className="text-sm font-medium text-[color:var(--color-text-muted)]">
        {t('scriptView')}
      </span>
      <button
        onClick={cycleMode}
        disabled={isDisabled}
        className="px-3 py-1.5 text-sm font-semibold bg-transparent text-[color:var(--color-primary)] border border-[color:var(--color-border)] rounded-md hover:bg-white/10 hover:border-[color:var(--color-primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)] transition-all"
        aria-live="polite"
        aria-label={`Change transliteration mode. Current mode is ${getButtonText()}. Click to switch to ${nextModeText}.`}
        style={{ minWidth: '90px', textAlign: 'center' }}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default TransliterationSelector;