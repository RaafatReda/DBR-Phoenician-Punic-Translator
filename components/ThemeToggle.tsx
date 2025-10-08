import React from 'react';

type Theme = 'light' | 'dark' | 'papyrus' | 'purple-glassy' | 'glassmorphism' | 'deep-sea-gold';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  t: (key: string) => string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, t }) => {

  const getNextThemeInfo = () => {
    if (theme === 'light') {
      return { icon: <span className="text-2xl">𓇼</span>, title: t('themeSwitchDark') };
    }
    if (theme === 'dark') {
      return { icon: <span className="text-2xl">𓇉</span>, title: t('themeSwitchPapyrus') };
    }
    if (theme === 'papyrus') {
      return { icon: <span className="text-2xl">𓇺</span>, title: t('themeSwitchPurple') };
    }
    if (theme === 'purple-glassy') {
      return { icon: <span className="text-2xl">𓎰</span>, title: t('themeSwitchGlassmorphism') };
    }
    if (theme === 'glassmorphism') {
      return { icon: <span className="text-2xl">𓊝</span>, title: t('themeSwitchDeepSeaGold') };
    }
    // theme is 'deep-sea-gold'
    return { icon: <span className="text-2xl">𓇳</span>, title: t('themeSwitchLight') };
  };

  const { icon, title } = getNextThemeInfo();

  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] focus:outline-none transition-colors flex items-center justify-center h-9 w-9"
      aria-label={title}
      title={title}
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;