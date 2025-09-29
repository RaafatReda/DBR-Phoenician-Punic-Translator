
import React, { useState, useEffect, useRef } from 'react';
import { UILang } from '../lib/i18n';
import HomeIcon from './icons/HomeIcon';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import FontSizeManager from './FontSizeManager';
import FontSizeIcon from './icons/FontSizeIcon';

type Theme = 'light' | 'dark' | 'papyrus';
type FontSize = 'small' | 'medium' | 'large';

interface MainMenuProps {
  uiLang: UILang;
  setUiLang: (lang: UILang) => void;
  theme: Theme;
  onThemeToggle: () => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  t: (key: string) => string;
}

const MainMenu: React.FC<MainMenuProps> = ({
  uiLang,
  setUiLang,
  theme,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFontSizeManagerOpen, setIsFontSizeManagerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFontSizeManagerOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (isOpen) setIsFontSizeManagerOpen(false);
  };

  const handleMouseEnter = () => {
    if (!isMobile.current) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile.current) {
      setIsOpen(false);
      setIsFontSizeManagerOpen(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative flex items-center h-[58px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleToggle}
        className="glass-panel rounded-full p-3 text-[color:var(--color-primary)] hover:shadow-[0_0_15px_var(--color-glow)] focus:outline-none transition-all duration-300 z-20"
        aria-label="Open main menu"
        aria-expanded={isOpen}
      >
        <HomeIcon className="w-6 h-6" />
      </button>

      <div
        className={`
          absolute top-0 start-0 h-full
          flex items-center transition-all duration-300 ease-in-out z-10
          ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          overflow-hidden
        `}
      >
        <div className="flex items-center glass-panel rounded-full p-1 ps-16 whitespace-nowrap">
          {/* Settings */}
          <div className="flex items-center p-1">
             <LanguageSwitcher currentLang={uiLang} onChangeLang={setUiLang} />
             <div className="w-px h-5 bg-[color:var(--color-border)] mx-1"></div>
             <ThemeToggle theme={theme} onToggle={onThemeToggle} t={t} />
             <div className="w-px h-5 bg-[color:var(--color-border)] mx-1"></div>
             <div className="relative">
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    setIsFontSizeManagerOpen(prev => !prev);
                    }}
                    className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] focus:outline-none transition-colors"
                    aria-label={t('fontSizeManagerTitle')}
                    title={t('fontSizeManagerTitle')}
                >
                    <FontSizeIcon className="w-5 h-5" />
                </button>
                {isFontSizeManagerOpen && (
                    <FontSizeManager
                    currentSize={fontSize}
                    onSizeChange={onFontSizeChange}
                    t={t}
                    />
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
