import React, { useState, useRef } from 'react';
import { TransliterationOutput, PhoenicianDialect } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CheckIcon from './icons/CheckIcon';
import PdfIcon from './icons/PdfIcon';
import ImageIcon from './icons/ImageIcon';
import Loader from './Loader';
import DialectSelector from './DialectSelector';

interface ExportEditorProps {
  translationResult: TransliterationOutput;
  dialect: PhoenicianDialect;
  onExit: () => void;
  t: (key: string) => string;
}

const ExportEditor: React.FC<ExportEditorProps> = ({ translationResult, dialect, onExit, t }) => {
  const words = translationResult.grammar?.map(token => token.token) || [];
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<false | 'JPG' | 'PNG' | 'PDF'>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNav = (direction: 'next' | 'prev') => {
    const total = words.length;
    if (total === 0) return;
    const newIndex = direction === 'next' ? (selectedIndex + 1) % total : (selectedIndex - 1 + total) % total;
    setSelectedIndex(newIndex);
  };

  const handleExport = async (format: 'JPG' | 'PNG' | 'PDF') => {
    if (!previewRef.current || isExporting) return;

    setIsExporting(format);

    try {
      const elementToCapture = previewRef.current;
      if (!elementToCapture) throw new Error("Preview element not found");

      const canvas = await window.html2canvas(elementToCapture, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        scale: 3, // Increase resolution
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dbr-word-${words[selectedIndex]}-${timestamp}`;

      if (format === 'PDF') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
      } else {
        const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png';
        const extension = format.toLowerCase();
        
        // For JPG, draw on a new canvas with a background color
        if (format === 'JPG') {
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            const ctx = finalCanvas.getContext('2d');
            if (ctx) {
                const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-solid').trim();
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
                ctx.drawImage(canvas, 0, 0);
                const imageURL = finalCanvas.toDataURL(mimeType, 0.9);
                const link = document.createElement('a');
                link.href = imageURL;
                link.download = `${filename}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else { // For PNG
            const imageURL = canvas.toDataURL(mimeType);
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `${filename}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Sorry, the export failed. There might be an issue with rendering the image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getExportButtonContent = (format: 'JPG' | 'PNG' | 'PDF') => {
    const Icon = format === 'PDF' ? PdfIcon : ImageIcon;
    if (isExporting === format) {
      return <><Loader className="w-4 h-4 mr-1.5" /><span>{t('exporting')}</span></>;
    }
    return <><Icon className="w-4 h-4 mr-1.5" /><span>{format}</span></>;
  };
  
  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const fontClass = isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
  const fontSizeClass = isPunic ? 'text-7xl' : 'text-6xl';

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-[color:var(--color-surface-solid)] rounded-[var(--border-radius)] relative overflow-hidden p-4">
      {/* Top Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">{t('layoutEditTitle')}</h3>
      </div>

      {/* Preview Area */}
      <div className="flex-grow flex items-center justify-center w-full">
        <div ref={previewRef} className="p-8 inline-block bg-[color:var(--color-surface-solid)]">
          <div className="border-2 border-dashed border-[color:var(--color-primary)]/70 p-4">
            <span className={`${fontClass} ${fontSizeClass} text-[color:var(--color-text)]`}>
              {words[selectedIndex] || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-lg glass-panel p-2 rounded-xl shadow-lg flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
            <button onClick={() => handleNav('prev')} className="p-2 rounded-full hover:bg-white/10" title="Previous Word"><ArrowLeftIcon className="w-5 h-5" /></button>
            <span className="font-semibold px-2 tabular-nums">{words.length > 0 ? `${selectedIndex + 1} / ${words.length}` : '0 / 0'}</span>
            <button onClick={() => handleNav('next')} className="p-2 rounded-full hover:bg-white/10" title="Next Word"><ArrowRightIcon className="w-5 h-5" /></button>
        </div>

        <div className="w-px h-6 bg-[color:var(--color-border)]"></div>
        
        <div className="flex items-center space-x-2">
            <button onClick={() => handleExport('JPG')} disabled={!!isExporting} className="flex items-center justify-center px-4 py-2 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
                {getExportButtonContent('JPG')}
            </button>
            <button onClick={() => handleExport('PNG')} disabled={!!isExporting} className="flex items-center justify-center px-4 py-2 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
                {getExportButtonContent('PNG')}
            </button>
            <button onClick={() => handleExport('PDF')} disabled={!!isExporting} className="flex items-center justify-center px-4 py-2 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
                {getExportButtonContent('PDF')}
            </button>
        </div>
        
        <div className="w-px h-6 bg-[color:var(--color-border)]"></div>
        
        <button onClick={onExit} className="p-2.5 rounded-full bg-[color:var(--color-secondary)] text-white hover:opacity-90" title={t('done')}><CheckIcon className="w-5 h-5"/></button>
      </div>
    </div>
  );
};

export default ExportEditor;