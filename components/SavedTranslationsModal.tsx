import React, { useState, ChangeEvent } from 'react';
import { SavedTranslation, PhoenicianDialect, Language } from '../types';
import TrashIcon from './icons/TrashIcon';
import CloseIcon from './icons/CloseIcon';
import NoteIcon from './icons/NoteIcon';
import PdfIcon from './icons/PdfIcon';
import ImageIcon from './icons/ImageIcon';
import { getFlagForLanguage } from '../lib/languageUtils';
import { generatePrintableHtml } from '../lib/exportUtils';
import { UILang } from '../lib/i18n';


interface SavedTranslationsModalProps {
  translations: SavedTranslation[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onUpdateNote: (id: string, notes: string) => void;
  theme: 'light' | 'dark' | 'papyrus' | 'purple-glassy' | 'glassmorphism';
  t: (key: string) => string;
  uiLang: UILang;
}

const SavedTranslationsModal: React.FC<SavedTranslationsModalProps> = ({ translations, onClose, onClearAll, onDelete, onUpdateNote, theme, t, uiLang }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(translations.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleEditNote = (item: SavedTranslation) => {
    setEditingNoteId(item.id);
    setNoteContent(item.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteContent('');
  };

  const handleSaveNote = () => {
    if (editingNoteId) {
      onUpdateNote(editingNoteId, noteContent);
      handleCancelEdit();
    }
  };

  const getSelectedTranslations = () => {
    return translations.filter(t => selectedIds.has(t.id));
  };
  
  const handleExportPDF = () => {
    const selected = getSelectedTranslations();
    if (selected.length === 0) return;

    const htmlContent = generatePrintableHtml(selected, uiLang, t);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // The window may not close automatically depending on browser settings.
      }, 500);
    }
  };
  
  const handleExportImage = async (format: 'png' | 'jpeg') => {
    const selected = getSelectedTranslations();
    if (selected.length === 0) return;

    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '800px';

    const htmlContent = generatePrintableHtml(selected, uiLang, t);
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*)<\/style>/i);

    if (bodyMatch && styleMatch) {
        const style = document.createElement('style');
        style.innerHTML = styleMatch[1];
        exportContainer.appendChild(style);
        exportContainer.innerHTML += bodyMatch[1];
    } else {
        alert("Error preparing content for export.");
        return;
    }

    document.body.appendChild(exportContainer);

    try {
        let bgColor = '#ffffff';
        if (theme === 'dark') {
            bgColor = '#111827';
        } else if (theme === 'papyrus') {
            bgColor = '#FBF0D9';
        } else if (theme === 'purple-glassy') {
            bgColor = '#1E0F4C';
        } else if (theme === 'glassmorphism') {
            bgColor = '#0A1931';
        }

        const canvas = await window.html2canvas(exportContainer, {
            useCORS: true,
            backgroundColor: format === 'png' ? null : bgColor,
            scale: 2,
        });

        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `dbr_translator_export_${timestamp}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Sorry, the export failed. There might be an issue with rendering the image. Please try again.");
    } finally {
        document.body.removeChild(exportContainer);
    }
  };
  
  const isAllSelected = selectedIds.size > 0 && selectedIds.size === translations.length;

  const dialectToKey = (dialect: PhoenicianDialect): string => {
    return dialect === PhoenicianDialect.STANDARD_PHOENICIAN ? 'standardPhoenician' : 'punic';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-translations-title"
    >
      <div 
        className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
          <h2 id="saved-translations-title" className="text-xl font-semibold text-[color:var(--color-primary)]">{t('savedTitle')}</h2>
          <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('savedClose')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-4 bg-black/10">
          {translations.length === 0 ? (
            <div className="text-center text-[color:var(--color-text-muted)] py-8">
              <p>{t('savedEmpty')}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {translations.map((item) => {
                const sourceLangName = t(item.sourceLang.toLowerCase());
                const targetLangName = t(item.targetLang.toLowerCase());

                const isDialectRedundant = item.targetLang === Language.PUNIC || item.sourceLang === Language.PUNIC;
                const dialectName = item.dialect && !isDialectRedundant ? `(${t(dialectToKey(item.dialect))})` : '';

                const isPunic = item.dialect === PhoenicianDialect.PUNIC || item.targetLang === Language.PUNIC || item.sourceLang === Language.PUNIC;
                const fontClass = isPunic ? '[font-family:var(--font-punic)] text-2xl' : '[font-family:var(--font-phoenician)] text-xl';

                return (
                  <li key={item.id} className="bg-[color:var(--color-surface-solid)] p-4 rounded-lg border border-[color:var(--color-border)] shadow-md hover:border-[color:var(--color-primary)]/70 transition-all duration-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        <input 
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelect(item.id)}
                          className="h-5 w-5 rounded bg-transparent border-2 border-[color:var(--color-text-muted)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
                          aria-label={t('savedSelect')}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-[color:var(--color-secondary)] mb-2 font-semibold tracking-wide">
                          {getFlagForLanguage(item.sourceLang)} {sourceLangName} &rarr; {getFlagForLanguage(item.targetLang)} {targetLangName} {dialectName}
                        </div>
                        <p className="text-[color:var(--color-text)] mb-2 break-words text-base">{item.sourceText}</p>
                        <p className={`text-[color:var(--color-primary)] ${fontClass} font-semibold break-words text-right`} dir="rtl">
                          {typeof item.translatedText === 'string'
                            ? item.translatedText
                            : item.translatedText.phoenician}
                        </p>
                        {typeof item.translatedText === 'object' && (
                          <div className="text-right text-sm text-[color:var(--color-text-muted)] mt-1 pr-1">
                            {(uiLang === 'en' || uiLang === 'fr') && (
                              <p dir="ltr" className="italic break-words">{item.translatedText.latin}</p>
                            )}
                            {uiLang === 'ar' && (
                              <>
                                <p dir="ltr" className="italic break-words">{item.translatedText.latin}</p>
                                <p dir="rtl" className="break-words">{item.translatedText.arabic}</p>
                              </>
                            )}
                          </div>
                        )}
                         {editingNoteId === item.id ? (
                          <div className="mt-4">
                            <textarea 
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder={t('addNotesPlaceholder')}
                              className="w-full bg-[color:var(--color-bg-end)] text-sm p-2 rounded-md border border-[color:var(--color-border)] focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)]"
                              rows={3}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button onClick={handleCancelEdit} className="px-3 py-1 text-xs font-semibold rounded-md hover:bg-white/10">{t('savedCancel')}</button>
                              <button onClick={handleSaveNote} className="px-3 py-1 text-xs font-semibold rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-bg-start)]">{t('savedSaveNote')}</button>
                            </div>
                          </div>
                        ) : (
                          item.notes && (
                            <div className="mt-3 pt-3 border-t border-[color:var(--color-border)]">
                                <p className="text-sm text-[color:var(--color-text-muted)] whitespace-pre-wrap">{item.notes}</p>
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 flex-shrink-0">
                        <button onClick={() => handleEditNote(item)} className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-secondary)] transition-colors p-1" aria-label={t('savedNoteEdit')}>
                          <NoteIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="text-[color:var(--color-text-muted)] hover:text-red-400 transition-colors p-1" aria-label={t('savedDelete')}>
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
        
        {translations.length > 0 && (
            <footer className="p-4 border-t border-[color:var(--color-border)] flex-shrink-0 flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input 
                        type="checkbox"
                        id="select-all"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded bg-transparent border-2 border-[color:var(--color-text-muted)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm font-medium">{t('savedSelectAll')}</label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[color:var(--color-text-muted)]">{t('savedExport')} ({selectedIds.size}):</span>
                      <button onClick={handleExportPDF} disabled={selectedIds.size === 0} title={t('exportPdf')} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/5 disabled:opacity-50 hover:bg-white/10">
                        <PdfIcon className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                       <button onClick={() => handleExportImage('png')} disabled={selectedIds.size === 0} title={t('exportPng')} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/5 disabled:opacity-50 hover:bg-white/10">
                        <ImageIcon className="w-4 h-4" />
                        <span>PNG</span>
                      </button>
                       <button onClick={() => handleExportImage('jpeg')} disabled={selectedIds.size === 0} title={t('exportJpg')} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/5 disabled:opacity-50 hover:bg-white/10">
                        <ImageIcon className="w-4 h-4" />
                        <span>JPG</span>
                      </button>
                  </div>
              </div>
              <button 
                onClick={onClearAll} 
                className="text-center py-2 px-4 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 transition-colors font-semibold text-sm"
              >
                {t('savedClear')}
              </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default SavedTranslationsModal;