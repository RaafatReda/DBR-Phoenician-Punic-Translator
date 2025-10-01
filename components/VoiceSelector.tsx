import React from 'react';
import MaleIcon from './icons/MaleIcon';
import FemaleIcon from './icons/FemaleIcon';

type Gender = 'male' | 'female';

interface VoiceSelectorProps {
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
  t: (key: string) => string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedGender, onGenderChange, t }) => {
  const buttonClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--color-surface-solid)] focus:ring-[color:var(--color-primary)] ${
      isActive
        ? 'bg-[color:var(--color-primary)] text-[color:var(--keyboard-active-button-text)] shadow-md'
        : 'bg-transparent text-[color:var(--color-text-muted)] hover:bg-white/10 hover:text-[color:var(--color-text)]'
    }`;

  return (
    <div className="flex items-center justify-center space-x-2 bg-[color:var(--color-surface-solid)] p-1.5 rounded-xl glass-panel w-full max-w-xs mx-auto">
      <button onClick={() => onGenderChange('female')} className={buttonClass(selectedGender === 'female')} aria-pressed={selectedGender === 'female'}>
        <FemaleIcon className="w-5 h-5" />
        <span>{t('female')}</span>
      </button>
      <button onClick={() => onGenderChange('male')} className={buttonClass(selectedGender === 'male')} aria-pressed={selectedGender === 'male'}>
        <MaleIcon className="w-5 h-5" />
        <span>{t('male')}</span>
      </button>
    </div>
  );
};

export default VoiceSelector;