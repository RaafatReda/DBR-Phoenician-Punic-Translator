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

  const entriesHtml = entries.map(entry => {
    const meaning = (entry.meaning as any)[uiLang] || entry.meaning.en;
    return `
      <div class="entry">
        <div class="term">
          <span class="phoenician-script ${fontClass}">${escapeHtml(entry.phoenician)}</span>
          <span class="latin">(${escapeHtml(entry.latin)})</span>
        </div>
        <div class="meaning" lang="${uiLang}" dir="${uiLang === 'ar' ? 'rtl' : 'ltr'}">
            ${escapeHtml(meaning)}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="${uiLang}" dir="${uiLang === 'ar' ? 'rtl' : 'ltr'}">
    <head>
        <meta charset="UTF-8">
        <title>${escapeHtml(pdfTitle)}</title>
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
          html[lang="ar"] body {
            font-family: 'Cairo', sans-serif;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          h1 {
            text-align: center;
            color: #800080;
            border-bottom: 2px solid #EADCBF;
            padding-bottom: 10px;
            font-family: 'Cinzel', serif;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .entry {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 1px solid #eee;
            padding: 10px 5px;
            page-break-inside: avoid;
          }
          .term {
            display: flex;
            align-items: baseline;
            gap: 15px;
            flex-basis: 45%;
            flex-shrink: 0;
            direction: rtl;
          }
          .phoenician-script {
            color: #800080;
          }
          .phoenician-script.phoenician {
            font-family: 'Noto Sans Phoenician', serif;
            font-size: 1.6em;
          }
          .phoenician-script.punic {
             font-family: 'Punic LDR', serif;
             font-size: 1.9em;
          }
          .latin {
            font-size: 0.9em;
            color: #777;
            font-style: italic;
            direction: ltr;
            font-family: 'Handlee', cursive;
          }
          .meaning {
            flex-basis: 55%;
            text-align: ${uiLang === 'ar' ? 'right' : 'left'};
          }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${escapeHtml(pdfTitle)}</h1>
            ${entriesHtml}
        </div>
    </body>
    </html>
  `;
}