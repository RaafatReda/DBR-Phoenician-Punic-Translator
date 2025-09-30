import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface GrammarModuleProps {
    title: string;
    content: string;
    uiLang: 'en' | 'fr' | 'ar';
}

const GrammarModule: React.FC<GrammarModuleProps> = ({ title, content, uiLang }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-[color:var(--color-border)] rounded-lg mb-4 bg-[color:var(--color-surface-solid)]/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-bold text-[color:var(--color-secondary)] [font-family:var(--font-serif)]">{title}</h3>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}>
                <div className="prose max-w-none p-4 pt-0" dir={uiLang === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export default GrammarModule;
