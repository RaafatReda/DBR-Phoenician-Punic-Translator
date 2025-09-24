import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, Language, PhoenicianDialect } from '../types';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import Loader from './Loader';
import Keyboard from './Keyboard';
import KeyboardIcon from './icons/KeyboardIcon';
import { UILang } from '../lib/i18n';
import ScriptModeToggle from './ScriptModeToggle';
import { KeyboardLayoutName } from '../lib/keyboardLayouts';

interface ChatModalProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
}

const getSystemInstruction = (lang: UILang, dialect: PhoenicianDialect): string => {
    const scriptStyle = dialect === PhoenicianDialect.PUNIC ? "Punic (a more cursive variant)" : "Standard Phoenician";
    const scriptInstruction = `Your Phoenician text MUST be in the ${scriptStyle} script style. It must use characters from the Unicode range U+10900–U+1091F.`;

    switch (lang) {
        case 'ar':
            return `You are a friendly AI language tutor for the ancient Phoenician language. Your goal is to have a simple, encouraging conversation with a user learning Phoenician, with all hints and explanations in Arabic. Follow these rules strictly:
1.  **Primary Language & Script:** ALWAYS respond primarily in Phoenician. ${scriptInstruction} Do NOT use Hebrew script. Keep sentences short and simple.
2.  **Grammar & Error Correction:** Your main purpose is to teach. If the user makes a grammatical or spelling mistake, you MUST correct it.
    - First, provide the corrected Phoenician sentence.
    - Then, in parentheses, provide a clear, concise explanation of the correction in Arabic.
    - The explanation must include: the grammatical rule, the user's mistake, the correction, and both Latin and Arabic transliterations of the correction.
    - Format: Corrected Phoenician Text (الشرح: [القاعدة]. نصك: "[User's Mistake]". الصحيح: "[Correction]" (النطق: [Latin Translit.] / [Arabic Translit.])).
    - Example: "𐤀𐤔𐤌𐤍, 𐤄𐤃𐤁𐤓 𐤄𐤍𐤊𐤍 𐤄𐤀 '𐤀𐤍𐤊 𐤀𐤃𐤌'. (الشرح: في الفينيقية، غالباً ما يتم حذف فعل الكينونة. نصك: "𐤀𐤍𐤊 𐤄𐤅𐤀 𐤀𐤃𐤌". الصحيح: "𐤀𐤍𐤊 𐤀𐤃𐤌" (النطق: anak adam / أَنَكْ أَدَمْ).)"
    - After the correction, continue the conversation naturally.
3.  **Hints for Regular Conversation:** When NOT correcting an error, provide a concise hint in parentheses containing: The Arabic translation, a Latin transliteration, and an Arabic transliteration. Format: (الترجمة العربية / Latin transliteration / النقل الحرفي العربي). Example: '𐤔𐤋𐤌! (مرحباً! / shalom / شَلُمْ)'.
4.  **Encourage Phoenician Usage:** If the user writes in Arabic, respond in Phoenician with a hint in the format from rule 3.
5.  **Tone:** Be friendly, patient, and encouraging.
6.  **Conversation Starter:** Start by asking the user for their name in Phoenician.`;
        case 'fr':
            return `You are a friendly AI language tutor for the ancient Phoenician language. Your goal is to have a simple, encouraging conversation with a user learning Phoenician, with all hints and explanations in French. Follow these rules strictly:
1.  **Primary Language & Script:** ALWAYS respond primarily in Phoenician. ${scriptInstruction} Do NOT use Hebrew script. Keep sentences short and simple.
2.  **Grammar & Error Correction:** Your main purpose is to teach. If the user makes a grammatical or spelling mistake, you MUST correct it.
    - First, provide the corrected Phoenician sentence.
    - Then, in parentheses, explain the correction clearly and concisely in French. Focus on the grammatical rule.
    - Format: Texte Phénicien Corrigé (Explication: [La Règle]. Votre texte: "[User's Mistake]". Correct: "[Correction]".)
    - Example: "𐤀𐤔𐤌𐤍, 𐤄𐤃𐤁𐤓 𐤄𐤍𐤊𐤍 𐤄𐤀 '𐤀𐤍𐤊 𐤀𐤃𐤌'. (Explication: En phénicien, le verbe 'être' est souvent omis dans les phrases simples "A est B". Votre texte: "𐤀𐤍𐤊 𐤄𐤅𐤀 𐤀𐤃𐤌". Correct: "𐤀𐤍𐤊 𐤀𐤃𐤌".)"
    - After the correction, continue the conversation naturally.
3.  **Hints for Regular Conversation:** When NOT correcting an error, provide a concise hint in parentheses containing the French translation and a Latin transliteration. Format: (Traduction française / Translittération latine). Example: '𐤔𐤋𐤌! (Bonjour ! / shalom)'.
4.  **Encourage Phoenician Usage:** If the user writes in French, respond in Phoenician with a hint.
5.  **Tone:** Be friendly, patient, and encouraging.
6.  **Conversation Starter:** Start by asking for the user's name in Phoenician.`;
        case 'en':
        default:
            return `You are a friendly AI language tutor for the ancient Phoenician language. Your goal is to have a simple, encouraging conversation with a user learning Phoenician, with all hints and explanations in English. Follow these rules strictly:
1.  **Primary Language & Script:** ALWAYS respond primarily in Phoenician. ${scriptInstruction} Do NOT use Hebrew script. Keep sentences short and simple.
2.  **Grammar & Error Correction:** Your main purpose is to teach. If the user makes a grammatical or spelling mistake, you MUST correct it.
    - First, provide the corrected Phoenician sentence.
    - Then, in parentheses, explain the correction clearly and concisely in English. Focus on the grammatical rule.
    - Format: Corrected Phoenician Text (Explanation: [The Rule]. Your text: "[User's Mistake]". Correct: "[Correction]".)
    - Example: "𐤀𐤔𐤌𐤍, 𐤄𐤃𐤁𐤓 𐤄𐤍𐤊𐤍 𐤄𐤀 '𐤀𐤍𐤊 𐤀𐤃𐤌'. (Explanation: In Phoenician, the verb 'to be' is often omitted in simple "A is B" sentences. Your text: "𐤀𐤍𐤊 𐤄𐤅𐤀 𐤀𐤃𐤌". Correct: "𐤀𐤍𐤊 𐤀𐤃𐤌".)"
    - After the correction, continue the conversation naturally.
3.  **Hints for Regular Conversation:** When NOT correcting an error, provide a concise hint in parentheses containing the English translation and a Latin transliteration. Format: (English translation / Latin transliteration). Example: '𐤔𐤋𐤌! (Hello! / shalom)'.
4.  **Encourage Phoenician Usage:** If the user writes in English, respond in Phoenician with a hint.
5.  **Tone:** Be friendly, patient, and encouraging.
6.  **Conversation Starter:** Start by asking for the user's name in Phoenician.`;
    }
};


const parseAiResponse = (text: string): { phoenician: string, hint: string } => {
    // This regex looks for a potential hint in parentheses.
    // It handles multiline text with the 's' flag.
    const match = text.match(/^(.*?)\s*\((.*?)\)$/s);
    if (match && match[1] && match[2]) {
      return { phoenician: match[1].trim(), hint: match[2].trim() };
    }
    // If no hint is found, the whole text is considered Phoenician.
    return { phoenician: text.trim(), hint: '' };
};

const ChatModal: React.FC<ChatModalProps> = ({ onClose, t, uiLang }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(true);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [scriptMode, setScriptMode] = useState<PhoenicianDialect>(PhoenicianDialect.STANDARD_PHOENICIAN);
    const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutName>('phoenician');
    const chat = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        // Refocus input after AI responds or keyboard closes, helps with UX
        if(!isAiThinking && !isKeyboardOpen) {
            inputRef.current?.focus();
        }
    }, [isAiThinking, isKeyboardOpen]);

    useEffect(() => {
        const initializeChat = async () => {
            setIsAiThinking(true);
            setMessages([]); // Reset messages when script/language changes
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const systemInstruction = getSystemInstruction(uiLang, scriptMode);

                chat.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                });

                // Send an initial empty message to get the AI's greeting
                const initialResponse = await chat.current.sendMessage({ message: "Start the conversation." });
                const firstMessage: ChatMessage = {
                    id: Date.now().toString(),
                    sender: 'ai',
                    text: initialResponse.text,
                };
                setMessages([firstMessage]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                const errorMessage: ChatMessage = {
                    id: Date.now().toString(),
                    sender: 'ai',
                    text: t('chatErrorInit'),
                };
                setMessages([errorMessage]);
            } finally {
                setIsAiThinking(false);
            }
        };
        initializeChat();
    }, [t, uiLang, scriptMode]);

    const sendMessage = async () => {
        if (!input.trim() || isAiThinking || !chat.current) return;

        const userInput: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userInput]);
        setInput('');
        setIsAiThinking(true);

        try {
            const response = await chat.current.sendMessage({ message: input });
            const aiResponse: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: response.text,
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: 'ai',
                text: t('chatErrorResponse'),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    };
    
    const handleKeyboardKeyPress = (key: string) => {
        setInput(prev => prev + key);
        inputRef.current?.focus();
    };

    const handleKeyboardBackspace = () => {
        setInput(prev => prev.slice(0, -1));
        inputRef.current?.focus();
    };

    const { inputFontClass, inputDir } = useMemo(() => {
        switch (keyboardLayout) {
            case 'phoenician':
                return { inputFontClass: '[font-family:var(--font-phoenician)] text-lg', inputDir: 'rtl' as 'rtl' | 'ltr' };
            case 'punic':
                return { inputFontClass: '[font-family:var(--font-punic)] text-xl', inputDir: 'rtl' as 'rtl' | 'ltr' };
            case 'arabic':
                return { inputFontClass: 'font-sans text-lg', inputDir: 'rtl' as 'rtl' | 'ltr' };
            default:
                return { inputFontClass: 'font-sans text-base', inputDir: 'ltr' as 'rtl' | 'ltr' };
        }
    }, [keyboardLayout]);

    const renderMessage = (msg: ChatMessage) => {
        const isUser = msg.sender === 'user';
        const { phoenician, hint } = isUser ? { phoenician: msg.text, hint: '' } : parseAiResponse(msg.text);

        const aiFontClass = scriptMode === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)] text-xl' : '[font-family:var(--font-phoenician)] text-lg';
        
        // For user messages, try to detect if it's a Phoenician/Punic or RTL script to apply the correct font and direction.
        const isPhoenicianScript = /[\u10900-\u1091F]/.test(msg.text);
        const isRtlScript = isPhoenicianScript || /[\u0600-\u06FF]/.test(msg.text); // Check for Phoenician or Arabic characters
        const userMessageFontClass = isPhoenicianScript ? aiFontClass : 'font-sans';
        const userMessageDir = isRtlScript ? 'rtl' : 'ltr';

        return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <div dir={isUser ? userMessageDir : 'rtl'} className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isUser ? 'bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)] rounded-br-none' : 'bg-[color:var(--color-surface-solid)] text-[color:var(--color-text)] rounded-bl-none'}`}>
                    <p className={`${isUser ? userMessageFontClass : aiFontClass} leading-tight`}>{isUser ? msg.text : phoenician}</p>
                    {hint && <p dir={uiLang === 'ar' ? 'rtl' : 'ltr'} lang={uiLang} className="text-xs text-[color:var(--color-text-muted)] italic mt-2">{hint}</p>}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center z-50`} onClick={onClose}>
                <div 
                    className={`glass-panel w-full sm:max-w-lg h-[90vh] sm:h-[80vh] max-h-[700px] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ${isKeyboardOpen ? 'mb-[270px] sm:mb-0' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-semibold text-[color:var(--color-primary)]">
                                {scriptMode === PhoenicianDialect.PUNIC ? t('chatHeaderPunic') : t('chatHeaderPhoenician')}
                            </h2>
                            <p className="text-xs text-[color:var(--color-text-muted)]">{t('chatSubheader')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           <ScriptModeToggle scriptMode={scriptMode} setScriptMode={setScriptMode} t={t} />
                           <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors p-1" aria-label={t('chatClose')}>
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(renderMessage)}
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
                        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={scriptMode === PhoenicianDialect.PUNIC ? t('chatPlaceholderPunic') : t('chatPlaceholderPhoenician')}
                                className={`flex-1 bg-transparent text-[color:var(--color-text)] border border-[color:var(--color-border)] rounded-full py-2 px-4 focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)] ${inputFontClass}`}
                                disabled={isAiThinking}
                                autoFocus
                                dir={inputDir}
                            />
                             <button
                                type="button"
                                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                                className="p-3 rounded-full text-[color:var(--color-primary)] bg-transparent border border-[color:var(--color-border)] hover:bg-white/10 disabled:opacity-50"
                                aria-label={isKeyboardOpen ? t('keyboardClose') : t('keyboardOpen')}
                                title={isKeyboardOpen ? t('keyboardClose') : t('keyboardOpen')}
                            >
                                <KeyboardIcon className="w-5 h-5" />
                            </button>
                            <button type="submit" disabled={!input.trim() || isAiThinking} className="p-3 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_10px_var(--color-glow)]">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </form>
                    </footer>
                </div>
            </div>
            <Keyboard
                isOpen={isKeyboardOpen}
                sourceLang={Language.PHOENICIAN}
                dialect={scriptMode}
                onKeyPress={handleKeyboardKeyPress}
                onBackspace={handleKeyboardBackspace}
                onClose={() => setIsKeyboardOpen(false)}
                onEnter={sendMessage}
                t={t}
                onLayoutChange={setKeyboardLayout}
            />
        </>
    );
};

export default ChatModal;
