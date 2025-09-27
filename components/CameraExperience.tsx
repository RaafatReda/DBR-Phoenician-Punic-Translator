import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect, RecognizedObject } from '../types';
import { recognizeObjectsInImage } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';
import EyeIcon from './icons/EyeIcon';
import FocusIcon from './icons/FocusIcon';
import ExposureIcon from './icons/ExposureIcon';
import WhiteBalanceIcon from './icons/WhiteBalanceIcon';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';
import SunIcon from './icons/SunIcon';
import ContrastIcon from './icons/ContrastIcon';
import UploadIcon from './icons/UploadIcon';
import RefreshIcon from './icons/RefreshIcon';


// Add type definitions for experimental MediaTrackCapabilities properties.
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
    zoom?: { min: number; max: number; step: number; };
    focusDistance?: { min: number; max: number; step: number; };
    exposureTime?: { min: number; max: number; step: number; };
    colorTemperature?: { min: number; max: number; step: number; };
    whiteBalanceMode?: string[];
    focusMode?: string[];
    exposureMode?: string[];
}

// Internal type for animated AR objects on screen
interface ArObject {
    id: string; 
    name: string;
    phoenician: string;
    latin: string;
    arabicTransliteration: string;
    description: string;
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
    dialect: PhoenicianDialect;
    t: (key: string) => string;
    uiLang: UILang;
}

const LERP_FACTOR = 0.1; // For smooth animation of AR tags
const ANALYSIS_INTERVAL = 2000; // ms between AR recognition calls

const CameraExperience: React.FC<CameraExperienceProps> = ({ isOpen, onClose, dialect, t, uiLang }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const arOverlayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const analysisIntervalId = useRef<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Camera Capabilities State
    const [capabilities, setCapabilities] = useState<ExtendedMediaTrackCapabilities | null>(null);
    const [zoom, setZoom] = useState(1);
    const [focus, setFocus] = useState(0);
    const [exposure, setExposure] = useState(0);
    const [whiteBalance, setWhiteBalance] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    // AR State
    const [isArEnabled, setIsArEnabled] = useState(true);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [arObjects, setArObjects] = useState<ArObject[]>([]);
    const [arError, setArError] = useState<string | null>(null);

    const stopAr = useCallback(() => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (analysisIntervalId.current) clearInterval(analysisIntervalId.current);
        animationFrameId.current = null;
        analysisIntervalId.current = null;
        setArObjects([]);
        setIsRecognizing(false);
    }, []);

    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        stopAr();
    }, [stopAr]);

    const startStream = useCallback(async (mode: 'user' | 'environment') => {
        stopStream();
        setIsLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            
            await new Promise(resolve => setTimeout(resolve, 200));
            const track = stream.getVideoTracks()[0];
            if (!track) throw new Error("No video track found");

            const caps = track.getCapabilities() as ExtendedMediaTrackCapabilities;
            setCapabilities(caps);

            if (caps.exposureMode?.includes('continuous')) {
                await track.applyConstraints({ advanced: [{ exposureMode: 'continuous' } as any] })
                    .catch(e => console.warn("Could not set continuous exposure.", e));
            }

            setZoom(caps.zoom?.min ?? 1);
            setFocus(caps.focusDistance?.min ?? 0);
            setExposure(caps.exposureTime?.min ?? 0);
            setWhiteBalance(caps.colorTemperature?.min ?? 0);

        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('cameraError'));
        } finally {
            setIsLoading(false);
        }
    }, [stopStream, t]);
    
    useEffect(() => {
        if (isOpen) {
            startStream(facingMode);
        } else {
            stopStream();
        }
        return () => stopStream();
    }, [isOpen, facingMode, startStream, stopStream]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        }
    }, [brightness, contrast]);

    useEffect(() => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track || !capabilities) return;

        const constraints: any = { advanced: [] };
        if (capabilities.zoom) constraints.advanced.push({ zoom });
        if (capabilities.focusMode?.includes('manual') && capabilities.focusDistance) constraints.advanced.push({ focusMode: 'manual', focusDistance: focus });
        if (capabilities.exposureMode?.includes('manual') && capabilities.exposureTime) constraints.advanced.push({ exposureMode: 'manual', exposureTime: exposure });
        if (capabilities.whiteBalanceMode?.includes('manual') && capabilities.colorTemperature) constraints.advanced.push({ whiteBalanceMode: 'manual', colorTemperature: whiteBalance });
        
        if (constraints.advanced.length > 0) {
            track.applyConstraints(constraints).catch(e => console.warn("Failed to apply constraints", e));
        }
    }, [zoom, focus, exposure, whiteBalance, capabilities]);

    const analyzeFrame = useCallback(async () => {
        if (isRecognizing || !videoRef.current || videoRef.current.readyState < 2) return;
        
        setIsRecognizing(true);
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        
        const MAX_WIDTH = 640;
        const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
        tempCanvas.width = video.videoWidth * scale;
        tempCanvas.height = video.videoHeight * scale;
        
        const ctx = tempCanvas.getContext('2d');
        if(!ctx) { setIsRecognizing(false); return; }

        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const results: RecognizedObject[] = await recognizeObjectsInImage(base64Data, dialect, uiLang);
            const overlay = arOverlayRef.current;
            if (!overlay) return;

            const videoAR = video.videoWidth / video.videoHeight;
            const overlayAR = overlay.clientWidth / overlay.clientHeight;
            let displayScale, offsetX = 0, offsetY = 0;

            if (videoAR > overlayAR) { 
                displayScale = overlay.clientWidth / video.videoWidth;
                offsetY = (overlay.clientHeight - video.videoHeight * displayScale) / 2;
            } else {
                displayScale = overlay.clientHeight / video.videoHeight;
                offsetX = (overlay.clientWidth - video.videoWidth * displayScale) / 2;
            }

            setArObjects(prev => {
                const matchedIds = new Set<string>();
                const nextObjects: ArObject[] = results.map(res => {
                    const id = res.name;
                    matchedIds.add(id);
                    const targetX = res.box.x * (video.videoWidth * displayScale) + offsetX + (res.box.width * (video.videoWidth * displayScale) / 2);
                    const targetY = res.box.y * (video.videoHeight * displayScale) + offsetY + (res.box.height * (video.videoHeight * displayScale) / 2);
                    
                    const existing = prev.find(p => p.id === id);
                    if (existing) {
                        return { ...existing, targetX, targetY, targetOpacity: 1, isDead: false };
                    }
                    return {
                        id, name: res.name, phoenician: res.phoenician, latin: res.latin, 
                        arabicTransliteration: res.arabicTransliteration,
                        description: res.description,
                        currentX: targetX, currentY: targetY, targetX, targetY,
                        opacity: 0, targetOpacity: 1, isDead: false,
                    };
                });
                prev.forEach(p => {
                    if (!matchedIds.has(p.id)) {
                        nextObjects.push({ ...p, targetOpacity: 0 });
                    }
                });
                return nextObjects;
            });
        } catch (err) {
            console.error("AR analysis failed:", err);
            setArError(t('arAnalysisFailed'));
            setTimeout(() => setArError(null), 4000);
        } finally {
            setIsRecognizing(false);
        }
    }, [isRecognizing, dialect, uiLang, t]);
    
    const runArAnimation = useCallback(() => {
        if (!isArEnabled) { stopAr(); return; }

        setArObjects(prev => {
            const next = prev.map(obj => {
                const newObj = { ...obj };
                newObj.currentX += (newObj.targetX - newObj.currentX) * LERP_FACTOR;
                newObj.currentY += (newObj.targetY - newObj.currentY) * LERP_FACTOR;
                newObj.opacity += (newObj.targetOpacity - newObj.opacity) * LERP_FACTOR;
                if (newObj.targetOpacity === 0 && newObj.opacity < 0.01) newObj.isDead = true;
                return newObj;
            });
            return next.filter(obj => !obj.isDead);
        });

        animationFrameId.current = requestAnimationFrame(runArAnimation);
    }, [isArEnabled, stopAr]);

    useEffect(() => {
        if (isArEnabled) {
            stopAr();
            analyzeFrame();
            analysisIntervalId.current = window.setInterval(analyzeFrame, ANALYSIS_INTERVAL);
            animationFrameId.current = requestAnimationFrame(runArAnimation);
        } else {
            stopAr();
        }
        return () => stopAr();
    }, [isArEnabled, analyzeFrame, runArAnimation, stopAr]);

    const handleShare = async () => {
        const container = containerRef.current;
        if (!container) return;
        try {
            const canvas = await window.html2canvas(container, {
                 useCORS: true,
                 backgroundColor: '#000',
            });
            const link = document.createElement('a');
            link.download = `dbr-ar-capture-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error("Failed to capture screen:", e);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="camera-experience-modal" ref={containerRef}>
            <video id="camera-feed" ref={videoRef} autoPlay playsInline muted />
            <div ref={arOverlayRef} className="ar-canvas">
                {arObjects.map(obj => {
                    const fontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
                    return (
                        <div 
                            key={obj.id} 
                            className="ar-bubble"
                            style={{
                            opacity: obj.opacity,
                            transform: `translate(-50%, -50%) translate(${obj.currentX}px, ${obj.currentY}px)`
                            }}
                        >
                            <div className={`ar-bubble-phoenician ${fontClass}`}>{obj.phoenician}</div>
                            <div className="ar-bubble-pronunciation">{obj.latin}</div>
                            <div className="ar-bubble-description" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                                {obj.description}
                            </div>
                        </div>
                    );
                })}
            </div>

            {arError && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-4 py-2 rounded-lg z-30 text-sm font-semibold transition-opacity duration-300">
                    {arError}
                </div>
            )}

            <div className="camera-ui-overlay">
                <header className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" aria-label={t('close')}>
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <button onClick={handleShare} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" title={t('downloadPhoto')}>
                            <UploadIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="text-center font-bold text-lg" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
                        <h2 className="[font-family:var(--font-serif)] text-sm tracking-wider">{t('mainTitle')}</h2>
                        <p className="text-xs font-medium text-gray-300">{t('arView')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                         <button onClick={() => analyzeFrame()} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" title={t('analyzeObjects')}>
                           <RefreshIcon className="h-6 w-6" />
                        </button>
                        <button onClick={() => setIsSettingsOpen(o => !o)} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" title={t('advancedSettings')}>
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                {isRecognizing && <div className="ar-recognizing-indicator"></div>}

                <div className={`camera-settings-panel ${isSettingsOpen ? 'open' : ''}`}>
                    <h3 className="text-lg font-bold text-center mt-8 mb-4">{t('advancedSettings')}</h3>
                    
                    {capabilities?.focusDistance && <div className="camera-slider-container">
                        <label className="camera-slider-label"><FocusIcon className="w-5 h-5"/>{t('focus')}</label>
                        <input type="range" min={capabilities.focusDistance.min} max={capabilities.focusDistance.max} step={capabilities.focusDistance.step} value={focus} onChange={e => setFocus(parseFloat(e.target.value))} className="range-slider" />
                    </div>}

                    {capabilities?.exposureTime && <div className="camera-slider-container">
                        <label className="camera-slider-label"><ExposureIcon className="w-5 h-5"/>{t('exposure')}</label>
                        <input type="range" min={capabilities.exposureTime.min} max={capabilities.exposureTime.max} step={capabilities.exposureTime.step} value={exposure} onChange={e => setExposure(parseFloat(e.target.value))} className="range-slider" />
                    </div>}
                    
                    {capabilities?.colorTemperature && <div className="camera-slider-container">
                        <label className="camera-slider-label"><WhiteBalanceIcon className="w-5 h-5"/>{t('whiteBalance')}</label>
                        <input type="range" min={capabilities.colorTemperature.min} max={capabilities.colorTemperature.max} step={capabilities.colorTemperature.step} value={whiteBalance} onChange={e => setWhiteBalance(parseFloat(e.target.value))} className="range-slider" />
                    </div>}

                    <div className="camera-slider-container">
                        <label className="camera-slider-label"><SunIcon className="w-5 h-5"/>{t('brightness')}</label>
                        <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(parseFloat(e.target.value))} className="range-slider" />
                    </div>
                    <div className="camera-slider-container">
                        <label className="camera-slider-label"><ContrastIcon className="w-5 h-5"/>{t('contrast')}</label>
                        <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(parseFloat(e.target.value))} className="range-slider" />
                    </div>
                </div>

                {capabilities?.zoom && <div className="camera-zoom-control">
                    <span className="text-xs font-bold tracking-widest mb-2">ZOOM</span>
                    <input type="range" min={capabilities.zoom.min} max={capabilities.zoom.max} step={capabilities.zoom.step} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} />
                </div>}

                <footer className="camera-bottom-bar px-4 justify-center">
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-16 glass-panel rounded-full flex items-center justify-center text-sm font-semibold">
                         {isRecognizing ? (
                            <>
                                <Loader className="w-5 h-5 mr-2" />
                                <span>{t('analyzeObjects')}...</span>
                            </>
                         ) : (
                            <span>{t('arView')}</span>
                         )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CameraExperience;