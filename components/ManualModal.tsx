import React from 'react';
import CloseIcon from './icons/CloseIcon';
import { UILang } from '../lib/i18n';

interface ManualModalProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
}

const ManualModal: React.FC<ManualModalProps> = ({ onClose, t, uiLang }) => {

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-title"
    >
      <div 
        className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
          <h2 id="manual-title" className="text-xl font-semibold text-[color:var(--color-primary)]">
            {t('manualWelcomeTitle')}
          </h2>
          <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('manualClose')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6 text-[color:var(--color-text)]">
          <p className="text-center mb-6 text-[color:var(--color-text-muted)]" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('manualWelcomeSub')}</p>
          <div className="space-y-6" lang={uiLang} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Section 1 */}
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manualS1Title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li dangerouslySetInnerHTML={{ __html: t('manualS1L1') }} />
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('manualS1L2') }} />
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('manualS1L2_1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS1L2_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS1L2_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS1L2_4') }} />
                  </ul>
                </li>
                <li dangerouslySetInnerHTML={{ __html: t('manualS1L3') }} />
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manualS2Title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('manualS2L1') }} />
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L1_1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L1_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L1_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L1_4') }} />
                  </ul>
                </li>
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('manualS2L2') }} />
                   <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L2_1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L2_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS2L2_3') }} />
                  </ul>
                </li>
              </ul>
            </div>
            
            {/* Section 3 */}
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manualS3Title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('manualS3L1') }} />
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('manualS3L1_1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS3L1_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS3L1_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS3L1_4') }} />
                  </ul>
                </li>
                <li dangerouslySetInnerHTML={{ __html: t('manualS3L2') }} />
              </ul>
            </div>
            
            {/* Section 4 */}
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manualS4Title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span dangerouslySetInnerHTML={{ __html: t('manualS4L1') }} />
                  <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li dangerouslySetInnerHTML={{ __html: t('manualS4L1_1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS4L1_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('manualS4L1_3') }} />
                  </ul>
                </li>
                <li dangerouslySetInnerHTML={{ __html: t('manualS4L2') }} />
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManualModal;