import React from 'react';

interface ComparisonModeToggleProps {
  isComparisonMode: boolean;
  onToggle: () => void;
  isDisabled: boolean;
  t: (key: string) => string;
}

const ComparisonModeToggle: React.FC<ComparisonModeToggleProps> = ({ isComparisonMode, onToggle, isDisabled, t }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <span className={`text-sm font-semibold transition-colors duration-300 ${!isComparisonMode ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-text-muted)]'}`}>
        {t('translatorMode')}
      </span>
      <label htmlFor="comparison-toggle" className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id="comparison-toggle" 
          className="sr-only peer" 
          checked={isComparisonMode} 
          onChange={onToggle}
          disabled={isDisabled}
          aria-label="Toggle between translator and dialect comparison mode"
        />
        <div className="w-11 h-6 bg-[color:var(--color-surface-solid)] peer-focus:outline-none peer-focus:shadow-[0_0_10px_var(--color-glow)] rounded-full peer border border-[color:var(--color-border)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--color-secondary)]"></div>
      </label>
      <span className={`text-sm font-semibold transition-colors duration-300 ${isComparisonMode ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-text-muted)]'}`}>
        {t('dialectMode')}
      </span>
    </div>
  );
};

export default ComparisonModeToggle;