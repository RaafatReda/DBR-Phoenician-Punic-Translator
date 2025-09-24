import React, { useState, useRef, useEffect, useCallback } from 'react';
import Loader from './Loader';
import SunIcon from './icons/SunIcon';
import ContrastIcon from './icons/ContrastIcon';
import ResetIcon from './icons/ResetIcon';

interface ImageEditorProps {
    src: string;
    onConfirm: (croppedDataUrl: string) => void;
    onCancel: () => void;
    t: (key: string) => string;
}

// FIX: Define HANDLE_SIZE at the module scope so it can be accessed by all functions within the component.
const HANDLE_SIZE = 12;

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onConfirm, onCancel, t }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const interactionRef = useRef<{
        type: 'move' | 'tl' | 'tr' | 'bl' | 'br';
        startX: number;
        startY: number;
        startCrop: { x: number; y: number; width: number; height: number; };
    } | null>(null);

    const [crop, setCrop] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [grayscale, setGrayscale] = useState(false);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const image = imageRef.current;
        if (!canvas || !ctx || !image.src) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        const { width: canvasWidth, height: canvasHeight } = parent.getBoundingClientRect();
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.save();
        
        ctx.beginPath();
        ctx.rect(crop.x, crop.y, crop.width, crop.height);
        ctx.clip();

        const scale = Math.min(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
        const imgDisplayWidth = image.naturalWidth * scale;
        const imgDisplayHeight = image.naturalHeight * scale;
        const imgX = (canvasWidth - imgDisplayWidth) / 2;
        const imgY = (canvasHeight - imgDisplayHeight) / 2;
        
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale ? 1 : 0})`;
        ctx.drawImage(image, imgX, imgY, imgDisplayWidth, imgDisplayHeight);
        
        ctx.restore();
        
        ctx.strokeStyle = '#FBBF24'; // amber-400
        ctx.lineWidth = 2;
        ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
        
        const hs = HANDLE_SIZE / 2;
        ctx.fillStyle = '#FBBF24';
        
        const drawHandle = (x: number, y: number) => {
            ctx.fillRect(x - hs, y - hs, HANDLE_SIZE, HANDLE_SIZE);
        }
        
        drawHandle(crop.x, crop.y);
        drawHandle(crop.x + crop.width, crop.y);
        drawHandle(crop.x, crop.y + crop.height);
        drawHandle(crop.x + crop.width, crop.y + crop.height);

    }, [crop, brightness, contrast, grayscale]);

    useEffect(() => {
        const image = imageRef.current;
        image.src = src;
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            const canvas = canvasRef.current;
            if (canvas && canvas.parentElement) {
                const { width, height } = canvas.parentElement.getBoundingClientRect();
                const aspectRatio = image.naturalWidth / image.naturalHeight;
                let cropWidth, cropHeight;

                if (width / height > aspectRatio) {
                    cropHeight = height * 0.75;
                    cropWidth = cropHeight * aspectRatio;
                } else {
                    cropWidth = width * 0.75;
                    cropHeight = cropWidth / aspectRatio;
                }
                
                setCrop({
                    x: (width - cropWidth) / 2,
                    y: (height - cropHeight) / 2,
                    width: cropWidth,
                    height: cropHeight,
                });
            }
        };

        const handleResize = () => draw();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [src, draw]);
    
    useEffect(() => {
        draw();
    }, [crop, draw, brightness, contrast, grayscale]);

    const getInteractionType = (x: number, y: number) => {
        const hs = HANDLE_SIZE * 1.5; // Larger touch area
        if (x > crop.x - hs && x < crop.x + hs && y > crop.y - hs && y < crop.y + hs) return 'tl';
        if (x > crop.x + crop.width - hs && x < crop.x + crop.width + hs && y > crop.y - hs && y < crop.y + hs) return 'tr';
        if (x > crop.x - hs && x < crop.x + hs && y > crop.y + crop.height - hs && y < crop.y + crop.height + hs) return 'bl';
        if (x > crop.x + crop.width - hs && x < crop.x + crop.width + hs && y > crop.y + crop.height - hs && y < crop.y + crop.height + hs) return 'br';
        if (x > crop.x && x < crop.x + crop.width && y > crop.y && y < crop.y + crop.height) return 'move';
        return null;
    };

    const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const type = getInteractionType(x, y);
        if (type) {
            e.preventDefault();
            interactionRef.current = { type, startX: x, startY: y, startCrop: { ...crop } };
        }
    };
    
    const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!interactionRef.current) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const dx = mouseX - interactionRef.current.startX;
        const dy = mouseY - interactionRef.current.startY;
        const { startCrop, type } = interactionRef.current;
        let newCrop = { ...startCrop };
        const minSize = 20;

        if (type === 'move') {
            newCrop.x = Math.max(0, Math.min(startCrop.x + dx, rect.width - newCrop.width));
            newCrop.y = Math.max(0, Math.min(startCrop.y + dy, rect.height - newCrop.height));
        } else {
            let tempX = newCrop.x;
            let tempY = newCrop.y;
            let tempW = newCrop.width;
            let tempH = newCrop.height;

            if (type.includes('l')) { tempX = startCrop.x + dx; tempW = startCrop.width - dx; }
            if (type.includes('r')) { tempW = startCrop.width + dx; }
            if (type.includes('t')) { tempY = startCrop.y + dy; tempH = startCrop.height - dy; }
            if (type.includes('b')) { tempH = startCrop.height + dy; }
            
            if (tempW > minSize) { newCrop.x = tempX; newCrop.width = tempW; }
            if (tempH > minSize) { newCrop.y = tempY; newCrop.height = tempH; }
        }
        
        setCrop(newCrop);
    };

    const handleInteractionEnd = () => {
        interactionRef.current = null;
    };

    const handleConfirm = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const canvas = canvasRef.current;
            const image = imageRef.current;
            if (!canvas || !image.src) {
                setIsProcessing(false);
                return;
            };

            const { naturalWidth, naturalHeight } = image;
            const scale = Math.min(canvas.width / naturalWidth, canvas.height / naturalHeight);
            const imgDisplayWidth = naturalWidth * scale;
            const imgDisplayHeight = naturalHeight * scale;
            const imgX = (canvas.width - imgDisplayWidth) / 2;
            const imgY = (canvas.height - imgDisplayHeight) / 2;
            
            const tempCanvas = document.createElement('canvas');
            const sourceX = (crop.x - imgX) / scale;
            const sourceY = (crop.y - imgY) / scale;
            const sourceWidth = crop.width / scale;
            const sourceHeight = crop.height / scale;

            tempCanvas.width = sourceWidth;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
                tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale ? 1 : 0})`;
                tempCtx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
                onConfirm(tempCanvas.toDataURL('image/jpeg'));
            } else {
                setIsProcessing(false);
            }
        }, 50);
    };
    
    const handleReset = () => {
        setBrightness(100);
        setContrast(100);
        setGrayscale(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#0D1117] text-white/90">
            <div className="flex-grow relative cursor-grab active:cursor-grabbing bg-black">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full"
                    onMouseDown={handleInteractionStart}
                    onMouseMove={handleInteractionMove}
                    onMouseUp={handleInteractionEnd}
                    onMouseLeave={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchMove={handleInteractionMove}
                    onTouchEnd={handleInteractionEnd}
                />
            </div>
            
            <div className="p-4 pt-3 flex-shrink-0 flex flex-col space-y-3">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex items-center space-x-2">
                        <SunIcon className="w-5 h-5 opacity-80" />
                        <label htmlFor="brightness" className="text-sm font-semibold w-20 shrink-0">{t('brightness')}</label>
                        <input id="brightness" type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value, 10))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <ContrastIcon className="w-5 h-5 opacity-80" />
                        <label htmlFor="contrast" className="text-sm font-semibold w-20 shrink-0">{t('contrast')}</label>
                        <input id="contrast" type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value, 10))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider" />
                    </div>
                </div>
                 <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center">
                        <input id="grayscale" type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} className="w-4 h-4 text-purple-400 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-offset-gray-900" />
                        <label htmlFor="grayscale" className="ml-2 text-sm font-semibold">{t('grayscale')}</label>
                    </div>
                    <button onClick={handleReset} className="p-2 rounded-full hover:bg-white/10" title={t('resetAdjustments')}>
                        <ResetIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0 flex items-center justify-center space-x-4">
                 <button onClick={onCancel} className="px-8 py-2.5 font-semibold text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                    {t('retakePhoto')}
                </button>
                 <button onClick={handleConfirm} disabled={isProcessing} className="flex items-center justify-center w-40 px-8 py-3 font-semibold text-black bg-amber-400 rounded-lg shadow-md hover:bg-amber-300 transition-all disabled:opacity-50">
                    {isProcessing ? <Loader className="w-5 h-5"/> : t('scanText')}
                </button>
            </div>
        </div>
    );
};

export default ImageEditor;