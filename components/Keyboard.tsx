import React, { useState, useEffect, useRef } from 'react';
import Key from './Key';
import { layouts, KeyboardLayoutName } from '../lib/keyboardLayouts';
import BackspaceIcon from './icons/BackspaceIcon';
import CloseIcon from './icons/CloseIcon';
import ShiftIcon from './icons/ShiftIcon';
import GlobeIcon from './icons/GlobeIcon';
import EnterIcon from './icons/EnterIcon';
import { Language, PhoenicianDialect } from '../types';

interface KeyboardProps {
  isOpen: boolean;
  sourceLang: Language;
  dialect?: PhoenicianDialect;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  onEnter?: () => void;
  t: (key: string) => string;
}

const keyboardLayoutNames: KeyboardLayoutName[] = ['phoenician', 'punic', 'english', 'french', 'arabic'];

const Keyboard: React.FC<KeyboardProps> = ({ isOpen, sourceLang, dialect, onKeyPress, onBackspace, onClose, onEnter, t }) => {
  const [layoutName, setLayoutName] = useState<KeyboardLayoutName>(() => {
    return (localStorage.getItem('dbr-translator-keyboard-layout') as KeyboardLayoutName) || 'phoenician';
  });
  const [isShifted, setIsShifted] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    localStorage.setItem('dbr-translator-keyboard-layout', layoutName);
  }, [layoutName]);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return; // On initial mount, respect the layout loaded from localStorage.
    }
    
    const mapLangAndDialectToLayout = (lang: Language, dialect?: PhoenicianDialect): KeyboardLayoutName | null => {
        if (lang === Language.PUNIC) return 'punic';
        if (lang === Language.PHOENICIAN) {
            return dialect === PhoenicianDialect.PUNIC ? 'punic' : 'phoenician';
        }
        if (lang === Language.ARABIC) return 'arabic';
        if (lang === Language.FRENCH) return 'french';
        // Default to english for any other language that has a dictionary
        if ([
            Language.ENGLISH, Language.SPANISH,
            Language.ITALIAN, Language.CHINESE, Language.JAPANESE,
            Language.TURKISH, Language.GREEK, Language.GERMAN
        ].includes(lang)) {
            return 'english';
        }
        return 'english'; // Fallback to English
    };

    const newLayout = mapLangAndDialectToLayout(sourceLang, dialect);
    if (newLayout) {
        setLayoutName(newLayout);
        setIsShifted(false);
        setShowSymbols(false);
    }
  }, [sourceLang, dialect]);

  if (!isOpen) {
    return null;
  }

  const handleKeyPress = (key: string) => {
    onKeyPress(key);
    if (isShifted) {
      setIsShifted(false); // Shift is a one-shot operation
    }
  };

  const handleControlKeyPress = (key: string) => {
    switch(key) {
        case 'SHIFT':
            setIsShifted(!isShifted);
            break;
        case 'BACKSPACE':
            onBackspace();
            break;
        case 'SPACE':
            onKeyPress(' ');
            break;
        case 'SYMBOLS':
            setShowSymbols(true);
            setIsShifted(false);
            break;
        case 'ABC':
            setShowSymbols(false);
            break;
        case 'ENTER':
            onEnter?.();
            break;
    }
  };
  
  const layout = layouts[layoutName];
  const currentKeys = showSymbols 
    ? layouts.symbols.default 
    : isShifted 
        ? (layout.shift || layout.default) 
        : layout.default;

  const renderKey = (key: string) => {
    const isControl = ['SHIFT', 'BACKSPACE'].includes(key);
    let flexGrow = 1;
    if (key === 'SHIFT') flexGrow = 1.5;
    if (key === 'BACKSPACE') flexGrow = 1.5;
    
    const isPhoenicianScriptKey = (layoutName === 'phoenician' || layoutName === 'punic') && !showSymbols && !isControl;
    const fontClass = layoutName === 'punic' ? '[font-family:var(--font-punic)] text-3xl' : '[font-family:var(--font-phoenician)] text-2xl';

    return (
        <Key 
            key={key} 
            value={key} 
            onClick={isControl ? handleControlKeyPress : handleKeyPress} 
            className={`flex-grow-[${flexGrow}] ${isPhoenicianScriptKey ? fontClass : ''}`}
            isPressed={isControl && key === 'SHIFT' && isShifted}
        >
          {key === 'SHIFT' ? (
            <ShiftIcon className="w-5 h-5" />
          ) : key === 'BACKSPACE' ? (
            <BackspaceIcon className="w-5 h-5" />
          ) : (
            key
          )}
        </Key>
    );
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel p-1 sm:p-2 z-50 text-[color:var(--color-text)] select-none" role="region" aria-label={t('keyboardLabel')} style={{backgroundColor: 'var(--keyboard-bg)'}}>
      <div className="w-full max-w-4xl mx-auto keyboard-panel p-2 rounded-t-lg">
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 mb-2">
           <GlobeIcon className="w-5 h-5 text-[color:var(--color-text-muted)]" />
          {keyboardLayoutNames.map(l => (
            <button
              key={l}
              onClick={() => { setLayoutName(l); setShowSymbols(false); setIsShifted(false); }}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md capitalize font-semibold transition-colors ${layoutName === l && !showSymbols ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'}`}
              aria-pressed={layoutName === l}
            >
              {l === 'phoenician' ? <span className="[font-family:var(--font-phoenician)]">𐤀𐤁𐤂</span> : l === 'punic' ? <span className="[font-family:var(--font-punic)] text-xl">𐤀𐤁𐤂</span> : t(l)}
            </button>
          ))}
          <button onClick={onClose} className="p-1.5 rounded-full keyboard-btn text-[color:var(--color-text)]" aria-label={t('keyboardClose')}>
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          {currentKeys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center w-full space-x-1 sm:space-x-1.5">
              {row.map(renderKey)}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-1 sm:space-x-1.5 mt-1 sm:mt-1.5">
            <Key value={showSymbols ? 'ABC' : 'SYMBOLS'} onClick={handleControlKeyPress} className="flex-grow-[2.5]">
                {showSymbols ? t('keyLetters') : t('keySymbols')}
            </Key>
            <Key value="SPACE" onClick={handleControlKeyPress} className="flex-grow-[7]">
                {t('keySpace')}
            </Key>
            <Key value="ENTER" onClick={handleControlKeyPress} className="flex-grow-[2.5]">
                <EnterIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Key>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;