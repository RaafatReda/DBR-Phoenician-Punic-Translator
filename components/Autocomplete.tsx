import React from 'react';
import { Language } from '../types';

interface AutocompleteProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  lang: Language;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ suggestions, onSelect, lang }) => {
  if (suggestions.length === 0) {
    return null;
  }

  // FIX: Replaced reference to non-existent 'Language.COPTIC' with 'Language.PHOENICIAN'.
  const isPhoenician = lang === Language.PHOENICIAN;
  const isArabic = lang === Language.ARABIC;

  const fontClass = isPhoenician ? '[font-family:var(--font-phoenician)] text-lg' : 'text-base';
  const dir = isArabic || isPhoenician ? 'rtl' : 'ltr';
  const textAlign = isArabic || isPhoenician ? 'text-right' : 'text-left';

  return (
    <div className="absolute top-full -mt-1 w-full z-20" role="listbox">
      <ul className="bg-[color:var(--color-surface)] border border-white/20 rounded-[var(--border-radius)] shadow-2xl max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <li key={`${suggestion}-${index}`}>
            <button
              onClick={() => onSelect(suggestion)}
              className={`w-full ${textAlign} px-4 py-2 text-[color:var(--color-text)] ${fontClass} hover:bg-white/10 transition-colors duration-150 focus:bg-white/10 focus:outline-none`}
              role="option"
              aria-selected="false"
              dir={dir}
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Autocomplete;
