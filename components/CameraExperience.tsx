import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect } from '../types';
import { recognizeSymbolInImage, recognizeObjectsInImage, RecognizedObject } from '../services/geminiService';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import ImageEditor from './ImageEditor';
import ArIcon from './icons/ArIcon';
import ScanIcon from './icons/ScanIcon';
import SymbolIcon from './icons/SymbolIcon';
import CameraIcon from './icons/CameraIcon';
import SymbolResultCard from './SymbolResultCard';
import UploadIcon from './icons/UploadIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import { UILang } from '../lib/i18n';

type Mode = 'PHOTO' | 'SCAN' | 'SYMBOL' | 'AR';
const MODES: { id: Mode, labelKey: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'PHOTO', labelKey: 'photo', icon: CameraIcon },
    { id: 'SCAN', labelKey: 'scan', icon: ScanIcon },
    { id: 'SYMBOL', labelKey: 'symbol', icon: SymbolIcon },
    { id: 'AR', labelKey: 'ar', icon: ArIcon },
];
const WHEEL_RADIUS = 120; // in pixels
const ANALYSIS_INTERVAL = 2000; // ms between recognition calls
const LERP_FACTOR = 0.15; // For smooth animation

interface ArObject {
    id: string; // Unique ID, e.g., "person-168..."
    name: string;
    phoenician: string;
    // Animation properties
    currentX: number;
    currentY: number;
    targetX: number;
    targetY: number;
    opacity: number;
    targetOpacity: number;
    isDead: boolean;
}

interface CameraExperienceProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (imageData: string) => void;
    dialect: PhoenicianDialect;
    t: (key: string) => string;
    uiLang: UILang;
}

const CameraExperience: React.FC<CameraExperienceProps> = ({ isOpen, onClose, onScan, dialect, t, uiLang }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const arCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const wheelRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const interactionRef = useRef<{ isDragging: boolean; startAngle: number; startRotation: number; }>({ isDragging: false, startAngle: 0, startRotation: 0 });
    const animationFrameId = useRef<number | null>(null);
    const analysisIntervalId = useRef<number | null>(null);

    const [rotationAngle, setRotationAngle] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [symbolResult, setSymbolResult] = useState<{ name: string; description: string } | null>(null);
    const [isProcessingSymbol, setIsProcessingSymbol] = useState(false);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [arObjects, setArObjects] = useState<ArObject[]>([]);

    const activeMode = MODES[activeIndex]?.id;
    const anglePerItem = 360 / MODES.length;

    const stopAr = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        if (analysisIntervalId.current) {
            clearInterval(analysisIntervalId.current);
            analysisIntervalId.current = null;
        }
        setArObjects([]);
        setIsRecognizing(false);
        const canvas = arCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        stopAr();
    }, [stopAr]);

    const startStream = useCallback(async (mode: 'user' | 'environment') => {
        stopStream();
        setIsLoading(true);
        setError(null);
        setSymbolResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('cameraError'));
        } finally {
            setIsLoading(false);
        }
    }, [stopStream, t]);

    const analyzeFrame = useCallback(async () => {
        if (isRecognizing || !videoRef.current || videoRef.current.readyState < 2) return;
        
        setIsRecognizing(true);
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        
        const MAX_WIDTH = 640;
        const scale = MAX_WIDTH / video.videoWidth;
        tempCanvas.width = MAX_WIDTH;
        tempCanvas.height = video.videoHeight * scale;
        
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
            setIsRecognizing(false);
            return;
        }

        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/png').split(',')[1];

        const results = await recognizeObjectsInImage(base64Data, dialect);
        
        setArObjects(prevObjects => {
            const now = Date.now();
            const updatedObjects: ArObject[] = [];
            const matchedNames = new Set<string>();

            // Update existing and add new objects
            results.forEach(res => {
                const existing = prevObjects.find(p => p.name === res.name);
                const canvas = arCanvasRef.current!;
                const targetX = res.box.x * canvas.width + (res.box.width * canvas.width) / 2;
                const targetY = res.box.y * canvas.height + (res.box.height * canvas.height) / 2;

                if (existing) {
                    updatedObjects.push({ ...existing, targetX, targetY, targetOpacity: 1, isDead: false });
                } else {
                    updatedObjects.push({
                        id: `${res.name}-${now}`,
                        name: res.name,
                        phoenician: res.phoenician,
                        currentX: targetX, currentY: targetY,
                        targetX, targetY,
                        opacity: 0, targetOpacity: 1, isDead: false,
                    });
                }
                matchedNames.add(res.name);
            });

            // Mark unmatched objects for fade out
            prevObjects.forEach(p => {
                if (!matchedNames.has(p.name)) {
                    updatedObjects.push({ ...p, targetOpacity: 0 });
                }
            });

            return updatedObjects;
        });

        setIsRecognizing(false);
    }, [isRecognizing, dialect]);

    const runArOverlayAnimation = useCallback(() => {
        if (activeMode !== 'AR') {
            stopAr();
            return;
        }

        const canvas = arCanvasRef.current;
        if (!canvas) return;
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const punicFont = getComputedStyle(document.documentElement).getPropertyValue('--font-punic').trim();
        const phoenicianFont = getComputedStyle(document.documentElement).getPropertyValue('--font-phoenician').trim();
        const fontName = dialect === PhoenicianDialect.PUNIC ? punicFont : phoenicianFont;
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        
        let hasActiveObjects = false;
        
        setArObjects(prev => {
            const nextObjects = prev.map(obj => {
                const newObj = { ...obj };
                newObj.currentX += (newObj.targetX - newObj.currentX) * LERP_FACTOR;
                newObj.currentY += (newObj.targetY - newObj.currentY) * LERP_FACTOR;
                newObj.opacity += (newObj.targetOpacity - newObj.opacity) * LERP_FACTOR;

                if (newObj.targetOpacity === 0 && newObj.opacity < 0.01) {
                    newObj.isDead = true;
                }

                if (!newObj.isDead) {
                    hasActiveObjects = true;
                    ctx.save();
                    ctx.globalAlpha = newObj.opacity;
                    const fontSize = 28;
                    ctx.font = `${fontSize}px ${fontName}`;
                    ctx.fillStyle = primaryColor;
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.lineWidth = 5;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.strokeText(newObj.phoenician, newObj.currentX, newObj.currentY);
                    ctx.fillText(newObj.phoenician, newObj.currentX, newObj.currentY);
                    ctx.restore();
                }
                return newObj;
            });
            return nextObjects.filter(obj => !obj.isDead);
        });

        if (hasActiveObjects || arObjects.length > 0) {
            animationFrameId.current = requestAnimationFrame(runArOverlayAnimation);
        }
    }, [activeMode, dialect, stopAr, arObjects.length]);

    useEffect(() => {
        if (isOpen && !capturedImage) {
            startStream(facingMode);
        } else {
            stopStream();
        }
        return () => stopStream();
    }, [isOpen, facingMode, capturedImage, startStream, stopStream]);

    useEffect(() => {
        if (isOpen && activeMode === 'AR') {
            stopAr(); // Clear previous state
            analysisIntervalId.current = window.setInterval(analyzeFrame, ANALYSIS_INTERVAL);
            animationFrameId.current = requestAnimationFrame(runArOverlayAnimation);
        } else {
            stopAr();
        }

        return () => stopAr();
    }, [isOpen, activeMode, analyzeFrame, runArOverlayAnimation, stopAr]);

    const snapToNearest = useCallback((angle: number) => {
        const closestIndex = Math.round(angle / anglePerItem);
        const snappedAngle = closestIndex * anglePerItem;
        setRotationAngle(snappedAngle);
        const newActiveIndex = ((-closestIndex % MODES.length) + MODES.length) % MODES.length;
        setActiveIndex(newActiveIndex);
    }, [anglePerItem]);

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const wheel = wheelRef.current;
        if (!wheel) return;
        
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        
        interactionRef.current = {
            isDragging: true,
            startAngle: startAngle,
            startRotation: rotationAngle,
        };
        wheel.style.transition = 'none';
    }, [rotationAngle]);

    const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!interactionRef.current.isDragging || !wheelRef.current) return;
        
        const { startAngle, startRotation } = interactionRef.current;
        const wheel = wheelRef.current;
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        const angleDiff = currentAngle - startAngle;
        
        setRotationAngle(startRotation + angleDiff);
    }, []);

    const handleDragEnd = useCallback(() => {
        if (!interactionRef.current.isDragging || !wheelRef.current) return;
        
        interactionRef.current.isDragging = false;
        wheelRef.current.style.transition = '';
        snapToNearest(rotationAngle);
    }, [rotationAngle, snapToNearest]);

    const handleCapture = async () => {
        const video = videoRef.current;
        if (!video || activeMode === 'AR') return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        setCapturedImage(dataUrl);
        setIsEditing(true);
        stopStream();
    };

    const handleEditConfirm = async (editedImageDataUrl: string) => {
        const base64Data = editedImageDataUrl.split(',')[1];
        if (activeMode === 'SCAN') {
            onScan(base64Data);
        } else if (activeMode === 'PHOTO') {
            handleDownloadPhoto(editedImageDataUrl);
            setIsEditing(false);
            setCapturedImage(null);
        } else if (activeMode === 'SYMBOL') {
            setIsEditing(false);
            setCapturedImage(null);
            setIsProcessingSymbol(true);
            setSymbolResult(null);
            try {
                const result = await recognizeSymbolInImage(base64Data, uiLang);
                setSymbolResult(result);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Symbol recognition failed');
            } finally {
                setIsProcessingSymbol(false);
            }
        }
    };
    
    const handleDownloadPhoto = (dataUrl: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `dbr-photo-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose(); // Close camera after download
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setIsEditing(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setCapturedImage(result);
                setIsEditing(true);
                stopStream();
            };
            reader.readAsDataURL(file);
        }
    };
    
    const getEditorConfirmText = () => {
        switch(activeMode) {
            case 'SCAN': return t('scanText');
            case 'SYMBOL': return t('recognizeSymbol');
            case 'PHOTO': return t('downloadPhoto');
            default: return t('useThisPhoto');
        }
    };

    if (!isOpen) return null;

    if (isEditing && capturedImage) {
        return <ImageEditor 
            src={capturedImage} 
            onConfirm={handleEditConfirm} 
            onCancel={handleRetake} 
            t={t}
            titleText={t('editAndScan')}
            confirmText={getEditorConfirmText()}
            cancelText={t('retakePhoto')}
        />;
    }

    return (
        <div className="camera-experience-modal">
            <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full glass-panel" title={t('uploadPhoto')}>
                    <UploadIcon className="h-6 w-6" />
                </button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="p-2 rounded-full glass-panel" title={t('switchCamera')}>
                   <SwitchCameraIcon className="h-6 w-6" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full glass-panel" aria-label={t('textScannerClose')}>
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`} />
                <canvas ref={arCanvasRef} className="ar-canvas" />
                {activeMode === 'AR' && isRecognizing && <div className="ar-recognizing-indicator"></div>}
                
                {isLoading && <Loader className="w-10 h-10 text-[color:var(--color-primary)]" />}
                {error && <div className="absolute text-center text-red-400 p-4 bg-black/50 rounded-md z-30">{error}</div>}
                
                {isProcessingSymbol && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader className="w-10 h-10 text-[color:var(--color-primary)]"/></div>}
                {symbolResult && <SymbolResultCard name={symbolResult.name} description={symbolResult.description} onClose={() => setSymbolResult(null)} t={t} />}
            </main>

            <div className="camera-controls-container">
                <div className="mode-wheel-container">
                     <div className="mode-pointer"></div>
                     <div className="wheel-track"></div>
                     <div
                        ref={wheelRef}
                        className="mode-wheel"
                        style={{ transform: `rotate(${rotationAngle}deg)` }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        onMouseMove={handleDragMove}
                        onTouchMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchEnd={handleDragEnd}
                     >
                        {MODES.map((mode, index) => {
                            const itemAngle = index * anglePerItem;
                            const style = { '--transform-pos': `rotate(${itemAngle}deg) translateY(-${WHEEL_RADIUS}px) rotate(-${itemAngle}deg)` } as React.CSSProperties;
                            style.transform = style['--transform-pos'];

                             return (
                                <div key={mode.id} className={`mode-wheel-item ${index === activeIndex ? 'active' : ''}`} style={style}>
                                    <mode.icon className="w-6 h-6" />
                                    <span>{t(mode.labelKey) || mode.labelKey}</span>
                                </div>
                            );
                        })}
                     </div>
                </div>
                
                <button
                    onClick={handleCapture}
                    disabled={isLoading || isProcessingSymbol || activeMode === 'AR'}
                    className="shutter-button disabled:opacity-50"
                    aria-label="Capture"
                >
                    <div className="shutter-button-inner"></div>
                </button>
            </div>
        </div>
    );
};

export default CameraExperience;