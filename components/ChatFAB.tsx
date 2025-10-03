import React, { useState } from 'react';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import PencilIcon from './icons/PencilIcon';
import SparklesIcon from './icons/SparklesIcon';
import CloseIcon from './icons/CloseIcon';

interface MultiFABProps {
    onPracticeClick: () => void;
    onKnowledgeClick: () => void;
    t: (key: string) => string;
}

const MultiFAB: React.FC<MultiFABProps> = ({ onPracticeClick, onKnowledgeClick, t }) => {
    const [isOpen, setIsOpen] = useState(false);

    const fabClass = "w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none";
    const subFabClass = "w-14 h-14 rounded-full shadow-md flex items-center justify-center";

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-4">
            <div className={`transition-all duration-300 ease-in-out flex flex-col items-center gap-4 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Knowledge Hub Button */}
                <div className="flex items-center gap-3">
                    <div className="bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)] text-sm font-semibold px-3 py-1 rounded-md shadow-md">{t('knowledgeHubTitle')}</div>
                    <button
                        onClick={() => { onKnowledgeClick(); setIsOpen(false); }}
                        className={`${subFabClass} bg-[color:var(--color-secondary)] text-white hover:bg-opacity-90`}
                        aria-label={t('knowledgeHubTitle')}
                    >
                        <SparklesIcon className="w-7 h-7" />
                    </button>
                </div>
                {/* Practice Chat Button */}
                <div className="flex items-center gap-3">
                    <div className="bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)] text-sm font-semibold px-3 py-1 rounded-md shadow-md">{t('practiceChatTitle')}</div>
                    <button
                        onClick={() => { onPracticeClick(); setIsOpen(false); }}
                        className={`${subFabClass} bg-[color:var(--color-secondary)] text-white hover:bg-opacity-90`}
                        aria-label={t('practiceChatTitle')}
                    >
                        <PencilIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${fabClass} bg-[color:var(--color-primary)] text-white transform hover:scale-110 active:scale-100 hover:shadow-[0_0_20px_var(--color-glow)]`}
                aria-label={t('openChatOptions')}
                aria-expanded={isOpen}
            >
                {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatBubbleIcon className="w-8 h-8" />}
            </button>
        </div>
    );
};

export default MultiFAB;
