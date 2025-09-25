import React, { useState } from 'react';
import { TransliterationOutput, Language, AIAssistantResponse } from '../types';
import { getTranslationCorrection } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import CloseIcon from './icons/CloseIcon';
import Loader from './Loader';
import SendIcon from './icons/SendIcon';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newTranslation: TransliterationOutput) => void;
  sourceText: string;
  sourceLang: Language;
  originalTranslation: TransliterationOutput;
  t: (key: string) => string;
  uiLang: UILang;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onApply,
  sourceText,
  sourceLang,
  originalTranslation,
  t,
  uiLang,
}) => {
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<AIAssistantResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    setIsLoading(true);
    setError(null);
    setAssistantResponse(null);

    try {
      const response = await getTranslationCorrection(
        sourceText,
        sourceLang,
        originalTranslation,
        request,
        uiLang
      );
      setAssistantResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('aiAssistantError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    if (assistantResponse) {
      onApply(assistantResponse.improvedTranslation);
    }
  };

  if (!isOpen) return null;
  
  const punicFont = originalTranslation.phoenician.length > 0 ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
    >
      <div
        className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
          <div>
            <h2 id="assistant-title" className="text-xl font-semibold text-[color:var(--color-primary)]">{t('aiAssistantHeader')}</h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">{t('aiAssistantSubheader')}</p>
          </div>
          <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('close')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-[color:var(--color-text-muted)]">{t('aiAssistantSource')}</label>
            <p className="mt-1 p-2 bg-black/20 rounded-md text-sm">{sourceText}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-[color:var(--color-text-muted)]">{t('aiAssistantOriginal')}</label>
            <p className={`mt-1 p-2 bg-black/20 rounded-md text-lg text-right ${punicFont}`} dir="rtl">{originalTranslation.phoenician}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={t('aiAssistantRequestPlaceholder')}
              className="w-full h-24 p-2 bg-transparent border border-[color:var(--color-border)] rounded-md focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)] resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !request.trim()}
              className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)] disabled:opacity-50 transition-all hover:shadow-[0_0_10px_var(--color-glow)]"
            >
              {isLoading ? <><Loader className="w-5 h-5 mr-2" /> {t('aiAssistantGettingResponse')}</> : <>{t('aiAssistantGetResponse')}</>}
            </button>
          </form>

          {error && <div className="p-3 text-center bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">{error}</div>}

          {assistantResponse && (
            <div className="space-y-4 pt-4 border-t border-[color:var(--color-border)]">
              <div>
                <label className="text-sm font-semibold text-green-400">{t('aiAssistantImproved')}</label>
                <p className={`mt-1 p-2 bg-green-500/10 rounded-md text-lg text-right ${punicFont}`} dir="rtl">{assistantResponse.improvedTranslation.phoenician}</p>
              </div>
               <div>
                <label className="text-sm font-semibold text-cyan-400">{t('aiAssistantExplanation')}</label>
                <p className="mt-1 p-2 bg-cyan-500/10 rounded-md text-sm">{assistantResponse.explanation}</p>
              </div>
            </div>
          )}
        </main>
        
        {assistantResponse && (
          <footer className="p-4 border-t border-[color:var(--color-border)] flex-shrink-0 flex justify-end items-center space-x-4">
            <button onClick={onClose} className="px-6 py-2 font-semibold text-[color:var(--color-text)] bg-transparent border-2 border-[color:var(--color-border)] rounded-lg hover:bg-white/10 transition-colors">
              {t('close')}
            </button>
            <button onClick={handleApply} className="px-6 py-2.5 font-semibold text-black bg-green-400 rounded-lg hover:bg-green-300 transition-colors">
              {t('aiAssistantApply')}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default AIAssistantModal;
