import React from 'react';
import { UILang } from '../lib/i18n';

interface LanguageSwitcherProps {
  currentLang: UILang;
  onChangeLang: (lang: UILang) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onChangeLang }) => {
  // As per the image, Arabic is first. The order is important for RTL consistency.
  const languages: { code: UILang; label: string; }[] = [
    { code: 'ar', label: 'ع' },
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className="flex flex-col items-center space-y-2">
      {languages.map(lang => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChangeLang(lang.code)}
            className={`font-semibold text-sm transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-[color:var(--color-primary)] flex items-center justify-center h-8 w-8
              ${ isActive
                ? 'bg-[color:var(--color-primary)] text-[color:var(--keyboard-active-button-text)] shadow-lg'
                : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]'
              }`}
            aria-pressed={isActive}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;