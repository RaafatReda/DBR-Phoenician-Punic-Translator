import React, { useState } from 'react';
import { PhoenicianDialect } from '../types';
import { UILang } from '../lib/i18n';
import CloseIcon from './icons/CloseIcon';
import DialectSelector from './DialectSelector';
import { alphabetData } from '../lib/alphabetData';
import GrammarModule from './GrammarModule';
import PdfIcon from './icons/PdfIcon';
import { generateGrammarHtmlForPdf } from '../lib/exportUtils';
import { grammarPhoenicianLevels, grammarPunicLevels, GrammarLevelData } from '../lib/lessons/structure';

interface LessonsPageProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
  onLetterSelect: (letter: string) => void;
}

const pronunciationTableData = [
    { char: '𐤀', name: 'ʾAleph', translit: 'ʾ', ipa: 'ʔ, ʔa', arabic: 'أ (همزة قطع)' },
    { char: '𐤁', name: 'Bet', translit: 'b', ipa: 'b', arabic: 'ب' },
    { char: '𐤂', name: 'Gimel', translit: 'g', ipa: 'ɡ', arabic: 'جيم مصرية / غ' },
    { char: '𐤃', name: 'Dalet', translit: 'd', ipa: 'd', arabic: 'د' },
    { char: '𐤄', name: 'He', translit: 'h', ipa: 'h', arabic: 'هـ' },
    { char: '𐤅', name: 'Waw', translit: 'w', ipa: 'w, u, o', arabic: 'و' },
    { char: '𐤆', name: 'Zayin', translit: 'z', ipa: 'z', arabic: 'ز' },
    { char: '𐤇', name: 'Ḥet', translit: 'ḥ', ipa: 'ħ', arabic: 'ح (عميقة)' },
    { char: '𐤈', name: 'Ṭet', translit: 'ṭ', ipa: 'tˤ', arabic: 'ط (مفخمة)' },
    { char: '𐤉', name: 'Yod', translit: 'y', ipa: 'j, i', arabic: 'ي' },
    { char: '𐤊', name: 'Kaph', translit: 'k', ipa: 'k', arabic: 'ك' },
    { char: '𐤋', name: 'Lamed', translit: 'l', ipa: 'l', arabic: 'ل' },
    { char: '𐤌', name: 'Mem', translit: 'm', ipa: 'm', arabic: 'م' },
    { char: '𐤍', name: 'Nun', translit: 'n', ipa: 'n', arabic: 'ن' },
    { char: '𐤎', name: 'Samekh', translit: 's', ipa: 's', arabic: 'س' },
    { char: '𐤏', name: 'ʿAyin', translit: 'ʿ', ipa: 'ʕ', arabic: 'ع' },
    { char: '𐤐', name: 'Pe', translit: 'p', ipa: 'p', arabic: 'پ (أو فاء في البونيقية)' },
    { char: '𐤑', name: 'Ṣade', translit: 'ṣ', ipa: 'sˤ', arabic: 'ص' },
    { char: '𐤒', name: 'Qoph', translit: 'q', ipa: 'q', arabic: 'ق (عميقة)' },
    { char: '𐤓', name: 'Resh', translit: 'r', ipa: 'r', arabic: 'ر' },
    { char: '𐤔', name: 'Shin', translit: 'š', ipa: 'ʃ', arabic: 'ش' },
    { char: '𐤕', name: 'Taw', translit: 't', ipa: 't', arabic: 'ت' },
  ];

const LessonsPage: React.FC<LessonsPageProps> = ({ onClose, t, uiLang, onLetterSelect }) => {
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

    const handleExportPdf = () => {
        const levels: GrammarLevelData[] = selectedDialect === PhoenicianDialect.PUNIC ? grammarPunicLevels : grammarPhoenicianLevels;
        const htmlContent = generateGrammarHtmlForPdf(levels, selectedDialect, uiLang, t);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500); // Timeout to ensure content is loaded
        }
    };


    const renderAlphabet = () => (
        <div className="animate-text-glow-fade-in" style={{animationDuration: '0.5s'}}>
            <p className="text-center mb-6 text-[color:var(--color-text-muted)]" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('alphabetIntro')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {alphabetData.map(letter => (
                    <button 
                        key={letter.char}
                        onClick={() => onLetterSelect(letter.char)}
                        title={`${t('dictionaryTitle')}: ${t(letter.nameKey)}`}
                        className="papyrus-display rounded-lg p-4 flex flex-col items-center justify-center aspect-square transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[color:var(--color-bg-start)] focus:ring-[color:var(--color-primary)] text-center"
                    >
                        <div className={`${fontClass} ${fontSizeClass} text-[color:var(--color-primary)]`}>{letter.char}</div>
                        <div className="font-bold text-lg text-[color:var(--color-text)]">{t(letter.nameKey)} ({letter.translit})</div>
                        <div className="text-sm text-[color:var(--color-text-muted)] capitalize">{t(letter.meaningKey)}</div>
                    </button>
                ))}
            </div>
            <div className="prose max-w-none mt-12" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                <h3>{t('pronunciationGuideTitle')}</h3>
                <p>{t('pronunciationGuideIntro')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>{selectedDialect === PhoenicianDialect.PUNIC ? t('punicLetter') : t('phoenicianLetter')}</th>
                            <th>{t('letterName')}</th>
                            <th>{t('latinTransliteration')}</th>
                            <th>{t('ipaPronunciation')}</th>
                            <th>{t('suggestedArabic')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pronunciationTableData.map(item => (
                            <tr key={item.char}>
                                <td className="p-0">
                                    <button
                                        onClick={() => onLetterSelect(item.char)}
                                        className={`${fontClass} text-2xl text-center w-full h-full p-2 rounded-md hover:bg-[color:var(--color-primary)]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]`}
                                        aria-label={`${t('dictionaryTitle')}: ${item.name}`}
                                    >
                                        {item.char}
                                    </button>
                                </td>
                                <td>{item.name}</td>
                                <td className="text-center"><code>{item.translit}</code></td>
                                <td className="text-center"><code>{item.ipa}</code></td>
                                <td dir="rtl">{item.arabic}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h3>{t('punicDifferencesTitle')}</h3>
                <ul>
                  <li dangerouslySetInnerHTML={{ __html: t('punicDifferences1') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('punicDifferences2') }} />
                </ul>
            </div>
        </div>
    );

    const renderGrammar = () => {
        const levels: GrammarLevelData[] = selectedDialect === PhoenicianDialect.PUNIC ? grammarPunicLevels : grammarPhoenicianLevels;
        
        return (
             <div className="animate-text-glow-fade-in" style={{animationDuration: '0.5s'}}>
                {levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="mb-8">
                        <h2 className="text-2xl font-bold text-center text-[color:var(--color-primary)] mb-6 border-b-2 border-[color:var(--color-primary)]/30 pb-2 [font-family:var(--font-serif)]">{t(level.levelTitleKey)}</h2>
                        {level.modules.map((module, moduleIndex) => (
                            <GrammarModule
                                key={moduleIndex}
                                title={t(module.moduleTitleKey)}
                                content={t(module.moduleContentKey)}
                                uiLang={uiLang}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

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
                    <div className="w-full sm:w-64 flex justify-start">
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
                    <div className="w-full sm:w-64 flex justify-center sm:justify-end">
                        <button
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-transparent border border-[color:var(--color-border)] text-[color:var(--color-primary)] hover:bg-white/10"
                            aria-label={t('exportPdf')}
                            title={t('exportPdf')}
                        >
                            <PdfIcon className="w-4 h-4" />
                            <span>{t('exportPdf')}</span>
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