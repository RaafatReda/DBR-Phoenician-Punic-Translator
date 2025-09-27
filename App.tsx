
import React, { useState, useCallback, useEffect, useRef, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { Language, PhoenicianDialect, SavedTranslation, TransliterationMode, TransliterationOutput, GrammarToken, Cognate, AIAssistantResponse } from './types';
import { translateText, comparePhoenicianDialects, getTranslationHintsFromImage } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import DialectSelector from './components/DialectSelector';
import TextArea from './components/TextArea';
import Loader from './components/Loader';
import SavedTranslationsModal from './components/SavedTranslationsModal';
import HistoryIcon from './components/icons/HistoryIcon';
import BookmarkIcon from './components/icons/BookmarkIcon';
import MicrophoneIcon from './components/icons/MicrophoneIcon';
import ScriptDisplay from './components/CopticScriptDisplay';
import ComparisonModeToggle from './components/ComparisonModeToggle';
import ComparisonResultCard from './components/ComparisonResultCard';
import TransliterationSelector from './components/TransliterationSelector';
import GrammarHelperToggle from './components/GrammarHelperToggle';
import GrammarHighlightedText from './components/GrammarHighlightedText';
import GrammarInfoPanel from './components/GrammarInfoPanel';
import Keyboard from './components/Keyboard';
import KeyboardIcon from './components/icons/KeyboardIcon';
import HandwritingCanvas from './components/HandwritingCanvas';
import PencilIcon from './components/icons/PencilIcon';
import CameraIcon from './components/icons/CameraIcon';
import ThemeToggle from './components/ThemeToggle';
import ManualModal from './components/ManualModal';
import CopyIcon from './components/icons/CopyIcon';
import CheckIcon from './components/icons/CheckIcon';
import { getFlagForLanguage } from './lib/languageUtils';
import ChatFAB from './components/ChatFAB';
import ChatModal from './components/ChatModal';
import DailyPhoenicianWord from './components/DailyPhoenicianWord';
import Autocomplete from './components/Autocomplete';
import { englishDictionary } from './lib/englishDictionary';
import { arabicDictionary } from './lib/arabicDictionary';
import { frenchDictionary } from './lib/frenchDictionary';
import { spanishDictionary } from './lib/spanishDictionary';
import { italianDictionary } from './lib/italianDictionary';
import { chineseDictionary } from './lib/chineseDictionary';
import { japaneseDictionary } from './lib/japaneseDictionary';
import { turkishDictionary } from './lib/turkishDictionary';
import { germanDictionary } from './lib/germanDictionary';
import { greekDictionary } from './lib/greekDictionary';
import { phoenicianDictionary } from './lib/phoenicianDictionary';
import { transliterationMap } from './lib/phoenicianTransliteration';
import PhoenicianDictionaryModal from './components/PhoenicianDictionaryModal';
import { translations, UILang } from './lib/i18n';
import LayoutEditIcon from './components/icons/LayoutEditIcon';
import GroupEditCanvas from './components/GroupEditCanvas';
import FontSizeIcon from './components/icons/FontSizeIcon';
import FontSizeManager from './components/FontSizeManager';
import LanguageSwitcher from './components/LanguageSwitcher';
import CognateComparisonToggle from './components/CognateComparisonToggle';
import CognateDisplay from './components/CognateDisplay';
import CameraExperience from './components/CameraExperience';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import SpeakerIcon from './components/icons/SpeakerIcon';
import AIAssistantModal from './components/AIAssistantModal';
import SparklesIcon from './components/icons/SparklesIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import LessonsPage from './components/LessonsPage';


// FIX: Add type definitions for the Web Speech API. This is necessary because the
// SpeechRecognition API is not yet a standard and types are not included in TypeScript by default.
// This resolves the "Cannot find name 'SpeechRecognition'" errors.
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

// Extend window type for SpeechRecognition and experimental APIs
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
    html2canvas: any;
    jspdf: any;
  }
}

type Theme = 'light' | 'dark' | 'papyrus';
type FontSize = 'small' | 'medium' | 'large';

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.PHOENICIAN);
  const [phoenicianDialect, setPhoenicianDialect] = useState<PhoenicianDialect>(PhoenicianDialect.STANDARD_PHOENICIAN);
  const [sourceText, setSourceText] = useState<string>('');
  const [translationResult, setTranslationResult] = useState<string | TransliterationOutput>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(false);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const { speak, cancel, isSpeaking, supported: isTtsSupported } = useSpeechSynthesis();

  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [comparisonResults, setComparisonResults] = useState<Record<string, TransliterationOutput> | null>(null);
  // FIX: Corrected typo in TransliterationMode enum from PHOENICIAN to PHOENician.
  const [transliterationMode, setTransliterationMode] = useState<TransliterationMode>(TransliterationMode.PHOENician);
  const [isGrammarHelperOn, setIsGrammarHelperOn] = useState<boolean>(false);
  const [isCognateComparisonOn, setIsCognateComparisonOn] = useState<boolean>(false);
  const [selectedGrammarToken, setSelectedGrammarToken] = useState<GrammarToken | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [isHandwritingCanvasOpen, setIsHandwritingCanvasOpen] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('dbr-translator-theme') as Theme) || 'dark';
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [uiLang, setUiLang] = useState<UILang>(() => {
    return (localStorage.getItem('dbr-translator-lang') as UILang) || 'en';
  });
  const [isGroupEditMode, setIsGroupEditMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('dbr-translator-fontsize') as FontSize) || 'medium';
  });
  const [isFontSizeManagerOpen, setIsFontSizeManagerOpen] = useState(false);
  const [isCameraExperienceOpen, setIsCameraExperienceOpen] = useState<boolean>(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState<boolean>(false);
  const [isLessonsPageOpen, setIsLessonsPageOpen] = useState<boolean>(false);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[uiLang]?.[key] || translations.en[key];
  }, [uiLang]);

  const sourceTextAreaRef = useRef<HTMLDivElement>(null);
  const comparisonTextAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dbr-translator-translations');
      if (stored) {
        setSavedTranslations(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load saved translations.", e);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dbr-translator-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('dbr-translator-lang', uiLang);
  }, [uiLang]);

  useEffect(() => {
    const sizeMap: Record<FontSize, string> = {
      small: '85%',
      medium: '100%',
      large: '115%',
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
    localStorage.setItem('dbr-translator-fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsFontSizeManagerOpen(false);
    };
    if (isFontSizeManagerOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isFontSizeManagerOpen]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      speechRecognition.current = recognition;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(t('speechError') + `: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setSourceText(transcript);
      };
    } else {
      console.warn("Speech Recognition API not supported by this browser.");
      setIsSpeechRecognitionSupported(false);
    }

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.abort();
      }
    };
  }, [t]);

  useEffect(() => {
    try {
      localStorage.setItem('dbr-translator-translations', JSON.stringify(savedTranslations));
    } catch (e) {
      console.error("Could not save translations.", e);
    }
  }, [savedTranslations]);
  
  useEffect(() => {
    if (isKeyboardOpen) {
        // Delay scrolling to allow keyboard animation and layout shift to complete
        setTimeout(() => {
            const activeRef = isComparisonMode ? comparisonTextAreaRef : sourceTextAreaRef;
            activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
  }, [isKeyboardOpen, isComparisonMode]);

  useEffect(() => {
    if (!sourceText.trim()) {
      setSuggestions([]);
      return;
    }

    let dictionary: string[] = [];
    let searchTerm = '';
    const isCJK = sourceLang === Language.CHINESE || sourceLang === Language.JAPANESE;

    switch (sourceLang) {
      case Language.ENGLISH: dictionary = englishDictionary; break;
      case Language.ARABIC: dictionary = arabicDictionary; break;
      case Language.FRENCH: dictionary = frenchDictionary; break;
      case Language.SPANISH: dictionary = spanishDictionary; break;
      case Language.ITALIAN: dictionary = italianDictionary; break;
      case Language.TURKISH: dictionary = turkishDictionary; break;
      case Language.CHINESE: dictionary = chineseDictionary; break;
      case Language.JAPANESE: dictionary = japaneseDictionary; break;
      case Language.GREEK: dictionary = greekDictionary; break;
      case Language.GERMAN: dictionary = germanDictionary; break;
      case Language.PHOENICIAN: dictionary = phoenicianDictionary; break;
      case Language.PUNIC: dictionary = phoenicianDictionary; break;
      default: break;
    }

    if (sourceLang === Language.PHOENICIAN || sourceLang === Language.PUNIC) {
        searchTerm = sourceText.split(/[\s,.]+/).pop() || '';
    } else if (isCJK) {
      searchTerm = sourceText.trim().toLowerCase();
    } else {
      searchTerm = sourceText.split(/[\s,.]+/).pop()?.toLowerCase() || '';
    }

    if (dictionary.length > 0 && searchTerm.length > 0) {
      const newSuggestions = dictionary
        .filter(word => {
            if (sourceLang === Language.PHOENICIAN || sourceLang === Language.PUNIC) {
                return word.startsWith(searchTerm);
            }
            return word.toLowerCase().startsWith(searchTerm)
        })
        .slice(0, 5);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [sourceText, sourceLang]);

  const handleSuggestionSelect = (suggestion: string) => {
    let newText = '';
    const isCJK = sourceLang === Language.CHINESE || sourceLang === Language.JAPANESE;

    if (isCJK) {
      newText = suggestion;
    } else {
      const parts = sourceText.trim().split(' ');
      parts[parts.length - 1] = suggestion;
      newText = parts.join(' ') + ' ';
    }

    setSourceText(newText);
    setSuggestions([]);
    setTimeout(() => {
      const textarea = sourceTextAreaRef.current?.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = newText.length;
      }
    }, 0);
  };

  const handleSwapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (sourceText.trim()) {
        const newSourceText = typeof translationResult === 'string' ? translationResult : translationResult.phoenician;
        setSourceText(newSourceText);
        setTranslationResult(sourceText);
    }
  }, [sourceLang, targetLang, sourceText, translationResult]);

  const handleSourceLangChange = (lang: Language) => {
    if (lang === targetLang) {
      handleSwapLanguages();
    } else {
      setSourceLang(lang);
      if (lang === Language.PUNIC) {
        setPhoenicianDialect(PhoenicianDialect.PUNIC);
      } else if (lang === Language.PHOENICIAN) {
        setPhoenicianDialect(PhoenicianDialect.STANDARD_PHOENICIAN);
      }
    }
  };

  const handleTargetLangChange = (lang: Language) => {
    if (lang === sourceLang) {
      handleSwapLanguages();
    } else {
      setTargetLang(lang);
      if (lang === Language.PUNIC) {
        setPhoenicianDialect(PhoenicianDialect.PUNIC);
      } else if (lang === Language.PHOENICIAN) {
        setPhoenicianDialect(PhoenicianDialect.STANDARD_PHOENICIAN);
      }
    }
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'papyrus';
      return 'light'; // papyrus -> light
    });
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
  };
  
  const handleTranslate = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim() || isLoading) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSelectedGrammarToken(null);
    setSuggestions([]);
    setIsGroupEditMode(false);
    
    const effectiveSourceLang = sourceLang === Language.PUNIC ? Language.PHOENICIAN : sourceLang;
    const effectiveTargetLang = targetLang === Language.PUNIC ? Language.PHOENICIAN : targetLang;
    let effectiveDialect = phoenicianDialect;
    if (sourceLang === Language.PUNIC || targetLang === Language.PUNIC) {
        effectiveDialect = PhoenicianDialect.PUNIC;
    }

    try {
      if (isComparisonMode) {
        const results = await comparePhoenicianDialects(textToTranslate, effectiveDialect);
        setComparisonResults(results);
        setTranslationResult('');
      } else {
        const result = await translateText(textToTranslate, effectiveSourceLang, effectiveTargetLang, effectiveDialect, isCognateComparisonOn);
        setTranslationResult(result);
        setComparisonResults(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      setError(errorMessage);
      setTranslationResult('');
      setComparisonResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [sourceLang, targetLang, phoenicianDialect, isComparisonMode, isLoading, t, isCognateComparisonOn]);
  
  useEffect(() => {
    if (!sourceText.trim()) {
        setTranslationResult('');
        setComparisonResults(null);
        setError(null);
        setSelectedGrammarToken(null);
        setIsGroupEditMode(false);
    }
  }, [sourceText]);

  const handleSourceTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
  };

  const handleSourceKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (![Language.PHOENICIAN, Language.PUNIC].includes(sourceLang) || e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    const key = e.key;
    if (key.length > 1) { // Allow special keys like Backspace, Enter, Arrow keys
      return;
    }

    if (transliterationMap[key]) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = sourceText.substring(0, start) + transliterationMap[key] + sourceText.substring(end);
      setSourceText(newText);
      
      // Move cursor after inserted character
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };


  const getLangCode = (lang: Language): string => {
    switch (lang) {
      case Language.ENGLISH: return 'en-US';
      case Language.ARABIC: return 'ar-SA';
      case Language.FRENCH: return 'fr-FR';
      case Language.SPANISH: return 'es-ES';
      case Language.ITALIAN: return 'it-IT';
      case Language.CHINESE: return 'zh-CN';
      case Language.JAPANESE: return 'ja-JP';
      case Language.TURKISH: return 'tr-TR';
      case Language.GREEK: return 'el-GR';
      case Language.GERMAN: return 'de-DE';
      case Language.PHOENICIAN: return 'en-US'; // No speech recognition for Phoenician, default to English
      case Language.PUNIC: return 'en-US'; // No speech recognition for Punic, default to English
      default: return 'en-US';
    }
  };

  const getLangCodeForTTS = (lang: Language): string => {
    switch (lang) {
      case Language.ENGLISH: return 'en-US';
      case Language.FRENCH: return 'fr-FR';
      case Language.ARABIC: return 'ar-SA';
      case Language.SPANISH: return 'es-ES';
      case Language.ITALIAN: return 'it-IT';
      case Language.GERMAN: return 'de-DE';
      case Language.CHINESE: return 'zh-CN';
      case Language.JAPANESE: return 'ja-JP';
      case Language.GREEK: return 'el-GR';
      case Language.TURKISH: return 'tr-TR';
      default: return 'en-US';
    }
  };

  const handleToggleListen = () => {
    if (!speechRecognition.current || sourceLang === Language.PHOENICIAN || sourceLang === Language.PUNIC) return;

    if (isListening) {
      speechRecognition.current.stop();
    } else {
      setSourceText('');
      setTranslationResult('');
      setError(null);
      speechRecognition.current.lang = getLangCode(sourceLang);
      try {
        speechRecognition.current.start();
      } catch (e) {
        console.error("Could not start speech recognition", e);
        setError(t('micError'));
      }
    }
  };
  
  const handleKeyboardKeyPress = (key: string) => {
    setSourceText(prev => prev + key);
  };

  const handleKeyboardBackspace = () => {
    setSourceText(prev => prev.slice(0, -1));
  };
  
  const handleHandwritingRecognized = (text: string) => {
    setSourceText(prev => prev + text);
    setIsHandwritingCanvasOpen(false);
  };
  
  const isPhoenicianFamilySelected = sourceLang === Language.PHOENICIAN || targetLang === Language.PHOENICIAN || sourceLang === Language.PUNIC || targetLang === Language.PUNIC;
  
  const currentTranslatedTextString = useMemo(() => {
    if (typeof translationResult === 'string') {
        return translationResult;
    }
    if (transliterationMode === TransliterationMode.BOTH) {
      return `${translationResult.phoenician}\n(${translationResult.latin})\n(${translationResult.arabic})`;
    }
    const key = (transliterationMode.toLowerCase()) as keyof TransliterationOutput;
    const value = translationResult[key];
    return typeof value === 'string' ? value || translationResult.phoenician : translationResult.phoenician;
  }, [translationResult, transliterationMode]);


  const isCurrentTranslationSaved = useMemo(() => {
    if (!sourceText.trim() || !translationResult) return false;
    const translatedTextToCompare = typeof translationResult === 'string' ? translationResult : translationResult.phoenician;

    return savedTranslations.some(t => {
        const savedTranslatedText = typeof t.translatedText === 'string' ? t.translatedText : t.translatedText.phoenician;
        return t.sourceText === sourceText && savedTranslatedText === translatedTextToCompare;
    });
  }, [savedTranslations, sourceText, translationResult]);

  const handleSaveTranslation = () => {
    if (!sourceText.trim() || !translationResult || isCurrentTranslationSaved) return;
    
    let dialectForSaving: PhoenicianDialect | undefined = undefined;
    if(isPhoenicianFamilySelected){
      if(sourceLang === Language.PUNIC || targetLang === Language.PUNIC){
        dialectForSaving = PhoenicianDialect.PUNIC;
      } else {
        dialectForSaving = phoenicianDialect;
      }
    }

    const newTranslation: SavedTranslation = {
      id: `${Date.now()}-${sourceText.slice(0, 10)}`,
      sourceLang,
      targetLang,
      sourceText,
      translatedText: translationResult,
      dialect: dialectForSaving,
    };

    setSavedTranslations(prev => [newTranslation, ...prev]);
  };

  const handleDeleteTranslation = (id: string) => {
    setSavedTranslations(prev => prev.filter(t => t.id !== id));
  };
  
  const handleClearAll = () => {
    setSavedTranslations([]);
    setIsModalOpen(false);
  };

  const handleUpdateNote = (id: string, notes: string) => {
    setSavedTranslations(prev => 
        prev.map(t => t.id === id ? { ...t, notes } : t)
    );
  };

  const handleCopyText = () => {
    if (!currentTranslatedTextString) return;

    navigator.clipboard.writeText(currentTranslatedTextString).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        setError(t('copyError'));
    });
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
      return;
    }
    if (!translationResult) return;
  
    let textToSpeak = '';
    let langCode = '';
  
    const isTargetPhoenicianFamily = targetLang === Language.PHOENICIAN || targetLang === Language.PUNIC;
  
    if (typeof translationResult === 'object' && 'phoenician' in translationResult && isTargetPhoenicianFamily) {
      textToSpeak = translationResult.latin; // Read the Latin transliteration
      // Use Hebrew as a phonetic proxy for a Semitic language. Ar-SA is another option.
      langCode = 'he-IL'; 
    } else if (typeof translationResult === 'string') {
      textToSpeak = translationResult;
      langCode = getLangCodeForTTS(targetLang);
    }
  
    if (textToSpeak && langCode) {
      speak(textToSpeak, langCode);
    }
  };

  const handleDictionaryWordSelect = (word: string) => {
    setSourceText(prev => (prev ? `${prev.trim()} ${word}` : word).trim());
    setIsDictionaryOpen(false);
    setTimeout(() => {
        sourceTextAreaRef.current?.querySelector('textarea')?.focus();
    }, 0);
  };
  
  const handleApplyAssistantChanges = (newTranslation: TransliterationOutput) => {
    setTranslationResult(newTranslation);
    setIsAssistantModalOpen(false);
  };

  const isMicDisabled = !isSpeechRecognitionSupported || sourceLang === Language.PHOENICIAN || sourceLang === Language.PUNIC;
  const micButtonTitle = isListening ? t('micStop') : isMicDisabled ? t('micNotAvailable') : t('micStart');
    
  const hasPhoenicianResult = !isComparisonMode && (targetLang === Language.PHOENICIAN || targetLang === Language.PUNIC) && typeof translationResult === 'object' && translationResult.phoenician;
  
  // FIX: Corrected typo in TransliterationMode enum from PHOENICIAN to PHOENician.
  const showGrammarUI = isGrammarHelperOn && hasPhoenicianResult && transliterationMode === TransliterationMode.PHOENician && typeof translationResult === 'object' && !!translationResult.grammar;

  const showPhoenicianControls = (!isComparisonMode && isPhoenicianFamilySelected) || isComparisonMode;
  const targetLangIsPhoenicianFamily = !isComparisonMode && (targetLang === Language.PHOENICIAN || targetLang === Language.PUNIC);

  const isPunicTranslation = !isComparisonMode && (targetLang === Language.PUNIC || (targetLang === Language.PHOENICIAN && phoenicianDialect === PhoenicianDialect.PUNIC));
  const resultFontClass = isPunicTranslation ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';

  const isPhoenicianSource = sourceLang === Language.PHOENICIAN || sourceLang === Language.PUNIC;
  const isPunicInput = sourceLang === Language.PUNIC || (sourceLang === Language.PHOENICIAN && phoenicianDialect === PhoenicianDialect.PUNIC);
  const sourceInputFontClass = isPhoenicianSource 
    ? (isPunicInput ? '[font-family:var(--font-punic)] text-2xl' : '[font-family:var(--font-phoenician)] text-xl') 
    : '';

  const comparisonInputFontClass = phoenicianDialect === PhoenicianDialect.PUNIC 
    ? '[font-family:var(--font-punic)] text-2xl' 
    : '[font-family:var(--font-phoenician)] text-xl';
  
  const iconContainerClasses = `absolute top-3 z-10 flex space-x-1 ${targetLangIsPhoenicianFamily ? 'left-3' : 'right-3'}`;
  const resultPaddingClass = targetLangIsPhoenicianFamily ? 'pl-44' : 'pr-44';

  const actionButton = (
    <div className="w-full max-w-5xl mt-8 flex justify-center">
      <button
        onClick={() => handleTranslate(sourceText)}
        disabled={isLoading || !sourceText.trim()}
        className="flex items-center justify-center w-full max-w-xs px-6 py-3.5 text-lg font-semibold text-[color:var(--color-bg-start)] bg-[color:var(--color-primary)] rounded-[var(--border-radius)] shadow-[var(--shadow-md)] hover:shadow-[0_0_20px_var(--color-glow)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none transition-all duration-200"
      >
        {isLoading ? <Loader className="w-6 h-6 mr-2" /> : null}
        {isLoading
          ? isComparisonMode
            ? t('comparing')
            : t('translating')
          : isComparisonMode
          ? t('compareVariants')
          : t('translate')}
      </button>
    </div>
  );

  return (
    <>
      <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 transition-all duration-300 ${isKeyboardOpen ? 'pb-80 sm:pb-72' : ''}`}>
        <header className="w-full max-w-5xl flex justify-between items-start mb-10">
          <div className="flex-1 flex justify-start items-center">
            <div className="glass-panel rounded-full p-1 flex items-center">
                <LanguageSwitcher currentLang={uiLang} onChangeLang={setUiLang} />
                <div className="w-px h-5 bg-[color:var(--color-border)] mx-1"></div>
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} t={t} />
                <div className="w-px h-5 bg-[color:var(--color-border)] mx-1"></div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFontSizeManagerOpen(prev => !prev);
                    }}
                    className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] focus:outline-none transition-colors"
                    aria-label={t('fontSizeManagerTitle')}
                    title={t('fontSizeManagerTitle')}
                  >
                    <FontSizeIcon className="w-5 h-5" />
                  </button>
                  {isFontSizeManagerOpen && (
                    <FontSizeManager
                      currentSize={fontSize}
                      onSizeChange={handleFontSizeChange}
                      t={t}
                    />
                  )}
                </div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-8xl sm:text-9xl font-bold [font-family:var(--font-punic)] text-[color:var(--color-primary)] leading-tight animate-pulse [animation-duration:3s]">
              𐤃𐤁𐤓
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--color-text)] [font-family:var(--font-serif)] -mt-2 sm:-mt-3 tracking-wider">
              {t('mainTitle')}
            </h2>
            <p className="text-[color:var(--color-text-muted)] mt-4 mb-6 max-w-md mx-auto">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-1 flex-wrap">
             <button
              onClick={() => setIsManualModalOpen(true)}
              className="p-3 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-colors"
              aria-label={t('manualTitle')}
              title={t('manualTitle')}
            >
              <span className="[font-family:var(--font-phoenician)] text-2xl font-bold w-6 h-6 flex items-center justify-center">𐤀</span>
            </button>
            <button
                onClick={() => setIsLessonsPageOpen(true)}
                className="p-3 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-colors"
                aria-label={t('lessonsTitle')}
                title={t('lessonsTitle')}
            >
                <BookOpenIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => setIsDictionaryOpen(true)}
                className="p-3 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-colors"
                aria-label={t('dictionaryTitle')}
                title={t('dictionaryTitle')}
            >
                <span className="text-2xl w-6 h-6 flex items-center justify-center" aria-hidden="true">🕮</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-colors"
              aria-label={t('savedTranslationsTitle')}
              title={t('savedTranslationsTitle')}
            >
              <HistoryIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="w-full flex-grow flex flex-col items-center">
          <div className="w-full max-w-5xl flex flex-col items-center mb-8 space-y-6">
            <ComparisonModeToggle
              isComparisonMode={isComparisonMode}
              onToggle={() => setIsComparisonMode(prev => !prev)}
              isDisabled={isLoading}
              t={t}
            />
            <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-4">
              {showPhoenicianControls && (
                  <GrammarHelperToggle 
                    isGrammarHelperOn={isGrammarHelperOn}
                    onToggle={() => setIsGrammarHelperOn(prev => !prev)}
                    isDisabled={isLoading}
                    t={t}
                  />
              )}
              {targetLangIsPhoenicianFamily && (
                 <CognateComparisonToggle
                    isCognateComparisonOn={isCognateComparisonOn}
                    onToggle={() => setIsCognateComparisonOn(prev => !prev)}
                    isDisabled={isLoading}
                    t={t}
                  />
              )}
              {showPhoenicianControls && (
                  <TransliterationSelector 
                      currentMode={transliterationMode}
                      onModeChange={setTransliterationMode}
                      isDisabled={isLoading}
                      t={t}
                      dialect={phoenicianDialect}
                  />
              )}
            </div>
          </div>
          
          {!isComparisonMode ? (
            <>
              <div className="w-full max-w-5xl mb-6">
                <LanguageSelector
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                  onSourceLangChange={handleSourceLangChange}
                  onTargetLangChange={handleTargetLangChange}
                  onSwap={handleSwapLanguages}
                  isLoading={isLoading}
                  t={t}
                />
              </div>
              
              {(sourceLang === Language.PHOENICIAN || targetLang === Language.PHOENICIAN) && !isComparisonMode && (
                  <div className="w-full max-w-xs mx-auto mb-8">
                      <DialectSelector
                          selectedDialect={phoenicianDialect}
                          onDialectChange={setPhoenicianDialect}
                          isDisabled={isLoading}
                          t={t}
                      />
                  </div>
              )}


              <div className="w-full max-w-5xl flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div ref={sourceTextAreaRef} className="relative">
                  <TextArea
                    id="source-text"
                    value={sourceText}
                    onChange={handleSourceTextChange}
                    onKeyDown={handleSourceKeyDown}
                    placeholder={`${t('enterTextPlaceholder')} ${t(sourceLang.toLowerCase())}... ${getFlagForLanguage(sourceLang)}`}
                    className={`${isPhoenicianSource ? 'pl-24' : 'pr-24'} ${sourceInputFontClass}`}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                    iconPosition={isPhoenicianSource ? 'left' : 'right'}
                  >
                     <div className="grid grid-cols-2 gap-2">
                         {isProcessingImage ? (
                            <div className="col-span-2 row-span-2 flex items-center justify-center p-2">
                                <Loader className="w-5 h-5 text-[color:var(--color-primary)] animate-spin" />
                            </div>
                         ) : (
                             <>
                                <button
                                  onClick={() => setIsCameraExperienceOpen(true)}
                                  disabled={isLoading}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                  aria-label={t('textScannerTitle')}
                                  title={t('textScannerTitle')}
                                >
                                  <CameraIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setIsHandwritingCanvasOpen(true)}
                                  disabled={isLoading}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                  aria-label={t('handwritingTitle')}
                                  title={t('handwritingTitle')}
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                                    disabled={isLoading}
                                    className="p-2 rounded-full text-[color:var(--color-primary)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                    aria-label={isKeyboardOpen ? t('keyboardClose') : t('keyboardOpen')}
                                    title={isKeyboardOpen ? t('keyboardClose') : t('keyboardOpen')}
                                >
                                    <KeyboardIcon className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={handleToggleListen}
                                  disabled={isLoading || isMicDisabled}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110"
                                  aria-label={micButtonTitle}
                                  title={micButtonTitle}
                                >
                                  <MicrophoneIcon className="w-5 h-5" isListening={isListening} />
                                </button>
                             </>
                         )}
                    </div>
                  </TextArea>
                  {suggestions.length > 0 && (
                    <Autocomplete
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      lang={sourceLang}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                      <div className={iconContainerClasses}>
                        {currentTranslatedTextString && !isGroupEditMode && (
                          <>
                              {hasPhoenicianResult && (
                                <button
                                  onClick={() => setIsAssistantModalOpen(true)}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] bg-[color:var(--color-surface-solid)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110"
                                  aria-label={t('aiAssistantTitle')}
                                  title={t('aiAssistantTitle')}
                                >
                                  <SparklesIcon className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                  onClick={handleSpeak}
                                  disabled={!isTtsSupported}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] bg-[color:var(--color-surface-solid)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110 disabled:text-gray-600 disabled:cursor-not-allowed"
                                  aria-label={isSpeaking ? t('stopSpeaking') : t('speakTranslation')}
                                  title={isTtsSupported ? (isSpeaking ? t('stopSpeaking') : t('speakTranslation')) : t('ttsNotSupported')}
                              >
                                  <SpeakerIcon className="w-5 h-5" isSpeaking={isSpeaking} />
                              </button>
                              {hasPhoenicianResult && (
                                  <button
                                      onClick={() => setIsGroupEditMode(true)}
                                      className="p-2 rounded-full text-[color:var(--color-primary)] bg-[color:var(--color-surface-solid)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110"
                                      aria-label={t('layoutEditTitle')}
                                      title={t('layoutEditTitle')}
                                  >
                                      <LayoutEditIcon className="w-5 h-5" />
                                  </button>
                              )}
                              <button
                                  onClick={handleCopyText}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] bg-[color:var(--color-surface-solid)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110"
                                  aria-label={isCopied ? t('copySuccess') : t('copyTitle')}
                                  title={isCopied ? t('copySuccess') : t('copyTitle')}
                                >
                                  {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                              </button>
                              <button
                                  onClick={handleSaveTranslation}
                                  disabled={isCurrentTranslationSaved}
                                  className="p-2 rounded-full text-[color:var(--color-primary)] disabled:text-gray-500 disabled:cursor-not-allowed bg-[color:var(--color-surface-solid)] hover:bg-white/10 focus:outline-none transition-all duration-200 hover:scale-110"
                                  aria-label={isCurrentTranslationSaved ? t('saveSuccess') : t('saveTitle')}
                                  title={isCurrentTranslationSaved ? t('saveSuccess') : t('saveTitle')}
                              >
                                  <BookmarkIcon className="w-5 h-5" isFilled={isCurrentTranslationSaved} />
                              </button>
                          </>
                        )}
                      </div>
                      
                      {isGroupEditMode && typeof translationResult === 'object' && translationResult.grammar ? (
                          <GroupEditCanvas
                              translationResult={translationResult}
                              dialect={phoenicianDialect}
                              onExit={() => setIsGroupEditMode(false)}
                              t={t}
                          />
                      ) : showGrammarUI ? (
                          <div className="w-full min-h-[10rem] glass-panel rounded-[var(--border-radius)] text-[color:var(--color-text)] transition-shadow duration-200 flex flex-col shadow-lg">
                              <div className={`p-4 ${resultPaddingClass}`} dir="rtl">
                                  <GrammarHighlightedText
                                      grammar={(translationResult as TransliterationOutput).grammar!}
                                      className={`${resultFontClass} ${isPunicTranslation ? 'text-3xl' : 'text-2xl'}`}
                                      selectedToken={selectedGrammarToken}
                                      onTokenClick={setSelectedGrammarToken}
                                  />
                              </div>
                              <div className="flex-shrink-0 border-t border-[color:var(--color-border)]">
                                  <GrammarInfoPanel token={selectedGrammarToken} t={t} uiLang={uiLang} />
                              </div>
                          </div>
                      ) : (hasPhoenicianResult && transliterationMode === TransliterationMode.BOTH && typeof translationResult === 'object') ? (
                          <div className={`w-full min-h-[10rem] p-4 ${resultPaddingClass} glass-panel rounded-[var(--border-radius)] text-[color:var(--color-text)] flex flex-col justify-center items-center text-center`}>
                              <p className={`${resultFontClass} ${isPunicTranslation ? 'text-4xl' : 'text-3xl'} mb-2`} dir="rtl">
                                  {translationResult.phoenician}
                              </p>
                              <p className="text-md text-[color:var(--color-text-muted)]">
                                  {translationResult.latin}
                              </p>
                              <p className="text-xl text-[color:var(--color-text-muted)] mt-1" dir="rtl">
                                  {translationResult.arabic}
                              </p>
                          </div>
                      ) : (
                          <TextArea
                              id="translated-text"
                              value={currentTranslatedTextString}
                              placeholder={t('translationPlaceholder')}
                              isReadOnly={true}
                              // FIX: Corrected typo in TransliterationMode enum from PHOENICIAN to PHOENician.
                              className={`${resultPaddingClass} ${transliterationMode === TransliterationMode.PHOENician ? `${resultFontClass} ${isPunicTranslation ? 'text-3xl' : 'text-2xl'}` : ''}`}
                          />
                      )}
                      
                      {isLoading && !currentTranslatedTextString && (
                          <div className="absolute inset-0 flex items-center justify-center glass-panel rounded-[var(--border-radius)] text-[color:var(--color-primary)]">
                              <Loader className="w-8 h-8 mr-3" />
                              <span>{t('translating')}...</span>
                          </div>
                      )}
                  </div>
                  {hasPhoenicianResult && typeof translationResult === 'object' && !isGroupEditMode && !showGrammarUI && (
                    <div className="text-center text-[color:var(--color-text-muted)] papyrus-display p-2 rounded-lg text-base">
                      {(uiLang === 'en' || uiLang === 'fr') && <p>{translationResult.latin}</p>}
                      {uiLang === 'ar' && (
                        <>
                          <p>{translationResult.latin}</p>
                          <p dir="rtl">{translationResult.arabic}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {actionButton}

              {hasPhoenicianResult && !isLoading && (
                <ScriptDisplay 
                  result={translationResult as TransliterationOutput} 
                  mode={transliterationMode}
                  dialect={isPunicTranslation ? PhoenicianDialect.PUNIC : PhoenicianDialect.STANDARD_PHOENICIAN}
                  t={t}
                />
              )}
              
              {hasPhoenicianResult && !isLoading && isCognateComparisonOn && typeof translationResult === 'object' && (translationResult.hebrewCognate || translationResult.arabicCognate || translationResult.aramaicCognate) && (
                <CognateDisplay
                    result={translationResult}
                    t={t}
                />
              )}

              <DailyPhoenicianWord t={t} uiLang={uiLang} />
            </>
          ) : (
            <>
              <div className="w-full max-w-3xl flex flex-col items-center mb-6">
                <div className="w-full max-w-xs mx-auto mb-4">
                  <DialectSelector
                    selectedDialect={phoenicianDialect}
                    onDialectChange={setPhoenicianDialect}
                    isDisabled={isLoading}
                    t={t}
                  />
                </div>
                <div ref={comparisonTextAreaRef} className="w-full relative">
                  <TextArea
                    id="comparison-source-text"
                    value={sourceText}
                    onChange={handleSourceTextChange}
                    placeholder={`${t('enterTextPlaceholder')} ${t(phoenicianDialect === PhoenicianDialect.PUNIC ? 'punic' : 'standardPhoenician')}... ${getFlagForLanguage(Language.PHOENICIAN)}`}
                    className={comparisonInputFontClass}
                  />
                </div>
              </div>

              {actionButton}
              
              {isLoading && !comparisonResults && (
                  <div className="flex items-center justify-center text-[color:var(--color-primary)] my-8">
                      <Loader className="w-8 h-8 mr-3" />
                      <span>{t('comparingVariants')}...</span>
                  </div>
              )}

              {comparisonResults && (
                <div className="w-full max-w-5xl mt-8">
                  <h3 className="text-xl font-semibold text-[color:var(--color-text-muted)] mb-6 text-center">{t('comparisonResultsTitle')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(comparisonResults).map(([dialect, result]) => (
                      <ComparisonResultCard 
                        key={dialect} 
                        dialect={dialect as PhoenicianDialect} 
                        result={result} 
                        mode={transliterationMode}
                        isGrammarHelperOn={isGrammarHelperOn}
                        t={t}
                        uiLang={uiLang}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="w-full max-w-5xl mt-8">
            {error && (
              <div className="text-center p-3 glass-panel text-red-400 border border-red-400/50 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-[color:var(--color-text-muted)] text-sm opacity-70">
          <p>By Raafat Elmesallamy-2025</p>
          <p>{t('footerAllRightsReserved')}</p>
        </footer>
      </div>
      {isModalOpen && (
        <SavedTranslationsModal
          translations={savedTranslations}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteTranslation}
          onClearAll={handleClearAll}
          onUpdateNote={handleUpdateNote}
          theme={theme}
          t={t}
        />
      )}
      {isManualModalOpen && (
        <ManualModal onClose={() => setIsManualModalOpen(false)} t={t} uiLang={uiLang} />
      )}
       {isDictionaryOpen && (
        <PhoenicianDictionaryModal
            onClose={() => setIsDictionaryOpen(false)}
            onWordSelect={handleDictionaryWordSelect}
            t={t}
        />
      )}
      {isAssistantModalOpen && typeof translationResult === 'object' && (
        <AIAssistantModal
          isOpen={isAssistantModalOpen}
          onClose={() => setIsAssistantModalOpen(false)}
          onApply={handleApplyAssistantChanges}
          sourceText={sourceText}
          sourceLang={sourceLang}
          originalTranslation={translationResult}
          t={t}
          uiLang={uiLang}
        />
      )}
      {isCameraExperienceOpen && (
        <CameraExperience
            isOpen={isCameraExperienceOpen}
            onClose={() => setIsCameraExperienceOpen(false)}
            dialect={phoenicianDialect}
            t={t}
            uiLang={uiLang}
        />
      )}
       {isLessonsPageOpen && (
        <LessonsPage
            onClose={() => setIsLessonsPageOpen(false)}
            t={t}
            uiLang={uiLang}
        />
      )}
      <ChatFAB onOpen={() => setIsChatOpen(true)} t={t} />
      {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} t={t} uiLang={uiLang} />}
      <Keyboard
        isOpen={isKeyboardOpen}
        sourceLang={sourceLang}
        dialect={isPhoenicianFamilySelected ? phoenicianDialect : undefined}
        onKeyPress={handleKeyboardKeyPress}
        onBackspace={handleKeyboardBackspace}
        onClose={() => setIsKeyboardOpen(false)}
        onEnter={() => handleTranslate(sourceText)}
        t={t}
      />
      <HandwritingCanvas
        isOpen={isHandwritingCanvasOpen}
        onClose={() => setIsHandwritingCanvasOpen(false)}
        onRecognize={handleHandwritingRecognized}
        t={t}
      />
    </>
  );
};

export default App;