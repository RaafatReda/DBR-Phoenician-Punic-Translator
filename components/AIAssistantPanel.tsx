import React, { useState, useEffect, useRef } from 'react';
import { TransliterationOutput, Language, AIAssistantResponse, PhoenicianDialect } from '../types';
import { getTranslationCorrection } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import SendIcon from './icons/SendIcon';
import CheckIcon from './icons/CheckIcon';
import CloseIcon from './icons/CloseIcon';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    suggestion?: TransliterationOutput;
    explanation?: string;
}

interface AIAssistantPanelProps {
    sourceText: string;
    sourceLang: Language;
    initialTranslation: TransliterationOutput;
    onClose: () => void;
    onApply: (newTranslation: TransliterationOutput) => void;
    t: (key: string) => string;
    uiLang: UILang;
    dialect: PhoenicianDialect;
    targetLang: Language;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
    sourceText,
    sourceLang,
    initialTranslation,
    onClose,
    onApply,
    t,
    uiLang,
    dialect,
    targetLang
}) => {
    const [currentTranslation, setCurrentTranslation] = useState<TransliterationOutput>(initialTranslation);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const isPunic = targetLang === Language.PUNIC || (targetLang === Language.PHOENICIAN && dialect === PhoenicianDialect.PUNIC);
    const fontClass = isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
    const fontSizeClass = isPunic ? 'text-2xl' : 'text-xl';

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: userInput,
        };

        setChatHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getTranslationCorrection(
                sourceText,
                sourceLang,
                currentTranslation, // Use the current state for iterative feedback
                userInput,
                uiLang
            );
            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: '', // Text is split into suggestion and explanation
                suggestion: response.improvedTranslation,
                explanation: response.explanation,
            };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                sender: 'ai',
                text: err instanceof Error ? err.message : t('aiAssistantError'),
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptSuggestion = (suggestion: TransliterationOutput) => {
        setCurrentTranslation(suggestion);
    };

    const renderChatMessage = (msg: ChatMessage) => {
        if (msg.sender === 'user') {
            return (
                <div key={msg.id} className="flex justify-end mb-3">
                    <div className="bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)] rounded-lg py-2 px-3 max-w-xs" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                        {msg.text}
                    </div>
                </div>
            );
        }
        
        // AI message
        return (
            <div key={msg.id} className="flex justify-start mb-3">
                <div className="bg-black/20 rounded-lg p-3 max-w-xs space-y-2" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                    {msg.suggestion && (
                        <div>
                            <p className="text-xs font-bold text-green-400">{t('aiAssistantImproved')}</p>
                            <div className="bg-black/20 p-2 rounded-md mt-1">
                               <p className={`${fontClass} ${fontSizeClass} text-right text-white`} dir="rtl">{msg.suggestion.phoenician}</p>
                               <p className="text-xs text-gray-400 italic text-right" dir="ltr">{msg.suggestion.latin}</p>
                               <button 
                                 onClick={() => handleAcceptSuggestion(msg.suggestion!)}
                                 className="mt-2 w-full text-xs font-semibold bg-green-500/20 text-green-300 py-1 px-2 rounded hover:bg-green-500/40"
                               >
                                 {t('aiAssistantApply')}
                               </button>
                            </div>
                        </div>
                    )}
                     {msg.explanation && (
                         <div>
                            <p className="text-xs font-bold text-cyan-400">{t('aiAssistantExplanation')}</p>
                            <p className="text-sm mt-1 text-gray-300">{msg.explanation}</p>
                        </div>
                    )}
                    {msg.text && <p className="text-sm text-red-400">{msg.text}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col animate-text-glow-fade-in border-2 border-dashed border-[color:var(--color-primary)]/50 rounded-lg" style={{animationDuration: '0.5s'}}>
            {/* Header */}
            <div className="flex justify-between items-center p-2 border-b border-[color:var(--color-border)] flex-shrink-0" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="text-base font-semibold text-[color:var(--color-primary)] px-2">{t('aiAssistantHeader')}</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-white/10">{t('savedCancel')}</button>
                    <button 
                        onClick={() => onApply(currentTranslation)} 
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)]"
                    >
                        <CheckIcon className="w-4 h-4" /> {t('done')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden">
                {/* Left: Editor */}
                <div className="flex flex-col p-2 overflow-y-auto" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                    <label className="text-sm font-semibold text-[color:var(--color-text-muted)] mb-1">{t('aiAssistantCurrent')}</label>
                    <div className="flex-grow p-3 bg-black/20 rounded-md focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]">
                        <textarea
                            value={currentTranslation.phoenician}
                            onChange={(e) => setCurrentTranslation(prev => ({ ...prev, phoenician: e.target.value }))}
                            className={`w-full bg-transparent text-white focus:outline-none resize-none ${fontClass} ${fontSizeClass} text-right`}
                            dir="rtl"
                            rows={4}
                        />
                    </div>
                    <div className="mt-2 p-2 bg-black/20 rounded-md">
                        <p className="text-xs text-[color:var(--color-text-muted)]">{t('dailyWordLatinTransliteration')}</p>
                        <p className="text-sm text-gray-300 italic" dir="ltr">{currentTranslation.latin}</p>
                    </div>
                     <div className="mt-2 p-2 bg-black/20 rounded-md">
                        <p className="text-xs text-[color:var(--color-text-muted)]">{t('dailyWordArabicTransliteration')}</p>
                        <p className="text-sm text-gray-300" dir="rtl">{currentTranslation.arabic}</p>
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="flex flex-col bg-black/10 border-s border-[color:var(--color-border)] overflow-hidden">
                    <div className="flex-grow p-3 overflow-y-auto">
                        <div className="text-xs text-center text-[color:var(--color-text-muted)] mb-4" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('aiAssistantSubheader')}</div>
                        {chatHistory.map(renderChatMessage)}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-black/20 rounded-lg p-3">
                                    <Loader className="w-5 h-5"/>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-2 border-t border-[color:var(--color-border)]">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                             <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={t('aiAssistantRequestPlaceholder')}
                                className="flex-1 bg-transparent text-sm text-[color:var(--color-text)] border border-[color:var(--color-border)] rounded-full py-2 px-3 focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)]"
                                disabled={isLoading}
                                autoFocus
                                dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <button type="submit" disabled={isLoading || !userInput.trim()} className="p-2.5 rounded-full bg-[color:var(--color-primary)] text-white disabled:opacity-50">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantPanel;