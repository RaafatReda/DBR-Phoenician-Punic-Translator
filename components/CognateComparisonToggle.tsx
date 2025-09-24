import React from 'react';
import CognateIcon from './icons/CognateIcon';

interface CognateComparisonToggleProps {
  isCognateComparisonOn: boolean;
  onToggle: () => void;
  isDisabled: boolean;
  t: (key: string) => string;
}

const CognateComparisonToggle: React.FC<CognateComparisonToggleProps> = ({ isCognateComparisonOn, onToggle, isDisabled, t }) => {
  return (
    <div className="flex items-center space-x-3">
        <CognateIcon className="w-5 h-5 text-[color:var(--color-text-muted)]" />
        <span className={`text-sm font-medium text-[color:var(--color-text-muted)]`}>
            {t('compareCognates')}
        </span>
        <label htmlFor="cognate-toggle" className="relative inline-flex items-center cursor-pointer">
            <input 
            type="checkbox" 
            id="cognate-toggle" 
            className="sr-only peer" 
            checked={isCognateComparisonOn} 
            onChange={onToggle}
            disabled={isDisabled}
            aria-label={t('compareCognates')}
            />
            <div className="w-11 h-6 bg-[color:var(--color-surface-solid)] peer-focus:outline-none peer-focus:shadow-[0_0_10px_var(--color-glow)] rounded-full peer border border-[color:var(--color-border)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--color-primary)]"></div>
        </label>
    </div>
  );
};

export default CognateComparisonToggle;
