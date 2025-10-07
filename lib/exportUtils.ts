import { SavedTranslation, TransliterationOutput, GlossaryEntry, PhoenicianDialect, Language } from '../types';
import { getFlagForLanguage } from './languageUtils';
import { UILang } from './i18n';

const escapeHtml = (unsafe: string | undefined): string => {
    if (!unsafe) return '';
    return unsafe.replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', "'": '&#039;' }[m]!));
};

const PUNIC_FONT_BASE64 = `AAEAAAARAQAABAAQR0RFRgB3AADQAAB4AAAAHEdQT1O1L3LGAAB4iAAAJVpPU/to+qQ0AACEyAAABpZjbWFwABEBLAAAHVAAAABqZ2FzcAAAABAAAAeIAAAACGdseWYpPEeyAAAdhAAANPBoZWFkAgkL/wAA24QAAAA2aGhlYQYF/wIAANuMAAAAIWhobXgMEAAAAADbjAAAACRsb2NhAKoAAAAA29wAAAAWbWF4cAAEAA4AANv8AAAAIG5hbWUaFRQNAADc/AAAAehwb3N0AAMAAAAA3xwAAABeAAEAAAADAFUAAQAAAAAAHAADAAEAAAAAHAADAAEAAAAAHAADAAAAAAAAAIAAAADAAAAFAADAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAgAAAAAAAAABAAEAAQAAAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAQABAAEAAAAAAQABAAEAAAAAQQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA...`;
export const generatePrintableHtml = (translations: SavedTranslation[], uiLang: UILang): string => {
    const translationsHtml = translations.map(item => {
        const isPunic = item.dialect === PhoenicianDialect.PUNIC || item.targetLang === Language.PUNIC || item.sourceLang === Language.PUNIC;
        const fontClass = isPunic ? 'punic' : 'phoenician';
        
        const translatedTextDisplay = typeof item.translatedText === 'string'
            ? escapeHtml(item.translatedText)
            : `<span class="${fontClass}">${escapeHtml((item.translatedText as TransliterationOutput).phoenician)}</span>`;

        let transliterationHtml = '';
        if (typeof item.translatedText === 'object' && item.translatedText.latin) {
            const latin = escapeHtml(item.translatedText.latin);
            const arabic = escapeHtml(item.translatedText.arabic);
            transliterationHtml += `<div class="transliteration">`;
            if (uiLang === 'en' || uiLang === 'fr') {
                transliterationHtml += `<p class="latin">${latin}</p>`;
            } else { // Arabic UI
                transliterationHtml += `<p class="latin">${latin}</p>`;
                transliterationHtml += `<p class="arabic">${arabic}</p>`;
            }
            transliterationHtml += `</div>`;
        }
        
        return `
        <div class="translation-item">
            <div class="header">
                <span class="lang">${getFlagForLanguage(item.sourceLang)} ${escapeHtml(item.sourceLang)}</span>
                <span class="arrow">&rarr;</span>
                <span class="lang">${getFlagForLanguage(item.targetLang)} ${escapeHtml(item.targetLang)} ${item.dialect ? `(${escapeHtml(item.dialect)})` : ''}</span>
            </div>
            <p class="source-text">${escapeHtml(item.sourceText)}</p>
            <p class="translated-text">${translatedTextDisplay}</p>
            ${transliterationHtml}
            ${item.notes ? `<div class="notes"><strong>Notes:</strong><p>${escapeHtml(item.notes).replace(/\n/g, '<br>')}</p></div>` : ''}
        </div>
    `}).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>DBR Translations</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&family=Cinzel:wght@700&family=Handlee&family=Noto+Sans+Phoenician&display=swap" rel="stylesheet">
            <style>
                @font-face {
                  font-family: 'Punic LDR';
                  src: url(data:font/truetype;charset=utf-8;base64,${PUNIC_FONT_BASE64}) format('truetype');
                  font-weight: normal;
                  font-style: normal;
                }
                body { 
                    font-family: 'Handlee', cursive; 
                    margin: 20px; 
                    color: #333; 
                }
                @media print { 
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    } 
                }
                h1 { 
                    text-align: center; 
                    color: #800080; 
                    border-bottom: 2px solid #e8e6da; 
                    padding-bottom: 10px; 
                    font-family: 'Cinzel', serif;
                }
                .container { 
                    max-width: 800px; 
                    margin: 0 auto; 
                }
                .translation-item { 
                    border: 1px solid #ccc; 
                    border-radius: 8px; 
                    padding: 15px; 
                    margin-bottom: 20px; 
                    page-break-inside: avoid; 
                    background-color: #f8f7f2 !important; 
                }
                .header { 
                    font-weight: bold; 
                    margin-bottom: 10px; 
                    color: #319795; 
                    font-size: 1.1em; 
                }
                .arrow { 
                    margin: 0 10px; 
                }
                .source-text { 
                    margin-bottom: 10px; 
                    padding-left: 10px; 
                    border-left: 3px solid #ccc; 
                }
                .translated-text { 
                    font-size: 1.5em; 
                    color: #800080; 
                    margin-bottom: 5px;
                    direction: rtl; 
                    text-align: right;
                }
                .translated-text .phoenician {
                    font-family: 'Noto Sans Phoenician', serif;
                }
                .translated-text .punic {
                    font-family: 'Punic LDR', serif;
                    font-size: 1.2em; /* relative to 1.5em */
                }
                .transliteration {
                    text-align: right;
                    padding-right: 2px;
                    font-size: 0.9em;
                    color: #4A5568;
                    margin-bottom: 10px;
                }
                .transliteration .latin {
                    margin: 0;
                    font-style: italic;
                    direction: ltr;
                }
                .transliteration .arabic {
                    margin: 2px 0 0;
                    direction: rtl;
                    font-family: 'Cairo', sans-serif;
                }
                .notes { 
                    margin-top: 15px; 
                    padding: 10px; 
                    background-color: #e8e6da !important; 
                    border-radius: 4px; 
                    font-size: 0.9em; 
                }
                .notes strong { 
                    color: #333; 
                }
                .notes p { 
                    margin: 5px 0 0; 
                    white-space: pre-wrap; 
                }
                .footer { 
                    text-align: center; 
                    margin-top: 20px; 
                    font-size: 0.8em; 
                    color: #777; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>DBR Translations</h1>
                ${translationsHtml}
                <div class="footer">Exported from DBR Translator</div>
            </div>
        </body>
        </html>
    `;
};

interface GrammarModuleData {
    moduleTitleKey: string;
    moduleContentKey: string;
}
interface GrammarLevelData {
    levelTitleKey: string;
    modules: GrammarModuleData[];
}

export const generateGrammarHtmlForPdf = (
  levels: GrammarLevelData[],
  dialect: PhoenicianDialect,
  uiLang: UILang,
  t: (key: string) => string
): string => {
  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const dialectName = isPunic ? t('punic') : t('standardPhoenician');
  const pdfTitle = t('lessonsHeader');
  const subtitle = dialectName;

  const lessonsHtml = levels.map((level, levelIndex) => `
    <div class="level-section ${levelIndex === 0 ? 'first-level' : ''}">
      <h2 class="level-title">${escapeHtml(t(level.levelTitleKey))}</h2>
      ${level.modules.map(module => `
        <div class="module-section">
          <div class="prose">${t(module.moduleContentKey)}</div>
        </div>
      `).join('')}
    </div>
  `).join('');

  const coverTitle = uiLang === 'ar' ? 'خاص بقواعد اللغة الفينيقية والبونيقية' : 'A Guide to Phoenician & Punic Grammar';

  return `
    <!DOCTYPE html>
    <html lang="${uiLang}" dir="${uiLang === 'ar' ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(pdfTitle)} - ${escapeHtml(subtitle)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Poppins:wght@300;400;700&family=Noto+Sans+Phoenician&display=swap" rel="stylesheet">
        <style>
          @font-face {
            font-family: 'Punic LDR';
            src: url(data:font/truetype;charset=utf-8;base64,${PUNIC_FONT_BASE64}) format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          :root {
            --color-purple: #800080;
            --color-sky-blue: #87CEEB;
            --color-text: #1a1a1a;
            --color-bg: #FFFFFF;
            --color-light-gray: #f4f7f9;
            --font-sans: 'Poppins', sans-serif;
            --font-ar: 'Cairo', sans-serif;
          }
          @page {
            size: A4;
            margin: 1.5cm;
            @bottom-center {
                content: "Page " counter(page);
                font-family: var(--font-sans);
                font-size: 9pt;
                color: #888;
            }
          }
          body {
            font-family: var(--font-sans);
            color: var(--color-text);
            background-color: var(--color-bg);
            line-height: 1.6;
            counter-reset: page 1;
          }
          html[lang="ar"] body {
            font-family: var(--font-ar);
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
          }
          .pdf-container {
            width: 100%;
          }
          .cover-page {
            height: 267mm; /* A4 height minus margins */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            overflow: hidden;
            background: var(--color-bg);
          }
          .cover-page::before {
            content: '';
            position: absolute;
            bottom: -50%;
            left: -30%;
            width: 150%;
            height: 150%;
            background: linear-gradient(45deg, var(--color-purple), var(--color-sky-blue));
            transform: rotate(-15deg);
            opacity: 0.1;
            z-index: 1;
          }
          .cover-page::after {
             content: '';
             position: absolute;
             top: 10%;
             right: 5%;
             width: 150px;
             height: 150px;
             border: 10px solid var(--color-purple);
             opacity: 0.2;
             z-index: 1;
          }
          .cover-content {
            position: relative;
            z-index: 2;
          }
          .cover-content h1 {
            font-family: var(--font-sans);
            font-size: 2.8em;
            color: var(--color-purple);
            margin: 0;
            font-weight: 700;
          }
          html[lang="ar"] .cover-content h1 {
            font-family: var(--font-ar);
            font-size: 3.2em;
          }
          .cover-content h2 {
            font-family: var(--font-sans);
            font-size: 1.5em;
            color: var(--color-text);
            margin-top: 1rem;
            font-weight: 300;
          }
          .cover-content .logo {
            font-family: 'Punic LDR', serif;
            font-size: 5em;
            color: var(--color-purple);
            margin-bottom: 2rem;
            opacity: 0.8;
          }

          .level-section {
            page-break-before: always;
          }
          .level-section.first-level {
            page-break-before: auto;
          }
          .level-title {
            font-size: 2em;
            font-family: var(--font-sans);
            font-weight: 700;
            color: var(--color-purple);
            text-align: center;
            border-bottom: 2px solid var(--color-purple);
            padding-bottom: 10px;
            margin-bottom: 25px;
            margin-top: 0;
          }
          html[lang="ar"] .level-title {
             font-family: var(--font-ar);
          }
          .module-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .prose {
            font-size: 10.5pt;
          }
          .prose h3 {
            color: var(--color-purple);
            font-family: var(--font-sans);
            font-weight: 700;
            margin-bottom: 1em;
            margin-top: 0;
            font-size: 1.4rem;
            border-left: 4px solid var(--color-sky-blue);
            padding-left: 0.8em;
          }
          html[dir="rtl"] .prose h3 {
            border-left: none;
            border-right: 4px solid var(--color-sky-blue);
            padding-left: 0;
            padding-right: 0.8em;
          }
          html[lang="ar"] .prose h3 {
             font-family: var(--font-ar);
          }
          .prose p {
            margin-bottom: 1.2em;
          }
          .prose ul {
            list-style: none;
            padding-inline-start: 1.5em;
            margin-bottom: 1em;
          }
          .prose li {
            margin-bottom: 0.6em;
            padding-left: 0.8em;
            position: relative;
          }
          .prose li::before {
            content: '■';
            color: var(--color-sky-blue);
            position: absolute;
            left: -1.2em;
            top: 0.2em;
            font-size: 0.8em;
          }
           html[dir="rtl"] .prose li::before {
             left: auto;
             right: -1.2em;
           }
          .prose code {
            background-color: var(--color-light-gray) !important;
            padding: 0.2em 0.5em;
            border-radius: 4px;
            font-family: 'Noto Sans Phoenician', serif;
            font-size: 1.2em;
            color: var(--color-text) !important;
            border: 1px solid #e0e0e0;
          }
          .prose code.punic {
            font-family: 'Punic LDR', serif;
            font-size: 1.4em;
          }
          .prose strong {
            font-weight: 700;
            color: var(--color-text);
          }
          .prose table {
            width: 100%;
            margin-top: 1.5em;
            margin-bottom: 1.5em;
            border-collapse: collapse;
            border: 1px solid #ddd;
          }
          .prose th, .prose td {
            border: 1px solid #ddd;
            padding: 0.7em 1em;
            text-align: left;
          }
          html[dir="rtl"] .prose th, html[dir="rtl"] .prose td {
            text-align: right;
          }
          .prose th {
            background-color: var(--color-purple) !important;
            font-weight: 700;
            color: white;
            font-family: var(--font-sans);
          }
          html[lang="ar"] .prose th {
            font-family: var(--font-ar);
          }
          .prose tr:nth-child(even) {
            background-color: var(--color-light-gray) !important;
          }
        </style>
    </head>
    <body>
        <div class="pdf-container">
            <div class="cover-page">
              <div class="cover-content">
                  <div class="logo">𐤃𐤁𐤓</div>
                  <h1>${escapeHtml(coverTitle)}</h1>
                  <h2>${escapeHtml(subtitle)}</h2>
              </div>
            </div>
            ${lessonsHtml}
        </div>
    </body>
    </html>
  `;
};

export const generateGlossaryHtmlForPdf = (
  entries: GlossaryEntry[],
  uiLang: UILang,
  dialect: PhoenicianDialect,
  t: (key: string) => string
): string => {
  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const fontClass = isPunic ? 'punic' : 'phoenician';
  const titleKey = isPunic ? 'punicGlossaryTitle' : 'phoenicianGlossaryTitle';
  const pdfTitle = t(titleKey);

  const getCategoryIcon = (category?: GlossaryEntry['category']) => {
    const icons = {
      theonym: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M10 2.5a.75.75 0 01.75.75v.255a.25.25 0 00.5 0V3.25a.75.75 0 011.5 0v.255a.25.25 0 00.5 0V3.25a.75.75 0 011.5 0v.51a.25.25 0 00.485.122l.33-.66a.75.75 0 011.353.676l-.33.66a.25.25 0 00.122.485h.51a.75.75 0 010 1.5h-.51a.25.25 0 00-.122.485l.33.66a.75.75 0 01-1.353.676l-.33-.66a.25.25 0 00-.485.122v.51a.75.75 0 01-1.5 0v-.51a.25.25 0 00-.485-.122l-.33.66a.75.75 0 01-1.353-.676l.33-.66a.25.25 0 00-.122-.485h-.51a.75.75 0 010-1.5h.51a.25.25 0 00.122-.485l-.33-.66a.75.75 0 011.353-.676l.33.66a.25.25 0 00.485-.122v-.51a.75.75 0 01-1.5 0v-.255a.25.25 0 00-.5 0V3.25a.75.75 0 01-.75-.75zM10 8a2 2 0 100 4 2 2 0 000-4zM8.25 4.5a.75.75 0 000 1.5h-.51a.25.25 0 01-.122.485l-.33.66a.75.75 0 001.353.676l.33-.66a.25.25 0 01.485.122v.51a.75.75 0 001.5 0v-.51a.25.25 0 01.485-.122l.33.66a.75.75 0 001.353-.676l-.33-.66a.25.25 0 01-.122-.485h-.51a.75.75 0 000-1.5h.51a.25.25 0 01.122-.485l.33-.66a.75.75 0 00-1.353-.676l-.33.66a.25.25 0 01-.485-.122V3.25a.75.75 0 00-1.5 0v.51a.25.25 0 01-.485-.122l-.33-.66a.75.75 0 00-1.353.676l.33.66a.25.25 0 01.122.485h.51a.75.75 0 000-1.5h-.255a.25.25 0 01-.5 0H8.25zM12 15.75a.75.75 0 00-1.5 0v.255a.25.25 0 01-.5 0V15.75a.75.75 0 00-1.5 0v.255a.25.25 0 01-.5 0V15.75a.75.75 0 00-1.5 0v.51a.25.25 0 01-.485.122l-.33-.66a.75.75 0 00-1.353.676l.33.66a.25.25 0 01.122.485h.51a.75.75 0 000 1.5h-.51a.25.25 0 01-.122.485l-.33.66a.75.75 0 001.353.676l.33-.66a.25.25 0 01.485.122v.51a.75.75 0 001.5 0v-.51a.25.25 0 01.485-.122l.33.66a.75.75 0 001.353.676l-.33-.66a.25.25 0 01.122-.485h.51a.75.75 0 000-1.5h-.51a.25.25 0 01-.122-.485l.33-.66a.75.75 0 00-1.353-.676l-.33.66a.25.25 0 01-.485-.122v-.51a.75.75 0 00-1.5 0v.255a.25.25 0 01-.5 0V15.75z\' clip-rule=\'evenodd\' /%3E%3C/svg%3E',
      personal_name: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath d=\'M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 12a9.99 9.99 0 00-6.535 2.493z\' /%3E%3C/svg%3E',
      location: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.27.61-.47c.21-.2.419-.413.618-.638c.199-.225.385-.46.56-.713c.174-.253.328-.517.468-.795a10.06 10.06 0 00.673-2.383c.023-.223.038-.447.051-.671c.013-.224.019-.448.019-.673c0-2.228-1.5-4.242-3.75-4.945c-2.25-.703-4.5.242-5.25 2.495c-.75 2.253.242 4.5 2.495 5.25c.394.123.796.223 1.2.301c.404.078.81.134 1.22.167c.41.033.82.046 1.23.046c.412 0 .824-.013 1.236-.046c.412-.033.82-.09 1.224-.167c.403-.078.806-.178 1.2-.301c2.253-.75 3.242-3 2.495-5.25c-.75-2.253-3-3.242-5.25-2.495c-2.25.703-3.75 2.717-3.75 4.945c0 .225.006.449.019.673c.013.224.028.448.051.671a10.06 10.06 0 00.673 2.383c.14.278.294.542.468.795c.175.253.361.488.56.713c.199.225.409.438.618.638c.21.2.424.37.61.47c.101.055.202.106.296.155a5.741 5.741 0 00.281.14l.018.008l.006.003zM10 12a2 2 0 100-4 2 2 0 000 4z\' clip-rule=\'evenodd\' /%3E%3C/svg%3E'
    };
    if (!category || !icons[category]) return '';
    return `<img src="${icons[category]}" class="category-icon" alt="${category} icon">`;
  };

  const getCategoryTranslationKey = (category: GlossaryEntry['category']) => {
    if (category === 'theonym') return 'theonyms';
    if (category === 'personal_name') return 'personalNames';
    if (category === 'location') return 'locationNames';
    return category || '';
  }

  const entriesHtml = entries.map(entry => {
    const meaning = (entry.meaning as any)[uiLang] || entry.meaning.en;
    const grammarDetails = [
      entry.grammar.pos ? t(entry.grammar.pos.toLowerCase()) : '',
      entry.grammar.gender,
      entry.grammar.number,
      entry.grammar.stem
    ].filter(Boolean).join(', ');

    return `
      <div class="entry">
        <div class="main-info">
          <div class="term-group">
            <span class="phoenician-script ${fontClass}">${escapeHtml(entry.phoenician)}</span>
            <span class="latin">(${escapeHtml(entry.latin)})</span>
          </div>
          <div class="meaning" lang="${uiLang}" dir="${uiLang === 'ar' ? 'rtl' : 'ltr'}">
              ${escapeHtml(meaning)}
          </div>
        </div>
        <div class="meta-info">
           <span class="grammar">${escapeHtml(grammarDetails)}</span>
           ${entry.category ? `<span class="category">${getCategoryIcon(entry.category)} ${escapeHtml(t(getCategoryTranslationKey(entry.category)))}</span>` : ''}
        </div>
        ${entry.grammar.notes ? `<div class="notes">${escapeHtml(entry.grammar.notes)}</div>` : ''}
      </div>
    `;
  }).join('');

  const coverTitle = uiLang === 'ar' ? 'مسرد اللغة الفينيقية والبونيقية' : 'Phoenician & Punic Glossary';

  return `
    <!DOCTYPE html>
    <html lang="${uiLang}" dir="${uiLang === 'ar' ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(pdfTitle)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Poppins:wght@300;400;700&family=Noto+Sans+Phoenician&display=swap" rel="stylesheet">
        <style>
          @font-face {
            font-family: 'Punic LDR';
            src: url(data:font/truetype;charset=utf-8;base64,${PUNIC_FONT_BASE64}) format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          :root {
            --color-purple: #800080;
            --color-sky-blue: #87CEEB;
            --color-text: #1a1a1a;
            --color-text-muted: #6c757d;
            --color-bg: #FFFFFF;
            --color-border: #e0e0e0;
            --font-sans: 'Poppins', sans-serif;
            --font-ar: 'Cairo', sans-serif;
          }
          @page {
            size: A4;
            margin: 1.5cm;
            @bottom-center {
                content: "Page " counter(page);
                font-family: var(--font-sans);
                font-size: 9pt;
                color: #888;
            }
          }
          body {
            font-family: var(--font-sans);
            color: var(--color-text);
            background-color: var(--color-bg);
            line-height: 1.6;
            counter-reset: page 1;
          }
          html[lang="ar"] body {
            font-family: var(--font-ar);
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          
          .cover-page {
            height: 267mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
            overflow: hidden;
            background: var(--color-bg);
          }
          .cover-page::before, .cover-page::after {
            content: '';
            position: absolute;
            z-index: 1;
            opacity: 0.15;
          }
          .cover-page::before {
            bottom: -25%;
            left: -25%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, var(--color-sky-blue), transparent 60%);
            transform: rotate(-30deg);
          }
           .cover-page::after {
            top: -25%;
            right: -25%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, var(--color-purple), transparent 60%);
            transform: rotate(15deg);
          }
          .cover-content {
            position: relative;
            z-index: 2;
            border: 5px solid var(--color-text);
            padding: 2rem 3rem;
          }
          .cover-content h1 {
            font-family: var(--font-sans);
            font-size: 2.5em;
            color: var(--color-text);
            margin: 0;
            font-weight: 700;
            border-bottom: 2px solid var(--color-purple);
            padding-bottom: 0.5rem;
          }
          html[lang="ar"] .cover-content h1 {
            font-family: var(--font-ar);
            font-size: 3em;
          }
          .cover-content .logo {
            font-family: 'Punic LDR', serif;
            font-size: 4em;
            color: var(--color-purple);
            margin-bottom: 1.5rem;
          }

          .container {
            width: 100%;
          }
          h1.page-title {
            text-align: center;
            color: var(--color-purple);
            font-size: 2em;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--color-border);
          }
          html[lang="ar"] h1.page-title {
             font-family: var(--font-ar);
          }
          
          .entry {
            border-left: 3px solid var(--color-sky-blue);
            padding: 12px 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
            background-color: #fdfdfd;
            border-radius: 0 4px 4px 0;
          }
          html[dir="rtl"] .entry {
            border-left: none;
            border-right: 3px solid var(--color-sky-blue);
            border-radius: 4px 0 0 4px;
          }
          
          .main-info {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 1rem;
          }
          .term-group {
            flex-basis: 40%;
            display: flex;
            align-items: baseline;
            gap: 10px;
            direction: rtl;
          }
          .phoenician-script {
            color: var(--color-purple);
          }
          .phoenician-script.phoenician {
            font-family: 'Noto Sans Phoenician', serif;
            font-size: 1.8em;
          }
          .phoenician-script.punic {
             font-family: 'Punic LDR', serif;
             font-size: 2em;
          }
          .latin {
            font-size: 0.9em;
            color: var(--color-text-muted);
            font-style: italic;
            direction: ltr;
          }
          .meaning {
            flex-basis: 60%;
            font-weight: 400;
          }
          html[dir="rtl"] .meaning {
            text-align: left;
          }
          .meta-info {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 0.8em;
            color: var(--color-text-muted);
            margin-top: 5px;
            padding-left: 5px;
          }
           html[dir="rtl"] .meta-info {
            padding-left: 0;
            padding-right: 5px;
            justify-content: flex-end;
          }
          .grammar {
            font-style: italic;
          }
          .category {
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
          }
          .category-icon {
            width: 12px;
            height: 12px;
            opacity: 0.7;
          }
          .notes {
            font-size: 0.8em;
            color: #555;
            margin-top: 5px;
            padding-left: 5px;
            border-left: 2px solid #eee;
          }
           html[dir="rtl"] .notes {
            padding-left: 0;
            padding-right: 5px;
            border-left: none;
            border-right: 2px solid #eee;
          }
        </style>
    </head>
    <body>
        <div class="cover-page">
            <div class="cover-content">
                <div class="logo">𐤀</div>
                <h1>${escapeHtml(coverTitle)}</h1>
            </div>
        </div>
        <div class="container">
            <h1 class="page-title">${escapeHtml(pdfTitle)}</h1>
            ${entriesHtml}
        </div>
    </body>
    </html>
  `;
}
