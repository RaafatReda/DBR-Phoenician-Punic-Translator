import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TransliterationOutput, PhoenicianDialect } from '../types';
import EditableText from './EditableText';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CheckIcon from './icons/CheckIcon';
import PdfIcon from './icons/PdfIcon';
import ImageIcon from './icons/ImageIcon';
import Loader from './Loader';

interface ElementState {
  id: number;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface GroupEditCanvasProps {
  translationResult: TransliterationOutput;
  dialect: PhoenicianDialect;
  onExit: () => void;
  t: (key: string) => string;
}

const GroupEditCanvas: React.FC<GroupEditCanvasProps> = ({ translationResult, dialect, onExit, t }) => {
  const [elements, setElements] = useState<ElementState[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<false | 'JPG' | 'PNG' | 'PDF'>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (translationResult.grammar && canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const initialElements: ElementState[] = translationResult.grammar.map((token, index) => {
          const wordWidth = token.token.length * 25; // Estimate
          const xPos = canvasWidth / 2 - wordWidth / 2 + (index - (translationResult.grammar!.length -1) / 2) * 50;
          return {
            id: index,
            text: token.token,
            x: xPos,
            y: 60,
            scale: 1,
            rotation: 0,
          };
      });
      setElements(initialElements);
      setSelectedIndex(0);
    }
  }, [translationResult]);

  const handleUpdate = useCallback((id: number, updates: Partial<ElementState>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const handleSelect = useCallback((id: number) => {
    setSelectedIndex(id);
  }, []);
  
  const handleNav = (direction: 'next' | 'prev') => {
      const total = elements.length;
      if(total === 0) return;
      const newIndex = direction === 'next' ? (selectedIndex + 1) % total : (selectedIndex - 1 + total) % total;
      setSelectedIndex(newIndex);
  }

  const handleExport = async (format: 'JPG' | 'PNG' | 'PDF') => {
    if (!canvasRef.current || isExporting) return;
    
    setIsExporting(format);
    const originalSelectedIndex = selectedIndex;
    setSelectedIndex(-1); // Deselect all to hide controls

    // Allow UI to update before capturing
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const canvasElement = canvasRef.current;
        if (!canvasElement) throw new Error("Canvas element not found");

        const computedStyle = getComputedStyle(canvasElement);
        const bgColor = computedStyle.backgroundColor;

        const canvas = await window.html2canvas(canvasElement, {
            backgroundColor: format === 'PNG' ? null : bgColor,
            useCORS: true,
            logging: false, // Turn off logging for cleaner console
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `dbr-layout-${timestamp}`;

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
            const imageURL = canvas.toDataURL(mimeType, 0.95);
            
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `${filename}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert("Sorry, the export failed. There might be an issue with rendering the image. Please try again.");
    } finally {
        setIsExporting(false);
        setSelectedIndex(originalSelectedIndex); // Reselect the element
    }
  };

  const getExportButtonContent = (format: 'JPG' | 'PNG' | 'PDF') => {
    const Icon = format === 'PDF' ? PdfIcon : ImageIcon;
    if (isExporting === format) {
        return <><Loader className="w-4 h-4 mr-1.5" /><span>{t('exporting')}</span></>;
    }
    return <><Icon className="w-4 h-4 mr-1" /><span>{format}</span></>;
  };

  return (
    <div className="w-full min-h-[10rem] max-h-[50vh] bg-[color:var(--color-surface-solid)] rounded-[var(--border-radius)] relative overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0">
        {elements.map(el => (
          <EditableText
            key={el.id}
            element={el}
            dialect={dialect}
            onUpdate={handleUpdate}
            isSelected={el.id === selectedIndex}
            onSelect={handleSelect}
            isExporting={!!isExporting}
          />
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 sm:space-x-2 glass-panel p-1.5 rounded-full shadow-lg text-sm">
        <button onClick={() => handleNav('prev')} className="p-2 rounded-full hover:bg-white/10" title="Previous Word"><ArrowLeftIcon className="w-4 h-4" /></button>
        <span className="font-semibold px-2">{elements.length > 0 ? `${selectedIndex + 1} / ${elements.length}`: '0 / 0'}</span>
        <button onClick={() => handleNav('next')} className="p-2 rounded-full hover:bg-white/10" title="Next Word"><ArrowRightIcon className="w-4 h-4" /></button>
        
        <div className="w-px h-5 bg-[color:var(--color-border)] mx-1 sm:mx-2"></div>

        <button onClick={() => handleExport('JPG')} disabled={!!isExporting} className="flex items-center min-w-[90px] justify-center px-3 py-1.5 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
            {getExportButtonContent('JPG')}
        </button>
        <button onClick={() => handleExport('PNG')} disabled={!!isExporting} className="flex items-center min-w-[90px] justify-center px-3 py-1.5 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
            {getExportButtonContent('PNG')}
        </button>
        <button onClick={() => handleExport('PDF')} disabled={!!isExporting} className="flex items-center min-w-[90px] justify-center px-3 py-1.5 font-semibold rounded-md hover:bg-white/10 disabled:opacity-50">
            {getExportButtonContent('PDF')}
        </button>
        
        <div className="w-px h-5 bg-[color:var(--color-border)] mx-1 sm:mx-2"></div>
        
        <button onClick={onExit} className="p-2 rounded-full bg-[color:var(--color-secondary)] text-white hover:opacity-90" title={t('done')}><CheckIcon className="w-5 h-5"/></button>
      </div>
    </div>
  );
};

export default GroupEditCanvas;