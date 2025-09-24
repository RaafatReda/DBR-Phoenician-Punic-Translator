import { SavedTranslation } from '../types';
import { getFlagForLanguage } from './languageUtils';

const escapeHtml = (unsafe: string | undefined): string => {
    if (!unsafe) return '';
    return unsafe.replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', "'": '&#039;' }[m]!));
};

export const generatePrintableHtml = (translations: SavedTranslation[]): string => {
    const translationsHtml = translations.map(item => `
        <div class="translation-item">
            <div class="header">
                <span class="lang">${getFlagForLanguage(item.sourceLang)} ${item.sourceLang}</span>
                <span class="arrow">&rarr;</span>
                <span class="lang">${getFlagForLanguage(item.targetLang)} ${item.targetLang} ${item.dialect ? `(${item.dialect})` : ''}</span>
            </div>
            <p class="source-text">${escapeHtml(item.sourceText)}</p>
            <p class="translated-text">${escapeHtml(typeof item.translatedText === 'string' ? item.translatedText : item.translatedText.phoenician)}</p>
            ${item.notes ? `<div class="notes"><strong>Notes:</strong><p>${escapeHtml(item.notes).replace(/\n/g, '<br>')}</p></div>` : ''}
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>DBR Translations</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Phoenician&family=Cinzel:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Poppins', sans-serif; 
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
                    color: #6B46C1; 
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
                    font-family: 'Noto Sans Phoenician', serif; 
                    font-size: 1.5em; 
                    color: #6B46C1; 
                    margin-bottom: 10px;
                    direction: rtl; 
                    text-align: right;
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


const FONT_SANS = `'Poppins', sans-serif`;
const FONT_PHOENICIAN = `'Noto Sans Phoenician', serif`;
const FONT_SERIF = `'Cinzel', serif`;

const wrapText = (text: string, maxCharsPerLine: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxCharsPerLine && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines.length > 0 ? lines : [''];
};

export const generateSvgDataUrl = (translations: SavedTranslation[], theme: 'light' | 'dark' | 'papyrus'): string => {
    const PADDING = 25;
    const WIDTH = 600;
    const LINE_HEIGHT_NORMAL = 20;
    const LINE_HEIGHT_PHOENICIAN = 30;
    let y = PADDING;

    let bgColor, textColor, primaryColor, secondaryColor, notesBgColor, borderColor;

    switch (theme) {
        case 'dark':
          bgColor = '#111827';
          textColor = '#F5F5F5';
          primaryColor = '#9F7AEA';
          secondaryColor = '#38B2AC';
          notesBgColor = 'rgba(0,0,0,0.2)';
          borderColor = 'rgba(255, 255, 255, 0.1)';
          break;
        case 'papyrus':
          bgColor = '#FBF0D9';
          textColor = '#3E2723';
          primaryColor = '#5D4037';
          secondaryColor = '#606C38';
          notesBgColor = '#EADCBF';
          borderColor = 'rgba(0, 0, 0, 0.1)';
          break;
        case 'light':
        default:
          bgColor = '#ffffff';
          textColor = '#333333';
          primaryColor = '#800080';
          secondaryColor = '#614e6e';
          notesBgColor = '#f0ede5';
          borderColor = 'rgba(0, 0, 0, 0.08)';
          break;
    }


    let content = '';
    y += 40; // Title space

    translations.forEach((item) => {
        y += 10;
        const startY = y;
        let itemContent = '';

        // Header
        const headerText = `${getFlagForLanguage(item.sourceLang)} ${escapeHtml(item.sourceLang)} → ${getFlagForLanguage(item.targetLang)} ${escapeHtml(item.targetLang)} ${item.dialect ? `(${escapeHtml(item.dialect)})` : ''}`;
        itemContent += `<text x="${PADDING}" y="${y}" font-family="${FONT_SANS}" font-size="14" font-weight="600" fill="${secondaryColor}">${headerText}</text>`;
        y += LINE_HEIGHT_NORMAL + 5;

        // Source Text
        const sourceLines = wrapText(item.sourceText, 60);
        sourceLines.forEach(line => {
            itemContent += `<text x="${PADDING + 10}" y="${y}" font-family="${FONT_SANS}" font-size="14" fill="${textColor}">${escapeHtml(line)}</text>`;
            y += LINE_HEIGHT_NORMAL;
        });
        y += 5;

        // Translated Text
        const translatedText = typeof item.translatedText === 'string' ? item.translatedText : item.translatedText.phoenician;
        const translatedLines = wrapText(translatedText, 40);
        translatedLines.forEach(line => {
            itemContent += `<text x="${WIDTH - PADDING}" y="${y + (LINE_HEIGHT_PHOENICIAN / 2)}" font-family="${FONT_PHOENICIAN}" font-size="22" fill="${primaryColor}" text-anchor="end">${escapeHtml(line)}</text>`;
            y += LINE_HEIGHT_PHOENICIAN;
        });
        y += 15;
        
        // Notes
        if (item.notes) {
            const notesStartY = y;
            let notesContent = `<text x="${PADDING + 10}" y="${y}" font-family="${FONT_SANS}" font-size="13" font-weight="600" fill="${textColor}">Notes:</text>`;
            y += LINE_HEIGHT_NORMAL;
            const noteLines = wrapText(item.notes, 65);
            noteLines.forEach(line => {
                notesContent += `<text x="${PADDING + 10}" y="${y}" font-family="${FONT_SANS}" font-size="13" fill="${textColor}">${escapeHtml(line)}</text>`;
                y += LINE_HEIGHT_NORMAL;
            });
            const notesHeight = y - notesStartY;
            itemContent += `<rect x="${PADDING}" y="${notesStartY - 15}" width="${WIDTH - PADDING * 2}" height="${notesHeight + 5}" fill="${notesBgColor}" rx="4" />`;
            itemContent += notesContent;
            y += 10;
        }

        const itemHeight = y - startY;
        content += `<rect x="${PADDING/2}" y="${startY - 15}" width="${WIDTH - PADDING}" height="${itemHeight + 5}" fill="none" stroke="${borderColor}" stroke-width="1" rx="8" />`;
        content += itemContent;
    });

    const HEIGHT = y + PADDING;

    const svg = `
        <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Phoenician&family=Poppins:wght@400;600&family=Cinzel:wght@700&display=swap');
                </style>
            </defs>
            <rect width="100%" height="100%" fill="${bgColor}" />
            <text x="${WIDTH / 2}" y="${PADDING + 5}" font-family="${FONT_SERIF}" font-size="20" font-weight="bold" text-anchor="middle" fill="${primaryColor}">
                DBR Translations
            </text>
            ${content}
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};