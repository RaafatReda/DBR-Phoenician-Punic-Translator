import { Modality } from "@google/genai";

// FIX: Added all necessary type definitions that were missing from the project.
// This resolves numerous 'module has no exported member' and circular dependency errors across the application.
export enum Language {
  ENGLISH = 'English',
  PHOENICIAN = 'Phoenician',
  PUNIC = 'Punic',
  ARABIC = 'Arabic',
  FRENCH = 'French',
  SPANISH = 'Spanish',
  ITALIAN = 'Italian',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  TURKISH = 'Turkish',
  GREEK = 'Greek',
  GERMAN = 'German',
}

export enum PhoenicianDialect {
  STANDARD_PHOENICIAN = 'Standard Phoenician',
  PUNIC = 'Punic',
}

export enum TransliterationMode {
  PHOENician = 'Phoenician',
  LATIN = 'Latin',
  ARABIC = 'Arabic',
  BOTH = 'Both',
}

export interface GrammarToken {
  token: string;
  type: string;
  description: {
    en: string;
    fr: string;
    ar: string;
  };
}

export interface Cognate {
  script: string;
  latin: string;
}

export interface TransliterationOutput {
  phoenician: string;
  latin: string;
  arabic: string;
  grammar?: GrammarToken[];
  hebrewCognate?: Cognate;
  arabicCognate?: Cognate;
  aramaicCognate?: Cognate;
}

export interface SavedTranslation {
  id: string;
  sourceLang: Language;
  targetLang: Language;
  sourceText: string;
  translatedText: string | TransliterationOutput;
  dialect?: PhoenicianDialect;
  notes?: string;
}

export interface PhoenicianWordDetails {
  word: string;
  latinTransliteration: string;
  arabicTransliteration: string;
  englishMeaning: string;
  frenchMeaning: string;
  arabicMeaning: string;
  exampleSentence: {
    phoenician: string;
    latin: string;
    arabicTransliteration: string;
    arabic: string;
    english: string;
    french: string;
  };
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export interface RecognizedObject {
    name: string;
    phoenician: string;
    latin: string;
    arabicTransliteration: string;
    description: string;
    box: { x: number; y: number; width: number; height: number; };
}

export interface AIAssistantResponse {
  improvedTranslation: TransliterationOutput;
  explanation: string;
}