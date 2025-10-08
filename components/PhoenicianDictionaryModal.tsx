import React, { useState, useMemo, useRef, useEffect } from 'react';
import { phoenicianGlossary } from '../lib/phoenicianGlossary';
import CloseIcon from './icons/CloseIcon';
import SearchIcon from './icons/SearchIcon';
import { UILang } from '../lib/i18n';
import { PhoenicianDialect, GlossaryEntry, Language, PhoenicianWordDetails, GlossaryLang } from '../types';
import ScriptModeToggle from './ScriptModeToggle';
import { generateGlossaryHtmlForPdf } from '../lib/exportUtils';
import PdfIcon from './icons/PdfIcon';
import Keyboard from './Keyboard';
import KeyboardIcon from './icons/KeyboardIcon';
import WordDetailModal from './WordDetailModal';
import { translateGlossaryBatch } from '../services/geminiService';
import Loader from './Loader';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface PhoenicianDictionaryModalProps {
  onClose: () => void;
  onWordSelect: (word: string) => void;
  onSaveSentence: (details: PhoenicianWordDetails) => void;
  t: (key: string) => string;
  speak: (text: string, lang: string) => void;
  isSpeaking: boolean;
  initialLetterFilter?: string | null;
}

const phoenicianAlphabet = ['𐤀', '𐤁', '𐤂', '𐤃', '𐤄', '𐤅', '𐤆', '𐤇', '𐤈', '𐤉', '𐤊', '𐤋', '𐤌', '𐤍', '𐤎', '𐤏', '𐤐', '𐤑', '𐤒', '𐤓', '𐤔', '𐤕'];

type SearchMode = 'start' | 'middle' | 'end';

const PhoenicianDictionaryModal: React.FC<PhoenicianDictionaryModalProps> = ({ onClose, onWordSelect, onSaveSentence, t, speak, isSpeaking, initialLetterFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('middle');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(initialLetterFilter || null);
  const [selectedCategory, setSelectedCategory] = useState<GlossaryEntry['category'] | null>(null);
  const [glossaryLang, setGlossaryLang] = useState<GlossaryLang>('en');
  const [scriptMode, setScriptMode] = useState<PhoenicianDialect>(PhoenicianDialect.STANDARD_PHOENICIAN);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [selectedEntry, setSelectedEntry] = useState<GlossaryEntry | null>(null);

  const [dictionary, setDictionary] = useState<GlossaryEntry[]>(phoenicianGlossary);
  const [translatedLangs, setTranslatedLangs] = useState(new Set(['en', 'fr', 'ar']));
  const [isTranslating, setIsTranslating] = useState(false);
  
  const currentUiLang: UILang = (localStorage.getItem('dbr-translator-lang') as UILang) || 'en';

  const handleGlossaryLangChange = async (lang: GlossaryLang) => {
    setGlossaryLang(lang);
    if (translatedLangs.has(lang)) {
      return; // Already translated
    }

    setIsTranslating(true);
    try {
      const termsToTranslate = dictionary.map(entry => entry.meaning.en);
      const translations = await translateGlossaryBatch(termsToTranslate, lang);
      
      const newDictionary = dictionary.map((entry, index) => ({
        ...entry,
        meaning: {
          ...entry.meaning,
          [lang]: translations[index],
        }
      }));
      
      setDictionary(newDictionary);
      setTranslatedLangs(prev => new Set(prev).add(lang));

    } catch (e) {
      console.error(e);
      // Optional: show an error toast to the user
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredDictionary = useMemo(() => {
    let results = dictionary;

    if (selectedLetter) {
      results = results.filter(entry => entry.phoenician.startsWith(selectedLetter));
    }
    
    if (selectedCategory) {
      results = results.filter(entry => entry.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();

      const check = (textToSearch: string, term: string) => {
        if (!textToSearch) return false;
        const lowerText = textToSearch.toLowerCase();
        switch (searchMode) {
          case 'start':
            return lowerText.startsWith(term);
          case 'end':
            return lowerText.endsWith(term);
          case 'middle':
          default:
            return lowerText.includes(term);
        }
      };
      
      const checkPhoenician = (textToSearch: string, term: string) => {
        switch (searchMode) {
          case 'start':
            return textToSearch.startsWith(term);
          case 'end':
            return textToSearch.endsWith(term);
          case 'middle':
          default:
            return textToSearch.includes(term);
        }
      };

      results = results.filter(entry =>
        checkPhoenician(entry.phoenician, searchTerm) ||
        check(entry.latin, lowercasedTerm) ||
        (entry.meaning[glossaryLang] && check(entry.meaning[glossaryLang]!, lowercasedTerm))
      );
    }
    
    return results;
  }, [searchTerm, searchMode, selectedLetter, selectedCategory, glossaryLang, dictionary]);
  
  useEffect(() => {
    listRef.current?.scrollTo(0, 0);
  }, [selectedLetter, selectedCategory, searchTerm, searchMode]);

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(prev => (prev === letter ? null : letter));
  };
  
  const handleCategorySelect = (category: GlossaryEntry['category']) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const handleClearFilters = () => {
    setSelectedLetter(null);
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const handleEntryClick = (entry: GlossaryEntry) => {
    setSelectedEntry(entry);
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

  const languages: { code: GlossaryLang; labelKey: string }[] = [
      { code: 'en', labelKey: 'english' },
      { code: 'fr', labelKey: 'french' },
      { code: 'ar', labelKey: 'arabic' },
      { code: 'es', labelKey: 'spanish' },
      { code: 'it', labelKey: 'italian' },
      { code: 'de', labelKey: 'german' },
      { code: 'el', labelKey: 'greek' },
      { code: 'tr', labelKey: 'turkish' },
      { code: 'zh', labelKey: 'chinese' },
      { code: 'ja', labelKey: 'japanese' },
  ];

  const langButtonClass = (isActive: boolean) => 
    `px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${isActive ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`;

  const categoryButtonClass = (category: GlossaryEntry['category'] | null) => 
    `px-4 py-1.5 text-sm rounded-md font-semibold transition-colors ${selectedCategory === category ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`;

  const scriptFontClass = scriptMode === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
  
  const containsPhoenician = /[\u10900-\u1091F]/.test(searchTerm);
  const fontClass = scriptMode === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-xl' : '[font-family:var(--font-phoenician)] text-lg';
  const inputFontClass = containsPhoenician ? fontClass : '';
  const containsRtlChars = /[\u10900-\u1091F\u0600-\u06FF]/.test(searchTerm);
  const inputDir = containsRtlChars ? 'rtl' : 'ltr';

  const uiIsRtl = currentUiLang === 'ar';

  return (
    <>
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full flex-grow flex items-center gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder={t('dictionarySearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full bg-[color:var(--color-bg-end)] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] rounded-lg py-2.5 ps-10 pe-10 focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)] ${inputFontClass}`}
                        autoFocus
                        dir={inputDir}
                    />
                    <div className={`absolute top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none ${uiIsRtl ? 'right-3' : 'left-3'}`}>
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <div className={`absolute top-1/2 -translate-y-1/2 ${uiIsRtl ? 'left-3' : 'right-3'}`}>
                      <button onClick={() => setIsKeyboardOpen(prev => !prev)} className="p-1 rounded-full hover:bg-white/10 text-[color:var(--color-primary)]" title={isKeyboardOpen ? t('keyboardClose') : t('keyboardOpen')}>
                          <KeyboardIcon className="w-5 h-5" />
                      </button>
                    </div>
                </div>
                <div className="relative w-52 flex-shrink-0">
                    <select
                        value={searchMode}
                        onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                        className="appearance-none w-full bg-[color:var(--color-bg-end)] text-[color:var(--color-text)] text-sm rounded-lg focus:shadow-[0_0_15px_var(--color-glow)] focus:outline-none block p-2.5 cursor-pointer border border-[color:var(--color-border)]"
                        aria-label="Search mode"
                    >
                        <option value="start" className="bg-[color:var(--color-surface-solid)]">{t('searchModeStart')}</option>
                        <option value="middle" className="bg-[color:var(--color-surface-solid)]">{t('searchModeMiddle')}</option>
                        <option value="end" className="bg-[color:var(--color-surface-solid)]">{t('searchModeEnd')}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[color:var(--color-text-muted)]">
                        <ChevronDownIcon className="w-4 h-4"/>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-shrink-0 justify-center">
                  <button onClick={() => handleCategorySelect(null)} className={categoryButtonClass(null)} aria-pressed={selectedCategory === null}>{t('dictionaryAll')}</button>
                  <button onClick={() => handleCategorySelect('theonym')} className={categoryButtonClass('theonym')} aria-pressed={selectedCategory === 'theonym'}>{t('theonyms')}</button>
                  <button onClick={() => handleCategorySelect('personal_name')} className={categoryButtonClass('personal_name')} aria-pressed={selectedCategory === 'personal_name'}>{t('personalNames')}</button>
                  <button onClick={() => handleCategorySelect('location')} className={categoryButtonClass('location')} aria-pressed={selectedCategory === 'location'}>{t('locationNames')}</button>
              </div>

               <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
                  <span className="text-sm font-semibold text-[color:var(--color-text-muted)]">{t('searchMeaningIn')}:</span>
                  {languages.map(lang => (
                    <button 
                        key={lang.code} 
                        onClick={() => handleGlossaryLangChange(lang.code)} 
                        className={langButtonClass(glossaryLang === lang.code)} 
                        aria-pressed={glossaryLang === lang.code}
                    >
                        {t(lang.labelKey)}
                    </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
                <button
                  onClick={handleClearFilters}
                  className={`px-3 py-1 text-sm rounded-md font-semibold transition-colors ${!selectedLetter && !selectedCategory && !searchTerm ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`}
                  aria-pressed={!selectedLetter && !selectedCategory && !searchTerm}
                >
                  {t('reset')}
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
          </div>

          <div className="px-4 py-2 flex-shrink-0 border-b border-[color:var(--color-border)] text-sm text-[color:var(--color-text-muted)]">
            {`${filteredDictionary.length.toLocaleString()} ${t('dictionaryFound')} ${phoenicianGlossary.length.toLocaleString()} ${t('dictionaryTotal')}`}
          </div>

          <main className="flex-grow overflow-y-auto relative">
             {isTranslating && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader className="w-8 h-8 text-[color:var(--color-primary)]" />
                </div>
              )}
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
                      onClick={() => handleEntryClick(entry)}
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
      <Keyboard 
        isOpen={isKeyboardOpen}
        onClose={() => setIsKeyboardOpen(false)}
        onKeyPress={(key) => setSearchTerm(prev => prev + key)}
        onBackspace={() => setSearchTerm(prev => prev.slice(0, -1))}
        onEnter={() => setIsKeyboardOpen(false)}
        dialect={scriptMode}
        sourceLang={Language.PHOENICIAN}
        t={t}
      />
      <WordDetailModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onUseWord={onWordSelect}
        onSaveSentence={onSaveSentence}
        t={t}
        speak={speak}
        isSpeaking={isSpeaking}
        dialect={scriptMode}
        glossaryLang={glossaryLang}
      />
    </>
  );
};

export default PhoenicianDictionaryModal;