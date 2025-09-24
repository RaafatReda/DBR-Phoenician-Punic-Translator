import React from 'react';
import PenIcon from './icons/PenIcon';

interface GrammarHelperToggleProps {
  isGrammarHelperOn: boolean;
  onToggle: () => void;
  isDisabled: boolean;
  t: (key: string) => string;
}

const GrammarHelperToggle: React.FC<GrammarHelperToggleProps> = ({ isGrammarHelperOn, onToggle, isDisabled, t }) => {
  return (
    <div className="flex items-center space-x-3">
        <PenIcon className="w-5 h-5 text-[color:var(--color-text-muted)]" />
        <span className={`text-sm font-medium text-[color:var(--color-text-muted)]`}>
            {t('grammarHelper')}
        </span>
        <label htmlFor="grammar-toggle" className="relative inline-flex items-center cursor-pointer">
            <input 
            type="checkbox" 
            id="grammar-toggle" 
            className="sr-only peer" 
            checked={isGrammarHelperOn} 
            onChange={onToggle}
            disabled={isDisabled}
            aria-label="Toggle Grammar Helper"
            />
            <div className="w-11 h-6 bg-[color:var(--color-surface-solid)] peer-focus:outline-none peer-focus:shadow-[0_0_10px_var(--color-glow)] rounded-full peer border border-[color:var(--color-border)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--color-primary)]"></div>
        </label>
    </div>
  );
};

export default GrammarHelperToggle;