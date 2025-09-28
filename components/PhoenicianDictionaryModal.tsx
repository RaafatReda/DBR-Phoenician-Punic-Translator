
import React, { useState, useMemo, useRef } from 'react';
import { phoenicianGlossary } from '../lib/phoenicianGlossary';
import CloseIcon from './icons/CloseIcon';
import SearchIcon from './icons/SearchIcon';
import { UILang } from '../lib/i18n';
import { PhoenicianDialect, GlossaryEntry } from '../types';
import ScriptModeToggle from './ScriptModeToggle';
import { generateGlossaryHtmlForPdf } from '../lib/exportUtils';
import PdfIcon from './icons/PdfIcon';

interface PhoenicianDictionaryModalProps {
  onClose: () => void;
  onWordSelect: (word: string) => void;
  t: (key: string) => string;
}

const phoenicianAlphabet = ['𐤀', '𐤁', '𐤂', '𐤃', '𐤄', '𐤅', '𐤆', '𐤇', '𐤈', '𐤉', '𐤊', '𐤋', '𐤌', '𐤍', '𐤎', '𐤏', '𐤐', '𐤑', '𐤒', '𐤓', '𐤔', '𐤕'];

type GlossaryLang = 'en' | 'fr' | 'ar';

const PhoenicianDictionaryModal: React.FC<PhoenicianDictionaryModalProps> = ({ onClose, onWordSelect, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GlossaryEntry['category'] | null>(null);
  const [glossaryLang, setGlossaryLang] = useState<GlossaryLang>('en');
  const [scriptMode, setScriptMode] = useState<PhoenicianDialect>(PhoenicianDialect.STANDARD_PHOENICIAN);
  const listRef = useRef<HTMLUListElement>(null);
  
  const currentUiLang: UILang = (localStorage.getItem('dbr-translator-lang') as UILang) || 'en';

  const filteredDictionary = useMemo(() => {
    let results = phoenicianGlossary;

    if (selectedLetter) {
      results = results.filter(entry => entry.phoenician.startsWith(selectedLetter));
    }
    
    if (selectedCategory) {
      results = results.filter(entry => entry.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(entry =>
        entry.phoenician.includes(searchTerm) ||
        entry.latin.toLowerCase().includes(lowercasedTerm) ||
        (entry.meaning[glossaryLang] && entry.meaning[glossaryLang].toLowerCase().includes(lowercasedTerm))
      );
    }
    
    return results;
  }, [searchTerm, selectedLetter, selectedCategory, glossaryLang]);

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(prev => (prev === letter ? null : letter));
    listRef.current?.scrollTo(0, 0);
  };
  
  const handleCategorySelect = (category: GlossaryEntry['category']) => {
    setSelectedCategory(prev => (prev === category ? null : category));
    listRef.current?.scrollTo(0, 0);
  };

  const handleClearFilters = () => {
    setSelectedLetter(null);
    setSelectedCategory(null);
    listRef.current?.scrollTo(0, 0);
  };


  const handleWordClick = (word: string) => {
    onWordSelect(word);
    onClose();
  };
  
  const handleExportPdf = () => {
    const htmlContent = generateGlossaryHtmlForPdf(filteredDictionary, currentUiLang, scriptMode, t);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const langButtonClass = (lang: GlossaryLang) => 
    `px-4 py-1.5 text-sm rounded-md font-semibold transition-colors ${glossaryLang === lang ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`;

  const getSearchPlaceholder = (): string => {
    if (glossaryLang === 'fr') return t('dictionarySearch_fr');
    if (glossaryLang === 'ar') return t('dictionarySearch_ar');
    return t('dictionarySearch');
  }

  const scriptFontClass = scriptMode === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';


  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dictionary-title"
    >
      <div
        className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={currentUiLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
          <h2 id="dictionary-title" className="text-xl font-semibold text-[color:var(--color-primary)]">{t('dictionaryHeader')}</h2>
          <div className="flex items-center space-x-2">
            <ScriptModeToggle scriptMode={scriptMode} setScriptMode={setScriptMode} t={t} />
             <button
              onClick={handleExportPdf}
              disabled={filteredDictionary.length === 0}
              className="p-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-colors disabled:opacity-50"
              aria-label={t('exportPdf')}
              title={t('exportPdf')}
            >
              <PdfIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('dictionaryClose')}>
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="p-4 flex-shrink-0 border-b border-[color:var(--color-border)] space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[color:var(--color-bg-end)] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)]"
              autoFocus
              dir={glossaryLang === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className={`absolute top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none ${currentUiLang === 'ar' ? 'right-3' : 'left-3'}`}>
              <SearchIcon className="w-5 h-5" />
            </div>
          </div>
          
           <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <button onClick={() => setGlossaryLang('en')} className={langButtonClass('en')} aria-pressed={glossaryLang === 'en'}>{t('english')}</button>
                    <button onClick={() => setGlossaryLang('fr')} className={langButtonClass('fr')} aria-pressed={glossaryLang === 'fr'}>{t('french')}</button>
                    <button onClick={() => setGlossaryLang('ar')} className={`${langButtonClass('ar')} text-base`} aria-pressed={glossaryLang === 'ar'}>{t('arabic')}</button>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleCategorySelect('theonym')} className={`${langButtonClass('en')} ${selectedCategory === 'theonym' ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`} aria-pressed={selectedCategory === 'theonym'}>{t('theonyms')}</button>
                    <button onClick={() => handleCategorySelect('personal_name')} className={`${langButtonClass('en')} ${selectedCategory === 'personal_name' ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`} aria-pressed={selectedCategory === 'personal_name'}>{t('personalNames')}</button>
                    <button onClick={() => handleCategorySelect('location')} className={`${langButtonClass('en')} ${selectedCategory === 'location' ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`} aria-pressed={selectedCategory === 'location'}>{t('locationNames')}</button>
                 </div>
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            <button
              onClick={handleClearFilters}
              className={`px-3 py-1 text-sm rounded-md font-semibold transition-colors ${!selectedLetter && !selectedCategory ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`}
              aria-pressed={!selectedLetter && !selectedCategory}
            >
              {t('dictionaryAll')}
            </button>
            {phoenicianAlphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterSelect(letter)}
                className={`px-3 py-1 rounded-md ${scriptFontClass} ${scriptMode === PhoenicianDialect.PUNIC ? 'text-xl' : 'text-lg'} transition-colors ${selectedLetter === letter ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`}
                aria-pressed={selectedLetter === letter}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 flex-shrink-0 border-b border-[color:var(--color-border)] text-sm text-[color:var(--color-text-muted)]">
          {`${filteredDictionary.length.toLocaleString()} ${t('dictionaryFound')} ${phoenicianGlossary.length.toLocaleString()} ${t('dictionaryTotal')}`}
        </div>

        <main className="flex-grow overflow-y-auto">
          {filteredDictionary.length === 0 ? (
            <div className="text-center text-[color:var(--color-text-muted)] py-16">
              <p className="text-lg font-semibold">{t('dictionaryNone')}</p>
              <p className="text-sm">{t('dictionaryNoneSub')}</p>
            </div>
          ) : (
            <ul ref={listRef} className="divide-y divide-[color:var(--color-border)]">
              {filteredDictionary.map((entry, index) => (
                <li key={`${entry.phoenician}-${index}`}>
                  <button
                    onClick={() => handleWordClick(entry.phoenician)}
                    className="w-full text-left p-4 hover:bg-[color:var(--color-primary)]/10 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="w-full sm:w-1/3 flex items-baseline gap-4" dir="rtl">
                      <p className={`${scriptFontClass} ${scriptMode === PhoenicianDialect.PUNIC ? 'text-4xl' : 'text-3xl'} text-[color:var(--color-primary)]`}>{entry.phoenician}</p>
                      <p className="text-base text-[color:var(--color-text-muted)] italic" dir="ltr">{entry.latin}</p>
                    </div>
                    <p 
                      className="w-full sm:w-2/3 sm:text-right text-[color:var(--color-text)] capitalize"
                      dir={glossaryLang === 'ar' ? 'rtl' : 'ltr'}
                      lang={glossaryLang}
                      >
                      {entry.meaning[glossaryLang]}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default PhoenicianDictionaryModal;
