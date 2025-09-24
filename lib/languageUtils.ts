import { Language } from '../types';

export const getFlagForLanguage = (lang: Language): string => {
  switch (lang) {
    case Language.ENGLISH:
      return '🇬🇧';
    case Language.PHOENICIAN:
      return '🇱🇧'; // Using Lebanon's flag
    case Language.PUNIC:
      return '🇹🇳'; // Using Tunisia's flag
    case Language.ARABIC:
      return '☪️';
    case Language.FRENCH:
      return '🇫🇷';
    case Language.SPANISH:
      return '🇪🇸';
    case Language.ITALIAN:
      return '🇮🇹';
    case Language.CHINESE:
      return '🇨🇳';
    case Language.JAPANESE:
      return '🇯🇵';
    case Language.TURKISH:
      return '🇹🇷';
    // FIX: Added missing cases for Greek and German to match the Language enum and UI components.
    case Language.GREEK:
      return '🇬🇷';
    case Language.GERMAN:
      return '🇩🇪';
    default:
      return '🌐'; // A generic globe icon for unknown cases
  }
};