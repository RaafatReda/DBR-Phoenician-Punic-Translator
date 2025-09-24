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
            {t('manualHeader')}
          </h2>
          <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('manualClose')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6 text-[color:var(--color-text)]">
           <div className="space-y-6" lang={uiLang} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manual1Title')}</h3>
              <p className="mb-2 text-sm text-[color:var(--color-text-muted)]">{t('manual1Sub')}</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{t('manual1L1')}</li>
                <li>{t('manual1L2')}</li>
                <ul className="list-['-_'] list-inside ml-6 mt-1 space-y-1">
                    <li>{t('manual1L2_1')}</li>
                    <li>{t('manual1L2_2')}</li>
                    <li>{t('manual1L2_3')}</li>
                    <li>{t('manual1L2_4')}</li>
                </ul>
                <li>{t('manual1L3')}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manual2Title')}</h3>
              <p className="mb-2 text-sm text-[color:var(--color-text-muted)]">{t('manual2Sub')}</p>
               <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('manual2L1')}</li>
                  <li>{t('manual2L2')}</li>
                  <li>{t('manual2L3')}</li>
               </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manual3Title')}</h3>
               <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('manual3L1')}</li>
                  <li>{t('manual3L2')}</li>
                  <li>{t('manual3L3')}</li>
               </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[color:var(--color-secondary)] mb-2">{t('manual4Title')}</h3>
               <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('manual4L1')}</li>
                  <li>{t('manual4L2')}</li>
                  <li>{t('manual4L3')}</li>
                  <li>{t('manual4L4')}</li>
                  <li>{t('manual4L5')}</li>
               </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManualModal;