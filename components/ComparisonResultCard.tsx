import React, { useState, useEffect } from 'react';
import { TransliterationOutput, TransliterationMode, GrammarToken, PhoenicianDialect } from '../types';
import GrammarHighlightedText from './GrammarHighlightedText';
import GrammarInfoPanel from './GrammarInfoPanel';
import { UILang } from '../lib/i18n';


interface ComparisonResultCardProps {
  dialect: string;
  result: TransliterationOutput;
  mode: TransliterationMode;
  isGrammarHelperOn: boolean;
  t: (key: string) => string;
  uiLang: UILang;
}

const ComparisonResultCard: React.FC<ComparisonResultCardProps> = ({ dialect, result, mode, isGrammarHelperOn, t, uiLang }) => {
  const [selectedToken, setSelectedToken] = useState<GrammarToken | null>(null);

  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const fontClassForPhoenician = isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';

  const key = mode.toLowerCase() as keyof TransliterationOutput;
  const value = result[key];
  const text = typeof value === 'string' ? value || result.phoenician : result.phoenician;
  
  // FIX: Corrected typo in TransliterationMode enum from PHOENician to PHOENICIAN.
  const isPhoenician = mode === TransliterationMode.PHOENICIAN;
  const isArabic = mode === TransliterationMode.ARABIC;

  let fontClass = 'text-xl';
  if (isPhoenician) {
    fontClass = `${fontClassForPhoenician} ${isPunic ? 'text-3xl' : 'text-2xl'}`;
  } else if (isArabic) {
    fontClass = 'text-xl';
  }

  const lang = isPhoenician ? 'phn' : isArabic ? 'ar' : undefined;
  const dir = isPhoenician || isArabic ? 'rtl' : 'ltr';

  const showGrammar = isGrammarHelperOn && result.grammar && result.grammar.length > 0;
  
  const dialectToKey = (dialect: string): string => {
    return dialect === PhoenicianDialect.STANDARD_PHOENICIAN ? 'standardPhoenician' : 'punic';
  };

  useEffect(() => {
    setSelectedToken(null);
  }, [result, mode, isGrammarHelperOn]);

  return (
    <div className="glass-panel p-4 rounded-[var(--border-radius)] flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <h4 className="text-md font-bold text-[color:var(--color-primary)] mb-3 text-center border-b border-[color:var(--color-border)] pb-3 flex-shrink-0">
        {t(dialectToKey(dialect))}
      </h4>
      <div className="flex flex-col justify-center flex-grow min-h-[60px]">
        {showGrammar ? (
           <>
            <div className="flex items-center justify-center py-2" dir={dir}>
                <GrammarHighlightedText
                    grammar={result.grammar!}
                    className={`${fontClassForPhoenician} ${isPunic ? 'text-3xl' : 'text-2xl'} text-center`}
                    selectedToken={selectedToken}
                    onTokenClick={setSelectedToken}
                />
            </div>
            <div className="mt-2 border-t border-[color:var(--color-border)] flex-shrink-0">
                <GrammarInfoPanel token={selectedToken} t={t} uiLang={uiLang} />
            </div>
          </>
        ) : mode === TransliterationMode.BOTH ? (
            <div className="text-center space-y-1">
                <p className={`${fontClassForPhoenician} ${isPunic ? 'text-3xl' : 'text-2xl'}`} dir="rtl">{result.phoenician}</p>
                <p className="text-sm text-[color:var(--color-text-muted)]">{result.latin}</p>
                <p className="text-lg" dir="rtl">{result.arabic}</p>
            </div>
        ) : isPhoenician ? (
            <div className="text-center space-y-2 py-2 flex flex-col justify-center flex-grow">
              <p className={`${fontClassForPhoenician} ${isPunic ? 'text-3xl' : 'text-2xl'}`} dir="rtl">
                  {result.phoenician}
              </p>
              <div className="text-xs text-[color:var(--color-text-muted)] pt-2 border-t border-[color:var(--color-border)]/50 space-y-1">
                  <p className="font-semibold mb-1" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('transliterationSectionTitle')}</p>
                  { (uiLang === 'en' || uiLang === 'fr') && 
                      <p dir="ltr">{result.latin}</p>
                  }
                  { uiLang === 'ar' && 
                      <div className="space-y-1">
                          <p dir="ltr">{result.latin}</p>
                          <p dir="rtl">{result.arabic}</p>
                      </div>
                  }
              </div>
            </div>
        ) : (
          <p className={`${fontClass} text-center text-[color:var(--color-text)]`} lang={lang} dir={dir}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default ComparisonResultCard;