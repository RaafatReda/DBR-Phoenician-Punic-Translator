import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { UILang } from '../lib/i18n';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import CloseIcon from './icons/CloseIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SendIcon from './icons/SendIcon';
import Loader from './Loader';

// FIX: Add type definitions for the Web Speech API to resolve "Cannot find name 'SpeechRecognition'".
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any; // Using any for simplicity as SpeechGrammarList is not used.
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  serviceURI: string;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface KnowledgeTutorModalProps {
  onClose: () => void;
  t: (key: string) => string;
  uiLang: UILang;
}

const getSystemInstruction = (lang: UILang): string => {
  const languageName = lang === 'fr' ? 'French' : lang === 'ar' ? 'Arabic' : 'English';
  return `You are a world-class historian and linguist AI named Tanit, specializing in ancient Phoenician and Carthaginian cultures. Your purpose is to be an engaging, informative, and friendly knowledge hub.
RULES:
1.  **Language:** You MUST communicate exclusively in ${languageName}.
2.  **Persona:** Your name is Tanit. You are enthusiastic, knowledgeable, and eager to share information.
3.  **Source Material:** Base all your answers on established, academic historical and linguistic knowledge. Do not invent facts.
4.  **Topics:** You are an expert on Phoenician & Punic grammar, the history of Phoenicia, the history of Carthage, religion, iconography (like symbols), daily life, trade routes, and their influence on other cultures.
5.  **Interaction:** Keep answers conversational but concise. If a user asks a simple question, give a direct answer. If they ask a broad question, provide a summary and then ask a follow-up question to guide the conversation.
6.  **Conversation Starter:** Begin the conversation by introducing yourself as Tanit and welcoming the user.`;
};

const KnowledgeTutorModal: React.FC<KnowledgeTutorModalProps> = ({ onClose, t, uiLang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();
  const chat = useRef<Chat | null>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getLangCode = (lang: UILang): string => {
    if (lang === 'fr') return 'fr-FR';
    if (lang === 'ar') return 'ar-SA';
    return 'en-US';
  };

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLangCode(uiLang);
      speechRecognition.current = recognition;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => console.error('Speech recognition error:', event.error);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Automatically send the message after successful recognition
        sendMessage(transcript);
      };
    }
  }, [uiLang]);

  useEffect(() => {
    const initializeChat = async () => {
      setIsAiThinking(true);
      setMessages([]);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getSystemInstruction(uiLang)
            }
        });
        const initialResponse = await chat.current.sendMessage({ message: "Start the conversation." });
        setMessages([{ id: 'init', sender: 'ai', text: initialResponse.text }]);
        speak(initialResponse.text, getLangCode(uiLang));
      } catch (error) {
        console.error("Failed to initialize knowledge tutor:", error);
        setMessages([{ id: 'error-init', sender: 'ai', text: t('practiceChatErrorInit') }]);
      } finally {
        setIsAiThinking(false);
      }
    };
    initializeChat();
    
    // Cleanup function
    return () => {
        cancel(); // Stop any ongoing speech
        if(speechRecognition.current) {
            speechRecognition.current.abort();
        }
    };
  }, [t, uiLang, speak, cancel]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isAiThinking || !chat.current) return;

    if(isSpeaking) cancel();
    
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (input) setInput('');
    setIsAiThinking(true);

    try {
      const response = await chat.current.sendMessage({ message: messageText });
      const aiResponseText = response.text;
      const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
      speak(aiResponseText, getLangCode(uiLang));
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { id: `ai-error-${Date.now()}`, sender: 'ai', text: t('practiceChatErrorResponse') }]);
    } finally {
      setIsAiThinking(false);
    }
  };
  
  const handleToggleListen = () => {
    if (isSpeaking) cancel();
    
    if (isListening) {
      speechRecognition.current?.stop();
    } else {
      speechRecognition.current?.start();
    }
  };

  const orbClass = `w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 transition-all duration-500`;
  const orbAnimation = isListening ? 'animate-pulse' : 'animate-[orb-pulse-deep_5s_ease-in-out_infinite]';

  return (
    <div className="fixed inset-0 bg-[#0C0A1A]/80 backdrop-blur-lg z-50 flex flex-col items-center p-4" onClick={onClose}>
        <div className="w-full max-w-2xl h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex-shrink-0 text-right p-2">
                <button onClick={onClose} className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                    <CloseIcon className="w-7 h-7" />
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-end overflow-y-auto pb-4">
                 {messages.length <= 1 && !isAiThinking && (
                    <div className="text-center mb-8 animate-text-glow-fade-in">
                        <div className={`${orbClass} ${orbAnimation} mx-auto mb-6`}></div>
                        <h1 className="text-3xl font-bold text-white">{t('knowledgeHubWelcome')}</h1>
                        <p className="text-gray-300 mt-2 max-w-md">{t('knowledgeHubSub')}</p>
                    </div>
                )}
                
                <div className="w-full space-y-4 px-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 mt-1 flex items-center justify-center font-bold text-white text-lg">T</div>}
                            <div className={`px-4 py-3 rounded-2xl max-w-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isAiThinking && messages.length > 0 && (
                        <div className="flex items-start gap-3 flex-row">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 mt-1 flex items-center justify-center font-bold text-white text-lg">T</div>
                            <div className="px-4 py-3 rounded-2xl bg-gray-800 text-gray-200">
                                <Loader className="w-5 h-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>
            </main>
            
            <footer className="flex-shrink-0 w-full pt-4">
                <div className="flex items-center gap-3">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex-grow flex items-center bg-gray-800/50 border border-gray-600 rounded-full pr-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('knowledgeHubPlaceholder')}
                            className="flex-grow bg-transparent text-white placeholder-gray-400 px-5 py-3 focus:outline-none"
                            disabled={isAiThinking}
                        />
                         <button type="submit" disabled={!input.trim() || isAiThinking} className="p-2 rounded-full text-white disabled:text-gray-500">
                            <SendIcon className="w-6 h-6"/>
                        </button>
                    </form>
                    <button onClick={handleToggleListen} className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors duration-300 ${isListening ? 'bg-red-500' : 'bg-blue-600'}`} disabled={isAiThinking}>
                        <MicrophoneIcon className="w-7 h-7 text-white" isListening={isListening} />
                    </button>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default KnowledgeTutorModal;