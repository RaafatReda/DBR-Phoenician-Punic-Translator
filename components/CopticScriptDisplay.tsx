

import React from 'react';
import { TransliterationOutput, TransliterationMode, PhoenicianDialect } from '../types';

interface ScriptDisplayProps {
  result: TransliterationOutput | null;
  mode: TransliterationMode;
  dialect?: PhoenicianDialect;
  t: (key: string) => string;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ result, mode, dialect, t }) => {
  if (!result) return null;

  const isPunic = dialect === PhoenicianDialect.PUNIC;

  if (mode === TransliterationMode.BOTH) {
    return (
      <div className="w-full max-w-5xl mt-8" aria-live="polite">
        <h3 className="text-lg font-semibold text-[color:var(--color-text-muted)] mb-4 text-center">{t('previewTextTitle')}</h3>
        <div className="w-full rounded-lg p-6 min-h-[100px] flex flex-col items-center justify-center papyrus-display">
          <p className={`${isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]'} text-4xl text-center text-[color:var(--color-text)]`} dir="rtl">
            {result.phoenician}
          </p>
          <p className="text-2xl text-center text-[color:var(--color-text-muted)] mt-2">
            {result.latin}
          </p>
          <p className="text-3xl text-center text-[color:var(--color-text)] mt-2" dir="rtl">
            {result.arabic}
          </p>
        </div>
      </div>
    );
  }

  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  // This checks the type and falls back to the phoenician string if it's not a string.
  const key = (mode.toLowerCase()) as keyof TransliterationOutput;
  const value = result[key];
  const text = typeof value === 'string' ? value || result.phoenician : result.phoenician;
  
  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  const isPhoenician = mode === TransliterationMode.PHOENICIAN;
  const isArabic = mode === TransliterationMode.ARABIC;

  let fontClass = 'text-2xl'; // Base size for Latin
  if (isPhoenician) {
    fontClass = `${isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]'} text-4xl`;
  } else if (isArabic) {
    fontClass = 'text-3xl';
  }

  const lang = isPhoenician ? 'phn' : isArabic ? 'ar' : 'en';
  const dir = isPhoenician || isArabic ? 'rtl' : 'ltr';

  return (
    <div className="w-full max-w-5xl mt-8" aria-live="polite">
      <h3 className="text-lg font-semibold text-[color:var(--color-text-muted)] mb-4 text-center">{t('previewTextTitle')}</h3>
      <div
        className="w-full rounded-lg p-6 min-h-[100px] flex items-center justify-center papyrus-display"
      >
        <p
          className={`${fontClass} text-center text-[color:var(--color-text)]`}
          lang={lang}
          dir={dir}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default ScriptDisplay;