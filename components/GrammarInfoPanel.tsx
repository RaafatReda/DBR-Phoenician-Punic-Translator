import React from 'react';
import { GrammarToken } from '../types';
import { UILang } from '../lib/i18n';

interface GrammarInfoPanelProps {
  token: GrammarToken | null;
  t: (key: string) => string;
  uiLang: UILang;
}

const GrammarInfoPanel: React.FC<GrammarInfoPanelProps> = ({ token, t, uiLang }) => {
  if (!token) {
    return (
      <div className="p-3 text-center text-sm text-[color:var(--color-text-muted)]">
        <p>{t('grammarPanelHint')}</p>
      </div>
    );
  }

  const description = token.description[uiLang] || token.description.en;

  return (
    <div className="p-3 text-sm text-[color:var(--color-text)]">
      <p className="[font-family:var(--font-phoenician)] text-lg text-[color:var(--color-primary)] mb-1 text-right" dir="rtl">{token.token}</p>
      <p>
        <strong className="text-[color:var(--color-text-muted)]">{t('grammarType')}</strong>{' '}
        <span className="font-semibold capitalize">{t(token.type.toLowerCase()) || token.type}</span>
      </p>
      <p dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <strong className="text-[color:var(--color-text-muted)]">{t('grammarDescription')}</strong> {description}
      </p>
    </div>
  );
};

export default GrammarInfoPanel;