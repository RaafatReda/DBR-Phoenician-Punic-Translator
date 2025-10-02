import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { PhoenicianDialect, PronunciationResult } from '../types';
import { discussPronunciation } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import Loader from './Loader';
import SparklesIcon from './icons/SparklesIcon';

interface PronunciationTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalWord: string;
  pronunciationResult: PronunciationResult;
  dialect: PhoenicianDialect;
  t: (key: string) => string;
  uiLang: UILang;
  onUpdatePronunciation: (result: PronunciationResult) => void;
}

interface TutorMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    suggestions?: PronunciationResult[];
}

const suggestionRegex = /\[SUGGESTION\]([\s\S]*?)\[\/SUGGESTION\]/g;

const PronunciationTutorModal: React.FC<PronunciationTutorModalProps> = ({
  isOpen,
  onClose,
  originalWord,
  pronunciationResult,
  dialect,
  t,
  uiLang,
  onUpdatePronunciation
}) => {
    const [messages, setMessages] = useState<TutorMessage[]>([]);
    const [input, setInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { id: 'initial', sender: 'ai', text: t('pronunciationTutorIntro') }
            ]);
            setIsAiThinking(false);
            setInput('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleApplySuggestion = (suggestion: PronunciationResult) => {
        onUpdatePronunciation(suggestion);
        onClose();
    };

    const sendMessage = async () => {
        if (!input.trim() || isAiThinking) return;

        const userInput: TutorMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userInput]);
        setInput('');
        setIsAiThinking(true);

        try {
            const rawResponse = await discussPronunciation(
                originalWord,
                pronunciationResult,
                input,
                dialect,
                uiLang
            );

            const suggestions: PronunciationResult[] = [];
            const text = rawResponse.replace(suggestionRegex, (match, jsonString) => {
                try {
                    const suggestion = JSON.parse(jsonString.trim());
                    suggestions.push(suggestion);
                } catch (e) {
                    console.error("Failed to parse AI suggestion:", e);
                }
                return ''; // Remove the block from the main text
            }).trim();

            const aiResponse: TutorMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text,
                suggestions: suggestions.length > 0 ? suggestions : undefined
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Failed to get tutor response:", error);
            const errorMessage: TutorMessage = {
                id: `ai-error-${Date.now()}`,
                sender: 'ai',
                text: t('chatErrorResponse'),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiThinking(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center z-[60] p-4" onClick={onClose}>
            <div 
                className="glass-panel w-full sm:max-w-lg h-[80vh] sm:h-[70vh] max-h-[600px] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
            >
                <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-[color:var(--color-primary)]">
                            {t('pronunciationTutorHeader')}
                        </h2>
                        <p className="text-xs text-[color:var(--color-text-muted)]">{t('pronunciationTutorSubheader')}</p>
                    </div>
                    <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors p-1" aria-label={t('chatClose')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)] rounded-br-none' : 'bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)] rounded-bl-none'}`}>
                                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-xs font-bold text-cyan-400">{t('aiAssistantImproved')}</p>
                                        {msg.suggestions.map((suggestion, index) => (
                                            <div key={index} className="bg-black/20 p-2 rounded-md">
                                                <p className="font-mono text-sm">[{suggestion.ipa}]</p>
                                                <button onClick={() => handleApplySuggestion(suggestion)} className="mt-2 w-full text-xs font-semibold bg-green-500/20 text-green-300 py-1 px-2 rounded hover:bg-green-500/40">
                                                    {t('aiAssistantApply')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isAiThinking && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)]">
                                <Loader className="w-5 h-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="p-4 border-t border-[color:var(--color-border)] flex-shrink-0">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('pronunciationTutorPlaceholder')}
                            className="flex-1 bg-transparent text-sm text-[color:var(--color-text)] border border-[color:var(--color-border)] rounded-full py-2 px-4 focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)]"
                            disabled={isAiThinking}
                        />
                        <button type="submit" disabled={!input.trim() || isAiThinking} className="p-2.5 rounded-full bg-[color:var(--color-primary)] text-white disabled:opacity-50">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default PronunciationTutorModal;