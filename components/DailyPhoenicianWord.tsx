import React, { useState, useEffect, useCallback } from 'react';
import { getPhoenicianWordDetails } from '../services/geminiService';
import { phoenicianDictionary } from '../lib/phoenicianDictionary';
import { PhoenicianWordDetails } from '../types';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import DiceIcon from './icons/DiceIcon';
import { UILang } from '../lib/i18n';

interface DailyPhoenicianWordProps {
    t: (key: string) => string;
    uiLang: UILang;
}

interface CachedWord {
    details: PhoenicianWordDetails;
    timestamp: number;
}

const DailyPhoenicianWord: React.FC<DailyPhoenicianWordProps> = ({ t, uiLang }) => {
    const [isVisible, setIsVisible] = useState<boolean>(() => {
        return sessionStorage.getItem('dailyWordClosed') !== 'true';
    });
    const [wordDetails, setWordDetails] = useState<PhoenicianWordDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWord = useCallback(async (forceFresh = false) => {
        setIsLoading(true);
        setError(null);
        setWordDetails(null);

        const today = new Date().toDateString();
        if (!forceFresh) {
            try {
                const cachedData = localStorage.getItem('dbr-daily-word');
                if (cachedData) {
                    const { details, timestamp }: CachedWord = JSON.parse(cachedData);
                    const cacheDate = new Date(timestamp).toDateString();
                    if (cacheDate === today) {
                        setWordDetails(details);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to read daily word from cache", e);
                localStorage.removeItem('dbr-daily-word');
            }
        }

        try {
            const randomIndex = Math.floor(Math.random() * phoenicianDictionary.length);
            const word = phoenicianDictionary[randomIndex];
            const details = await getPhoenicianWordDetails(word);
            setWordDetails(details);

            try {
                const cacheEntry: CachedWord = { details, timestamp: Date.now() };
                localStorage.setItem('dbr-daily-word', JSON.stringify(cacheEntry));
            } catch (e) {
                console.error("Failed to save daily word to cache", e);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            fetchWord(false);
        }
    }, [isVisible, fetchWord]);

    const handleNewWordClick = () => {
        fetchWord(true);
    };

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('dailyWordClosed', 'true');
    };

    if (!isVisible) {
        return null;
    }

    const meaning =
        uiLang === 'fr' && wordDetails?.frenchMeaning ? wordDetails.frenchMeaning :
        uiLang === 'ar' && wordDetails?.arabicMeaning ? wordDetails.arabicMeaning :
        wordDetails?.englishMeaning;

    const exampleTranslation = 
        uiLang === 'fr' && wordDetails?.exampleSentence.french ? wordDetails.exampleSentence.french :
        uiLang === 'ar' && wordDetails?.exampleSentence.arabic ? wordDetails.exampleSentence.arabic :
        wordDetails?.exampleSentence.english;
    
    return (
        <div className="w-full max-w-5xl mx-auto my-8">
            <div className="glass-panel rounded-[var(--border-radius)] p-4 relative shadow-lg animate-text-glow-fade-in" style={{ animationDuration: '1s' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[color:var(--color-secondary)] [font-family:var(--font-serif)] tracking-wider">
                        {t('dailyWordTitle')}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleNewWordClick} 
                            disabled={isLoading}
                            className="text-[color:var(--color-primary)] hover:text-[color:var(--color-glow)] disabled:opacity-50 transition-transform duration-300 hover:rotate-45"
                            title={t('dailyWordNew')}
                            aria-label={t('dailyWordNew')}
                        >
                            <DiceIcon className="w-6 h-6" />
                        </button>
                         <button 
                            onClick={handleClose} 
                            className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-primary)]"
                            title={t('dailyWordClose')}
                            aria-label={t('dailyWordClose')}
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="min-h-[150px] flex items-center justify-center">
                        <Loader className="w-8 h-8 text-[color:var(--color-primary)]" />
                    </div>
                )}
                
                {error && (
                     <div className="min-h-[150px] flex flex-col items-center justify-center text-center text-red-400">
                        <p className="font-semibold">{t('dailyWordError')}</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {wordDetails && !isLoading && (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="flex justify-center items-baseline gap-8">
                                <div>
                                    <p className="text-xs text-center text-[color:var(--color-text-muted)] uppercase">{t('phoenician')}</p>
                                    <p className="[font-family:var(--font-phoenician)] text-6xl text-[color:var(--color-primary)]" dir="rtl">
                                        {wordDetails.word}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-center text-[color:var(--color-text-muted)] uppercase">{t('punic')}</p>
                                    <p className="[font-family:var(--font-punic)] text-7xl text-[color:var(--color-primary)]" dir="rtl">
                                        {wordDetails.word}
                                    </p>
                                </div>
                            </div>
                            
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 items-start">
                                <div className={uiLang === 'ar' ? '' : 'sm:col-span-2'}>
                                    <p className="text-xs text-[color:var(--color-text-muted)] uppercase">{t('dailyWordLatinTransliteration')}</p>
                                    <p className="text-[color:var(--color-text-muted)] text-xl">
                                        {wordDetails.latinTransliteration}
                                    </p>
                                </div>
                                {uiLang === 'ar' && (
                                    <div>
                                        <p className="text-xs text-[color:var(--color-text-muted)] uppercase">{t('dailyWordArabicTransliteration')}</p>
                                        <p className="text-xl text-[color:var(--color-text-muted)] mt-1" dir="rtl">
                                            {wordDetails.arabicTransliteration}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3">
                                <p className="text-xs text-[color:var(--color-text-muted)] uppercase">{t('dailyWordMeaning')}</p>
                                <p className="text-xl font-semibold capitalize mt-1" lang={uiLang} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                                    {meaning}
                                </p>
                            </div>
                        </div>
                        
                        <div className="border-t border-[color:var(--color-border)] pt-4">
                            <p className="text-sm text-[color:var(--color-text-muted)] mb-2 uppercase" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('dailyWordUsage')}</p>
                            <div className="flex justify-center items-center gap-8 text-center flex-wrap" dir="rtl">
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">{t('phoenician')}</p>
                                    <p className="[font-family:var(--font-phoenician)] text-3xl">
                                        {wordDetails.exampleSentence.phoenician}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[color:var(--color-text-muted)]">{t('punic')}</p>
                                    <p className="[font-family:var(--font-punic)] text-4xl">
                                        {wordDetails.exampleSentence.phoenician}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 items-start">
                               <div className={(uiLang === 'ar' && wordDetails.exampleSentence.arabicTransliteration) ? '' : 'sm:col-span-2'}>
                                    <p className="text-xs text-[color:var(--color-text-muted)] uppercase" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('dailyWordLatinTransliteration')}</p>
                                    <p className="text-[color:var(--color-text-muted)] text-lg">
                                        {wordDetails.exampleSentence.latin}
                                    </p>
                                </div>
                                {uiLang === 'ar' && wordDetails.exampleSentence.arabicTransliteration && (
                                    <div>
                                        <p className="text-xs text-[color:var(--color-text-muted)] uppercase" dir="rtl">{t('dailyWordArabicTransliteration')}</p>
                                        <p className="text-lg text-[color:var(--color-text-muted)] mt-1" dir="rtl">
                                            {wordDetails.exampleSentence.arabicTransliteration}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-lg italic mt-2" lang={uiLang} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                                "{exampleTranslation}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyPhoenicianWord;