import React from 'react';
import CloseIcon from './icons/CloseIcon';

interface SymbolResultCardProps {
  name: string;
  description: string;
  onClose: () => void;
  t: (key: string) => string;
}

const SymbolResultCard: React.FC<SymbolResultCardProps> = ({ name, description, onClose, t }) => {
  if (!name || !description) {
    return (
      <div className="absolute inset-x-4 bottom-32 sm:bottom-40 z-20 glass-panel p-4 rounded-lg text-center animate-pulse">
        <p className="font-semibold">{t('noSymbolFound')}</p>
        <p className="text-sm text-gray-400">{t('tryAgainHint')}</p>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-1.5 text-sm font-semibold bg-white/10 rounded-md hover:bg-white/20"
        >
          {t('close')}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-4 bottom-32 sm:bottom-40 z-20 glass-panel p-4 rounded-lg max-h-[40%] overflow-y-auto">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-[color:var(--color-primary)] mb-2">{name}</h3>
        <button onClick={onClose} className="p-1 -mt-1 -mr-1 text-gray-400 hover:text-white">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
    </div>
  );
};

export default SymbolResultCard;