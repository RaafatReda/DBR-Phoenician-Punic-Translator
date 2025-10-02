import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { UILang } from '../lib/i18n';

interface ManualModalProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
}

const manualSections = [
  {
    titleKey: 'manual_s1_title',
    content: [
      { key: 'manual_s1_item1' },
      { key: 'manual_s1_item2' },
      { key: 'manual_s1_item3' },
    ]
  },
  {
    titleKey: 'manual_s2_title',
    content: [
      { key: 'manual_s2_item1' },
      { key: 'manual_s2_item2' },
      { key: 'manual_s2_item3' },
    ]
  },
  {
    titleKey: 'manual_s3_title',
    content: [
      { key: 'manual_s3_item1' },
      { key: 'manual_s3_item2' },
      { key: 'manual_s3_item3' },
    ]
  },
  {
    titleKey: 'manual_s4_title',
    content: [
      { key: 'manual_s4_item1' },
      { key: 'manual_s4_item2' },
    ]
  },
  {
    titleKey: 'manual_s5_title',
    content: [
      { key: 'manual_s5_item1' },
      { key: 'manual_s5_item2' },
    ]
  },
];


const ManualModal: React.FC<ManualModalProps> = ({ onClose, t, uiLang }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setOpenSection(prev => (prev === index ? null : index));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
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
        
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 text-[color:var(--color-text)]">
          <p className="text-center mb-6 text-[color:var(--color-text-muted)]" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('manualWelcomeSub')}</p>
          
          <div className="space-y-4">
            {manualSections.map((section, index) => (
              <div key={index} className="manual-accordion-item">
                <button
                  className="manual-accordion-header"
                  onClick={() => toggleSection(index)}
                  aria-expanded={openSection === index}
                >
                  <span>{t(section.titleKey)}</span>
                  <ChevronDownIcon className={`manual-chevron w-5 h-5 transition-transform ${openSection === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`manual-accordion-content ${openSection === index ? 'open' : ''}`}>
                  <div className="manual-accordion-content-inner">
                    <ul dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                      {section.content.map(item => (
                        <li key={item.key} dangerouslySetInnerHTML={{ __html: t(item.key) }} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};

export default ManualModal;