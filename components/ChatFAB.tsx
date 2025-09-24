import React from 'react';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface ChatFABProps {
    onOpen: () => void;
    t: (key: string) => string;
}

const ChatFAB: React.FC<ChatFABProps> = ({ onOpen, t }) => {
    return (
        <button
            onClick={onOpen}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-g-start)] shadow-lg hover:shadow-[0_0_20px_var(--color-glow)] flex items-center justify-center transition-transform hover:scale-110 active:scale-100 focus:outline-none"
            aria-label={t('chatFabTitle')}
            title={t('chatFabTitle')}
        >
            <ChatBubbleIcon className="w-8 h-8" />
        </button>
    );
};

export default ChatFAB;