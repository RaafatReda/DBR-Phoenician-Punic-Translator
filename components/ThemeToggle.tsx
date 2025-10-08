import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import SparklesIcon from './icons/SparklesIcon';
import SwirlIcon from './icons/SwirlIcon';
import DatabaseIcon from './icons/DatabaseIcon';

type Theme = 'light' | 'dark' | 'papyrus' | 'purple-glassy' | 'glassmorphism' | 'deep-sea-gold';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  t: (key: string) => string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, t }) => {

  const CottonIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 15.5A2.5 2.5 0 0 0 9.5 13a2.5 2.5 0 0 0-5 0A2.5 2.5 0 0 0 7 15.5"/>
        <path d="M12 15.5A2.5 2.5 0 0 1 14.5 13a2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 17 15.5"/>
        <path d="M12 15.5V9"/>
        <path d="M12 9a3 3 0 0 0-3-3 3 3 0 0 1-3-3"/>
        <path d="M12 9a3 3 0 0 1 3-3 3 3 0 0 0 3-3"/>
    </svg>
  );

  const getNextThemeInfo = () => {
    if (theme === 'light') {
      return { icon: <MoonIcon className="w-5 h-5" />, title: t('themeSwitchDark') };
    }
    if (theme === 'dark') {
      return { icon: <CottonIcon className="w-5 h-5" />, title: t('themeSwitchPapyrus') };
    }
    if (theme === 'papyrus') {
      return { icon: <SparklesIcon className="w-5 h-5" />, title: t('themeSwitchPurple') };
    }
    if (theme === 'purple-glassy') {
      return { icon: <SwirlIcon className="w-5 h-5" />, title: t('themeSwitchGlassmorphism') };
    }
    if (theme === 'glassmorphism') {
      return { icon: <DatabaseIcon className="w-5 h-5" />, title: t('themeSwitchDeepSeaGold') };
    }
    // theme is 'deep-sea-gold'
    return { icon: <SunIcon className="w-5 h-5" />, title: t('themeSwitchLight') };
  };

  const { icon, title } = getNextThemeInfo();

  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] focus:outline-none transition-colors"
      aria-label={title}
      title={title}
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;