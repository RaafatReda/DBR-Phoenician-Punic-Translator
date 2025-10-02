import React from 'react';
import { TransliterationOutput } from '../types';

interface CognateDisplayProps {
  result: TransliterationOutput;
  t: (key: string) => string;
}

const CognateDisplay: React.FC<CognateDisplayProps> = ({ result, t }) => {
  if (!result.hebrewCognate && !result.arabicCognate && !result.aramaicCognate) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mt-6">
      <div className="papyrus-display rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.hebrewCognate && (
          <div className="text-center">
            <h4 className="text-sm font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2">{t('hebrewCognate')} ✡️</h4>
            <p lang="he" dir="rtl" className="text-2xl text-[color:var(--color-text)]" style={{ fontFamily: "'Noto Sans Hebrew', sans-serif" }}>
              {result.hebrewCognate.script}
            </p>
            <p className="text-sm text-[color:var(--color-text-muted)] mt-1 italic">
              {result.hebrewCognate.latin}
            </p>
          </div>
        )}
        {result.arabicCognate && (
          <div className="text-center">
            <h4 className="text-sm font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2">{t('arabicCognate')} 🇸🇦</h4>
            <p lang="ar" dir="rtl" className="text-2xl text-[color:var(--color-text)]" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              {result.arabicCognate.script}
            </p>
            <p className="text-sm text-[color:var(--color-text-muted)] mt-1 italic">
              {result.arabicCognate.latin}
            </p>
          </div>
        )}
        {result.aramaicCognate && (
          <div className="text-center">
            <h4 className="text-sm font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2">{t('aramaicCognate')} 🇸🇾</h4>
            <p lang="syr" dir="rtl" className="text-2xl text-[color:var(--color-text)]" style={{ fontFamily: "'Noto Sans Syriac Eastern', sans-serif" }}>
              {result.aramaicCognate.script}
            </p>
            <p className="text-sm text-[color:var(--color-text-muted)] mt-1 italic">
              {result.aramaicCognate.latin}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CognateDisplay;