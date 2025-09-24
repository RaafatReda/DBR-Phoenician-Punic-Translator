import React, { useRef, useEffect, useState } from 'react';
import { recognizePhoenicianTextInImage } from '../services/geminiService';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import UndoIcon from './icons/UndoIcon';
import RedoIcon from './icons/RedoIcon';

interface HandwritingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onRecognize: (text: string) => void;
  t: (key: string) => string;
}

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ isOpen, onClose, onRecognize, t }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]); // For stroke smoothing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);


  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on container size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    context.lineCap = 'round';
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    context.lineWidth = 4;
    contextRef.current = context;
    
    // Initialize history only if it's empty
    if (history.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const initialImageData = context.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialImageData]);
        setHistoryIndex(0);
    }


  }, [isOpen]);

  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if (e.nativeEvent instanceof MouseEvent) {
      return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    }
    if (e.nativeEvent instanceof TouchEvent && e.nativeEvent.touches.length > 0) {
      return { 
        x: e.nativeEvent.touches[0].clientX - rect.left, 
        y: e.nativeEvent.touches[0].clientY - rect.top 
      };
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoordinates(e);
    if (!coords || !contextRef.current) return;
    
    setIsDrawing(true);
    pointsRef.current = [coords];
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // If we've undone, and now we draw again, we want to remove the 'future' states
    const newHistory = history.slice(0, historyIndex + 1);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([...newHistory, imageData]);
    setHistoryIndex(newHistory.length);
  };


  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Draw the final segment to the last point
    if (contextRef.current && pointsRef.current.length > 1) {
      const context = contextRef.current;
      const points = pointsRef.current;
      if (points.length < 3) {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        context.lineTo(points[1].x, points[1].y);
        context.stroke();
      }
    }
    
    pointsRef.current = [];
    saveHistory();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const coords = getEventCoordinates(e);
    if (!coords) return;
    
    pointsRef.current.push(coords);
    const context = contextRef.current;
    const points = pointsRef.current;

    // We need at least 3 points to draw a curve.
    if (points.length < 3) {
      return;
    }

    // Use the midpoint of the previous two points and the midpoint of the current two points
    // to draw a quadratic Bezier curve. The control point is the point in the middle.
    const p0 = points[points.length - 3];
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    context.beginPath();
    context.moveTo(mid1.x, mid1.y);
    context.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
    context.stroke();
  };

  const restoreHistory = (index: number) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !history[index]) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(history[index], 0, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreHistory(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreHistory(newIndex);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setError(null);
      // Reset history to the initial cleared state
      const initialImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialImageData]);
      setHistoryIndex(0);
    }
  };

  const handleRecognize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    setError(null);
    try {
      // Create a temporary canvas for pre-processing to improve recognition accuracy.
      const processedCanvas = document.createElement('canvas');
      processedCanvas.width = canvas.width;
      processedCanvas.height = canvas.height;
      const ctx = processedCanvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not create canvas context for processing.");
      }
      
      const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-end').trim();
      ctx.fillStyle = themeBg || '#1A1A40'; 
      ctx.fillRect(0, 0, processedCanvas.width, processedCanvas.height);
      
      ctx.filter = 'blur(0.5px)';
      ctx.drawImage(canvas, 0, 0);

      const dataUrl = processedCanvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];
      const recognizedText = await recognizePhoenicianTextInImage(base64Data);
      onRecognize(recognizedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handwriting-title"
    >
      <div className="glass-panel rounded-[var(--border-radius)] shadow-2xl w-full max-w-lg h-[60vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-[color:var(--color-border)] flex-shrink-0">
          <h2 id="handwriting-title" className="text-xl font-semibold text-[color:var(--color-primary)]">{t('handwritingHeader')}</h2>
          <button onClick={onClose} className="text-[color:var(--color-text)] hover:text-[color:var(--color-primary)] transition-colors" aria-label={t('handwritingClose')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-2 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-[color:var(--color-bg-end)] rounded-md touch-none"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
        </main>
        
        {error && (
            <div className="text-center px-4 pb-2 text-sm text-red-400">
                {error}
            </div>
        )}

        <footer className="p-4 border-t border-[color:var(--color-border)] flex-shrink-0 flex items-center justify-center space-x-2 sm:space-x-4">
            <button
                onClick={clearCanvas}
                disabled={isLoading || historyIndex <= 0}
                className="px-6 py-2 font-semibold text-[color:var(--color-text)] bg-transparent border-2 border-[color:var(--color-border)] rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
                {t('handwritingClear')}
            </button>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleUndo}
                    disabled={isLoading || historyIndex <= 0}
                    className="p-3 rounded-full text-[color:var(--color-text)] bg-transparent border border-[color:var(--color-border)] hover:bg-white/10 disabled:opacity-50 disabled:text-gray-600 transition-colors"
                    title={t('handwritingUndo')}
                    aria-label={t('handwritingUndo')}
                >
                    <UndoIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={isLoading || historyIndex >= history.length - 1}
                    className="p-3 rounded-full text-[color:var(--color-text)] bg-transparent border border-[color:var(--color-border)] hover:bg-white/10 disabled:opacity-50 disabled:text-gray-600 transition-colors"
                    title={t('handwritingRedo')}
                    aria-label={t('handwritingRedo')}
                >
                    <RedoIcon className="w-5 h-5" />
                </button>
            </div>
            <button
                onClick={handleRecognize}
                disabled={isLoading || historyIndex <= 0}
                className="flex items-center justify-center w-48 px-6 py-2.5 font-semibold text-[color:var(--color-bg-start)] bg-[color:var(--color-primary)] rounded-lg shadow-[var(--shadow-md)] hover:shadow-[0_0_15px_var(--color-glow)] disabled:opacity-50 transition-all"
            >
                {isLoading ? <Loader className="w-5 h-5 mr-2" /> : null}
                {isLoading ? t('handwritingRecognizing') : t('handwritingRecognize')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default HandwritingCanvas;