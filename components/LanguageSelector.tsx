import React from 'react';
import { Language } from '../types';
import SwapIcon from './icons/SwapIcon';
import { getFlagForLanguage } from '../lib/languageUtils';

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceLangChange: (lang: Language) => void;
  onTargetLangChange: (lang: Language) => void;
  onSwap: () => void;
  isLoading: boolean;
  t: (key: string) => string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  onSwap,
  isLoading,
  t,
}) => {
  const availableLanguages = [
    Language.ENGLISH, 
    Language.PHOENICIAN, 
    Language.PUNIC,
    Language.ARABIC, 
    Language.FRENCH,
    Language.SPANISH,
    Language.ITALIAN,
    Language.CHINESE,
    Language.JAPANESE,
    Language.TURKISH,
    Language.GREEK,
    Language.GERMAN,
  ];

  const langToKey = (lang: Language): string => lang.toLowerCase();

  const selectContainerStyles = 'w-2/5 relative';
  const selectStyles =
    'w-full text-lg font-semibold text-[color:var(--color-text)] bg-transparent border border-[color:var(--color-border)] rounded-[var(--border-radius)] p-3 focus:outline-none focus:shadow-[0_0_15px_var(--color-glow)] appearance-none text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';

  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4">
      <div className={selectContainerStyles}>
        <select
          value={sourceLang}
          onChange={(e) => onSourceLangChange(e.target.value as Language)}
          disabled={isLoading}
          className={selectStyles}
          aria-label="Select source language"
        >
          {availableLanguages.map((lang) => (
            <option key={`source-${lang}`} value={lang} className="bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)]">
              {getFlagForLanguage(lang)} {t(langToKey(lang))}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[color:var(--color-text-muted)]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <div className="w-1/5 flex justify-center">
        <button
          onClick={onSwap}
          disabled={isLoading}
          className="p-3 rounded-full glass-panel text-[color:var(--color-primary)] hover:shadow-[0_0_15px_var(--color-glow)] focus:outline-none active:rotate-180 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          aria-label="Swap languages"
        >
          <SwapIcon className="w-5 h-5" />
        </button>
      </div>
      <div className={selectContainerStyles}>
        <select
          value={targetLang}
          onChange={(e) => onTargetLangChange(e.target.value as Language)}
          disabled={isLoading}
          className={selectStyles}
          aria-label="Select target language"
        >
          {availableLanguages.map((lang) => (
            <option key={`target-${lang}`} value={lang} className="bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)]">
              {getFlagForLanguage(lang)} {t(langToKey(lang))}
            </option>
          ))}
        </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[color:var(--color-text-muted)]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;