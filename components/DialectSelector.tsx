import React from 'react';
import { PhoenicianDialect } from '../types';

interface DialectSelectorProps {
  selectedDialect: PhoenicianDialect;
  onDialectChange: (dialect: PhoenicianDialect) => void;
  isDisabled: boolean;
  t: (key: string) => string;
}

const DialectSelector: React.FC<DialectSelectorProps> = ({ selectedDialect, onDialectChange, isDisabled, t }) => {
  return (
    <div className="relative w-full">
      <label htmlFor="dialect-select" className="block text-center mb-2 text-sm font-medium text-[color:var(--color-text-muted)]">
        {t('phoenicianDialect')}
      </label>
      <select
        id="dialect-select"
        value={selectedDialect}
        onChange={(e) => onDialectChange(e.target.value as PhoenicianDialect)}
        disabled={isDisabled}
        className="appearance-none w-full bg-transparent border border-[color:var(--color-border)] text-[color:var(--color-text)] text-sm rounded-[var(--border-radius)] focus:shadow-[0_0_15px_var(--color-glow)] focus:outline-none block p-2.5 cursor-pointer"
        aria-label="Select Phoenician dialect"
      >
        {Object.values(PhoenicianDialect).map((dialect) => {
            const key = dialect === PhoenicianDialect.STANDARD_PHOENICIAN ? 'standardPhoenician' : 'punic';
            return (
              <option key={dialect} value={dialect} className="bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)]">
                {t(key)}
              </option>
            );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-3 text-[color:var(--color-text-muted)]">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default DialectSelector;