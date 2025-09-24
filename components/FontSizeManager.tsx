import React from 'react';

type FontSize = 'small' | 'medium' | 'large';

interface FontSizeManagerProps {
  currentSize: FontSize;
  onSizeChange: (size: FontSize) => void;
  t: (key: string) => string;
}

const FontSizeManager: React.FC<FontSizeManagerProps> = ({ currentSize, onSizeChange, t }) => {
  const sizes: { key: FontSize; label: string; titleKey: string }[] = [
    { key: 'small', label: 'S', titleKey: 'fontSizeSmall' },
    { key: 'medium', label: 'M', titleKey: 'fontSizeMedium' },
    { key: 'large', label: 'L', titleKey: 'fontSizeLarge' },
  ];

  const buttonClass = (isActive: boolean) =>
    `w-1/3 py-2 text-sm font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] ${
      isActive
        ? 'bg-[color:var(--color-primary)] text-[color:var(--keyboard-active-button-text)]'
        : 'bg-transparent text-[color:var(--color-text-muted)] hover:bg-white/10 hover:text-[color:var(--color-text)]'
    }`;

  return (
    <div
      className="absolute top-full mt-2 right-0 w-40 glass-panel rounded-lg shadow-2xl p-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-sm font-semibold text-[color:var(--color-text)]">{t('fontSize')}</span>
      </div>
      <div className="flex items-center justify-center space-x-1 bg-black/20 p-1 rounded-lg">
        {sizes.map(({ key, label, titleKey }) => (
          <button
            key={key}
            onClick={() => onSizeChange(key)}
            className={buttonClass(currentSize === key)}
            aria-pressed={currentSize === key}
            title={t(titleKey)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FontSizeManager;
