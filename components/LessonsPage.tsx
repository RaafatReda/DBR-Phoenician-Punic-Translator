import React, { useState } from 'react';
import { PhoenicianDialect } from '../types';
import { UILang } from '../lib/i18n';
import CloseIcon from './icons/CloseIcon';
import DialectSelector from './DialectSelector';
import { alphabetData } from '../lib/alphabetData';

interface LessonsPageProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
}

const LessonsPage: React.FC<LessonsPageProps> = ({ onClose, t, uiLang }) => {
    const [selectedDialect, setSelectedDialect] = useState<PhoenicianDialect>(PhoenicianDialect.STANDARD_PHOENICIAN);
    const [activeTab, setActiveTab] = useState<'alphabet' | 'grammar'>('alphabet');

    const fontClass = selectedDialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
    const fontSizeClass = selectedDialect === PhoenicianDialect.PUNIC ? 'text-7xl' : 'text-6xl';

    const tabButtonClass = (isActive: boolean) => 
        `px-6 py-2.5 text-sm font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-[color:var(--color-primary)] ${
            isActive
                ? 'bg-[color:var(--color-primary)] text-[color:var(--keyboard-active-button-text)]'
                : 'text-[color:var(--color-text-muted)] hover:bg-white/10'
        }`;
        
    const getGrammarContent = () => {
        const key = selectedDialect === PhoenicianDialect.PUNIC ? 'grammarContentPunicHtml' : 'grammarContentPhoenicianHtml';
        return t(key);
    };

    const renderAlphabet = () => (
        <div className="animate-text-glow-fade-in" style={{animationDuration: '0.5s'}}>
            <p className="text-center mb-6 text-[color:var(--color-text-muted)]" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('alphabetIntro')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {alphabetData.map(letter => (
                    <div key={letter.char} className="papyrus-display rounded-lg p-4 flex flex-col items-center justify-center aspect-square transition-transform hover:scale-105">
                        <div className={`${fontClass} ${fontSizeClass} text-[color:var(--color-primary)]`}>{letter.char}</div>
                        <div className="font-bold text-lg">{t(letter.nameKey)} ({letter.translit})</div>
                        <div className="text-sm text-[color:var(--color-text-muted)] capitalize">{t(letter.meaningKey)}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderGrammar = () => (
        <div className="prose max-w-none animate-text-glow-fade-in" style={{animationDuration: '0.5s'}} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div dangerouslySetInnerHTML={{ __html: getGrammarContent() }} />
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lessons-title"
        >
            <div
                className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                    <h2 id="lessons-title" className="text-xl font-semibold text-[color:var(--color-primary)]">{t('lessonsHeader')}</h2>
                    <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('lessonsClose')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-4 flex-shrink-0 border-b border-[color:var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-64">
                         <DialectSelector
                            selectedDialect={selectedDialect}
                            onDialectChange={setSelectedDialect}
                            isDisabled={false}
                            t={t}
                        />
                    </div>
                    <div className="flex items-center justify-center space-x-2 bg-[color:var(--keyboard-panel-bg)] p-1 rounded-lg">
                        <button onClick={() => setActiveTab('alphabet')} className={tabButtonClass(activeTab === 'alphabet')} aria-pressed={activeTab === 'alphabet'}>
                            {t('alphabetTab')}
                        </button>
                        <button onClick={() => setActiveTab('grammar')} className={tabButtonClass(activeTab === 'grammar')} aria-pressed={activeTab === 'grammar'}>
                            {t('grammarTab')}
                        </button>
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-6">
                    {activeTab === 'alphabet' ? renderAlphabet() : renderGrammar()}
                </main>
            </div>
        </div>
    );
};

export default LessonsPage;