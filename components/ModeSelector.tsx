import React from 'react';
import ScriptIcon from './icons/ScriptIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import SwitchHorizontalIcon from './icons/SwitchHorizontalIcon';

type AppMode = 'translator' | 'comparison' | 'pronunciation';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isDisabled: boolean;
  t: (key: string) => string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, isDisabled, t }) => {
  const modes: { key: AppMode; labelKey: string; icon: React.ReactNode }[] = [
    { key: 'translator', labelKey: 'translatorMode', icon: <ScriptIcon className="w-5 h-5" /> },
    { key: 'comparison', labelKey: 'dialectMode', icon: <SwitchHorizontalIcon className="w-5 h-5" /> },
    { key: 'pronunciation', labelKey: 'pronunciationMode', icon: <SpeakerWaveIcon className="w-5 h-5" /> },
  ];

  const buttonClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--color-surface-solid)] focus:ring-[color:var(--color-primary)] ${
      isActive
        ? 'bg-[color:var(--color-primary)] text-[color:var(--keyboard-active-button-text)] shadow-md'
        : 'bg-transparent text-[color:var(--color-text-muted)] hover:bg-white/10 hover:text-[color:var(--color-text)]'
    }`;

  return (
    <div className="flex items-center justify-center space-x-2 bg-[color:var(--color-surface-solid)] p-1.5 rounded-xl glass-panel w-full max-w-lg">
      {modes.map(({ key, labelKey, icon }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          disabled={isDisabled}
          className={buttonClass(currentMode === key)}
          aria-pressed={currentMode === key}
        >
          {icon}
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;