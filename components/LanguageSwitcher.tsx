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
    <div className="flex items-center space-x-2 px-1">
      {languages.map(lang => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChangeLang(lang.code)}
            className={`font-semibold text-sm transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-yellow-400 flex items-center justify-center h-8
              ${ isActive
                ? 'bg-yellow-400 text-gray-900 shadow-lg w-8'
                : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] w-8'
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
