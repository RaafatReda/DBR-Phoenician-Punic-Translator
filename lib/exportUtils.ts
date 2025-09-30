import { SavedTranslation, TransliterationOutput, GlossaryEntry, PhoenicianDialect, Language } from '../types';
import { getFlagForLanguage } from './languageUtils';
import { UILang } from './i18n';

const escapeHtml = (unsafe: string | undefined): string => {
    if (!unsafe) return '';
    return unsafe.replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', "'": '&#039;' }[m]!));
};

const PUNIC_FONT_BASE64 = `AAEAAAARAQAABAAQR0RFRgB3AADQAAB4AAAAHEdQT1O1L3LGAAB4iAAAJVpPU/to+qQ0AACEyAAABpZjbWFwABEBLAAAHVAAAABqZ2FzcAAAABAAAAeIAAAACGdseWYpPEeyAAAdhAAANPBoZWFkAgkL/wAA24QAAAA2aGhlYQYF/wIAANuMAAAAIWhobXgMEAAAAADbjAAAACRsb2NhAKoAAAAA29wAAAAWbWF4cAAEAA4AANv8AAAAIG5hbWUaFRQNAADc/AAAAehwb3N0AAMAAAAA3xwAAABeAAEAAAADAFUAAQAAAAAAHAADAAEAAAAAHAADAAEAAAAAHAADAAAAAAAAAIAAAADAAAAFAADAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAgAAAAAAAAABAAEAAQAAAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAAAAAQABAAEAAQABAAEAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAAAQABAAEAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA...`;

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
