import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect, RecognizedObject } from '../types';
import { recognizeObjectsInImage } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';
import FocusIcon from './icons/FocusIcon';
import SunIcon from './icons/SunIcon';
import ContrastIcon from './icons/ContrastIcon';
import UploadIcon from './icons/UploadIcon';
import EyeIcon from './icons/EyeIcon';
import ResetIcon from './icons/ResetIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import ImageEditor from './ImageEditor';
import CameraIcon from './icons/CameraIcon';
import HistoryIcon from './icons/HistoryIcon';
import FontSizeIcon from './icons/FontSizeIcon';
import ArBubble, { LiveArObject } from './ArBubble';
import TrashIcon from './icons/TrashIcon';
import GlobeIcon from './icons/GlobeIcon';
import ScriptIcon from './icons/ScriptIcon';


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
interface ArObject extends LiveArObject {
    box: { x: number; y: number; width: number; height: number; };
    targetOpacity: number;
    isDead: boolean;
    lastSeen: number;
}

interface CameraExperienceProps {
    isOpen: boolean;
    onClose: () => void;
    dialect: PhoenicianDialect;
    t: (key: string) => string;
    uiLang: UILang;
}

const ANALYSIS_INTERVAL = 2000; // ms between AR recognition calls

const CameraExperience: React.FC<CameraExperienceProps> = ({ isOpen, onClose, dialect, t, uiLang }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const arOverlayRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const analysisIntervalId = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastFrameTimeRef = useRef<number>(performance.now());

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Camera Capabilities State
    const [capabilities, setCapabilities] = useState<ExtendedMediaTrackCapabilities | null>(null);
    const [zoom, setZoom] = useState(1);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);

    // AR State
    const [isArEnabled, setIsArEnabled] = useState(true);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [arObjects, setArObjects] = useState<ArObject[]>([]);
    const [arError, setArError] = useState<string | null>(null);
    const [arDialect, setArDialect] = useState<PhoenicianDialect>(dialect);
    const [expandedBubbleId, setExpandedBubbleId] = useState<string | null>(null);
    
    // AR User Settings
    const [arPersistence, setArPersistence] = useState(2000); // ms
    const [isPersistenceInfinite, setIsPersistenceInfinite] = useState(false);
    const [arAnimationSpeed, setArAnimationSpeed] = useState(8); // 1-20
    const [arFontSizeScale, setArFontSizeScale] = useState(1); // 0.8 to 1.5
    const [showPhoenician, setShowPhoenician] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showTransliteration, setShowTransliteration] = useState(true);


    // Image Upload Flow State
    const [imageToEdit, setImageToEdit] = useState<string | null>(null);
    const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
    const [staticArObjects, setStaticArObjects] = useState<RecognizedObject[]>([]);

    const handleResetAdjustments = () => {
        setBrightness(100);
        setContrast(100);
    };

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
        setAnalyzedImage(null);
        setStaticArObjects([]);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: mode, 
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                }
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            
            await new Promise((resolve) => {
                if(videoRef.current) videoRef.current.onloadedmetadata = resolve;
            });

            const track = stream.getVideoTracks()[0];
            if (!track) throw new Error("No video track found");

            try {
                const supportedConstraints = navigator.mediaDevices.getSupportedConstraints() as any;
                // FIX: Changed type of constraintsToApply to `any` to allow setting non-standard experimental properties.
                const constraintsToApply: any = {};
                if (supportedConstraints.exposureMode) constraintsToApply.exposureMode = 'continuous';
                if (supportedConstraints.whiteBalanceMode) constraintsToApply.whiteBalanceMode = 'continuous';
                if (supportedConstraints.focusMode) constraintsToApply.focusMode = 'continuous';
                await track.applyConstraints(constraintsToApply);
            } catch (e) {
                console.warn("Could not apply continuous constraints.", e);
            }
            
            const caps = track.getCapabilities() as ExtendedMediaTrackCapabilities;
            setCapabilities(caps);
            setZoom(caps.zoom?.min ?? 1);

        } catch (err) {
            console.error("Camera access error:", err);
            setError(t('cameraError'));
        } finally {
            setIsLoading(false);
        }
    }, [stopStream, t]);
    
    useEffect(() => {
        if (isOpen && !imageToEdit && !analyzedImage) {
            startStream(facingMode);
        } else {
            stopStream();
        }
        return () => stopStream();
    }, [isOpen, facingMode, imageToEdit, analyzedImage, startStream, stopStream]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        }
    }, [brightness, contrast]);

    useEffect(() => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track || !capabilities?.zoom) return;
        track.applyConstraints({ advanced: [{ zoom }] }).catch(e => console.warn("Failed to apply zoom", e));
    }, [zoom, capabilities]);

    const analyzeFrame = useCallback(async (isManualTrigger = false) => {
        if ((!isManualTrigger && isRecognizing) || !videoRef.current || videoRef.current.readyState < 2) return;
        
        setIsRecognizing(true);
        setArError(null);
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        
        const MAX_WIDTH = 640;
        const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
        tempCanvas.width = video.videoWidth * scale;
        tempCanvas.height = video.videoHeight * scale;
        
        const ctx = tempCanvas.getContext('2d');
        if(!ctx) { setIsRecognizing(false); return; }
        
        ctx.filter = video.style.filter;
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const results: RecognizedObject[] = await recognizeObjectsInImage(base64Data, arDialect, uiLang);
            
            setArObjects(prev => {
                const matchedIds = new Set<string>();
                const now = Date.now();

                const nextObjects: ArObject[] = results.map(res => {
                    const id = `${res.name}-${res.phoenician}`;
                    matchedIds.add(id);
                    
                    const existing = prev.find(p => p.id === id);
                    if (existing) {
                        return { ...existing, box: res.box, targetOpacity: 1, isDead: false, lastSeen: now };
                    }
                    return {
                        id, ...res,
                        currentX: 0,
                        currentY: 0,
                        opacity: 0, targetOpacity: 1, isDead: false, lastSeen: now
                    };
                });
                
                prev.forEach(p => {
                    if (!matchedIds.has(p.id)) {
                        nextObjects.push({ ...p });
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
    }, [isRecognizing, arDialect, uiLang, t]);
    
    const runArAnimation = useCallback(() => {
        const overlay = arOverlayRef.current;
        const video = videoRef.current;
        if (!overlay || !video || video.videoHeight === 0) {
            animationFrameId.current = requestAnimationFrame(runArAnimation);
            return;
        }

        const now = performance.now();
        const deltaTime = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;

        const LERP_BASE = 0.25;
        const lerpFactor = LERP_BASE * (arAnimationSpeed / 10);
        const effectiveLerp = 1 - Math.pow(1 - lerpFactor, deltaTime / 16.67);

        const videoAR = video.videoWidth / video.videoHeight;
        const overlayAR = overlay.clientWidth / overlay.clientHeight;
        let scale, offsetX = 0, offsetY = 0;

        if (videoAR > overlayAR) {
            scale = overlay.clientHeight / video.videoHeight;
            offsetX = (overlay.clientWidth - video.videoWidth * scale) / 2;
        } else {
            scale = overlay.clientWidth / video.videoWidth;
            offsetY = (overlay.clientHeight - video.videoHeight * scale) / 2;
        }

        setArObjects(prev => {
            const currentTime = Date.now();
            const next = prev.map(obj => {
                const newObj = { ...obj };
                
                if (!isPersistenceInfinite && currentTime - newObj.lastSeen > arPersistence) {
                    newObj.targetOpacity = 0;
                }

                const targetPixelX = (obj.box.x + obj.box.width / 2) * (video.videoWidth * scale) + offsetX;
                const targetPixelY = (obj.box.y + obj.box.height / 2) * (video.videoHeight * scale) + offsetY;
                
                // Initialize position on first render
                if (newObj.currentX === 0 && newObj.currentY === 0) {
                    newObj.currentX = targetPixelX;
                    newObj.currentY = targetPixelY;
                }

                newObj.currentX += (targetPixelX - newObj.currentX) * effectiveLerp;
                newObj.currentY += (targetPixelY - newObj.currentY) * effectiveLerp;
                newObj.opacity += (newObj.targetOpacity - newObj.opacity) * effectiveLerp;
                
                if (newObj.targetOpacity === 0 && newObj.opacity < 0.01) newObj.isDead = true;
                return newObj;
            });
            return next.filter(obj => !obj.isDead);
        });

        animationFrameId.current = requestAnimationFrame(runArAnimation);
    }, [arAnimationSpeed, arPersistence, isPersistenceInfinite]);

    useEffect(() => {
        if (isArEnabled && isOpen && !analyzedImage) {
            stopAr();
            lastFrameTimeRef.current = performance.now();
            const timeoutId = setTimeout(() => analyzeFrame(), 500);
            analysisIntervalId.current = window.setInterval(() => analyzeFrame(), ANALYSIS_INTERVAL);
            animationFrameId.current = requestAnimationFrame(runArAnimation);
            
            return () => {
                clearTimeout(timeoutId);
                stopAr();
            };
        } else {
            stopAr();
        }
    }, [isArEnabled, isOpen, analyzedImage, analyzeFrame, runArAnimation, stopAr]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageToEdit(event.target?.result as string);
                stopStream();
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleImageAnalysis = async (imageDataUrl: string) => {
        setIsRecognizing(true);
        setArError(null);
        setImageToEdit(null);
        setAnalyzedImage(imageDataUrl);
        
        try {
            const base64Data = imageDataUrl.split(',')[1];
            const results = await recognizeObjectsInImage(base64Data, arDialect, uiLang);
            setStaticArObjects(results);
        } catch (err) {
            console.error("Static image analysis failed:", err);
            setArError(t('arAnalysisFailed'));
        } finally {
            setIsRecognizing(false);
        }
    };

    const clearArBubbles = () => {
        setArObjects([]);
        setStaticArObjects([]);
        setExpandedBubbleId(null);
        if (analyzedImage) {
            setAnalyzedImage(null); 
            startStream(facingMode); // Go back to live view
        }
    };

    if (!isOpen) return null;
    
    if (imageToEdit) {
        return (
            <div className="camera-experience-modal">
                <ImageEditor 
                    src={imageToEdit}
                    onConfirm={handleImageAnalysis}
                    onCancel={() => setImageToEdit(null)}
                    t={t}
                    titleText={t('analyzeObjects')}
                    confirmText={t('analyzeObjects')}
                    cancelText={t('close')}
                />
            </div>
        )
    }

    return (
        <div className="camera-experience-modal">
            {analyzedImage ? (
                <img src={analyzedImage} alt="Analyzed" className="analyzed-image-view" />
            ) : (
                <video id="camera-feed" ref={videoRef} autoPlay playsInline muted />
            )}

            <div 
                ref={arOverlayRef} 
                className="ar-canvas" 
                onClick={() => setExpandedBubbleId(null)}
                style={{ '--ar-font-size-scale': arFontSizeScale } as React.CSSProperties}
            >
                {analyzedImage 
                    ? staticArObjects.map(obj => {
                        const id = `${obj.name}-${obj.phoenician}`;
                        return <ArBubble 
                            key={id}
                            obj={{...obj, id}}
                            isStatic={true}
                            isExpanded={expandedBubbleId === id}
                            onClick={setExpandedBubbleId}
                            dialect={arDialect}
                            uiLang={uiLang}
                            t={t}
                            showPhoenician={showPhoenician}
                            showTranslation={showTranslation}
                            showTransliteration={showTransliteration}
                        />
                    })
                    : arObjects.map(obj => 
                        <ArBubble 
                            key={obj.id}
                            obj={obj}
                            isStatic={false}
                            isExpanded={expandedBubbleId === obj.id}
                            onClick={setExpandedBubbleId}
                            dialect={arDialect}
                            uiLang={uiLang}
                            t={t}
                            showPhoenician={showPhoenician}
                            showTranslation={showTranslation}
                            showTransliteration={showTransliteration}
                        />
                    )
                }
            </div>

            {error && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-900/80 text-white px-4 py-2 rounded-lg z-30 text-sm font-semibold transition-opacity duration-300 border border-red-500">
                    {error}
                </div>
            )}

            <div className="camera-ui-overlay">
                <div className="camera-top-bar">
                    <button onClick={onClose} className="camera-side-button" aria-label={t('close')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    {(arObjects.length > 0 || staticArObjects.length > 0) && (
                        <button onClick={clearArBubbles} className="camera-side-button" aria-label="Clear Annotations">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    )}
                    {analyzedImage && (
                        <button onClick={() => startStream(facingMode)} className="camera-side-button" aria-label="Back to camera">
                           <CameraIcon className="w-6 h-6"/>
                        </button>
                    )}
                     <button onClick={() => setIsSettingsOpen(o => !o)} className="camera-side-button" aria-label={t('advancedSettings')}>
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {isRecognizing && <div className="ar-recognizing-indicator"></div>}

                <div className={`camera-settings-panel ${isSettingsOpen ? 'open' : ''}`}>
                    <div className="relative text-center">
                        <h3 className="text-lg font-bold">{t('advancedSettings')}</h3>
                        <button onClick={() => setIsSettingsOpen(false)} className="absolute top-1/2 -translate-y-1/2 right-0 p-1 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors" aria-label={t('close')}>
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    {capabilities?.zoom && <div className="camera-slider-container">
                        <label className="camera-slider-label"><FocusIcon className="w-5 h-5"/>{t('zoom')}</label>
                        <input type="range" min={capabilities.zoom.min} max={capabilities.zoom.max} step={capabilities.zoom.step} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="range-slider" />
                    </div>}

                    <div className="camera-slider-container">
                        <label className="camera-slider-label"><SunIcon className="w-5 h-5"/>{t('brightness')}</label>
                        <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(parseFloat(e.target.value))} className="range-slider" />
                    </div>
                    <div className="camera-slider-container">
                        <label className="camera-slider-label"><ContrastIcon className="w-5 h-5"/>{t('contrast')}</label>
                        <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(parseFloat(e.target.value))} className="range-slider" />
                    </div>
                    
                    <hr className="border-white/10 my-2" />
                    <h4 className="text-md font-semibold text-center -mb-2">AR Display</h4>
                    
                    <div className="camera-slider-container">
                        <label className="camera-slider-label">Display Layers</label>
                        <div className="flex justify-around items-center bg-black/20 rounded-lg p-1">
                            <button onClick={() => setShowPhoenician(s => !s)} className={`p-2 rounded-md transition-colors w-1/3 ${showPhoenician ? 'bg-[color:var(--color-primary)]' : 'hover:bg-white/10'}`} title="Toggle Phoenician Text">
                                <span className="[font-family:var(--font-phoenician)] text-xl w-6 h-6 flex items-center justify-center mx-auto">𐤀</span>
                            </button>
                            <button onClick={() => setShowTranslation(s => !s)} className={`p-2 rounded-md transition-colors w-1/3 ${showTranslation ? 'bg-[color:var(--color-primary)]' : 'hover:bg-white/10'}`} title="Toggle Translation">
                                <GlobeIcon className="w-6 h-6 mx-auto"/>
                            </button>
                            <button onClick={() => setShowTransliteration(s => !s)} className={`p-2 rounded-md transition-colors w-1/3 ${showTransliteration ? 'bg-[color:var(--color-primary)]' : 'hover:bg-white/10'}`} title="Toggle Transliteration">
                                <ScriptIcon className="w-6 h-6 mx-auto"/>
                            </button>
                        </div>
                    </div>
                    
                     <div className="camera-slider-container">
                        <div className="flex items-center justify-between">
                             <label className="camera-slider-label"><HistoryIcon className="w-5 h-5"/>AR Persistence</label>
                             <div className="flex items-center">
                                <input id="infinite-persistence" type="checkbox" checked={isPersistenceInfinite} onChange={(e) => setIsPersistenceInfinite(e.target.checked)} className="w-4 h-4 accent-[color:var(--color-primary)] bg-transparent border-[color:var(--color-border)] rounded focus:ring-[color:var(--color-primary)]" />
                                <label htmlFor="infinite-persistence" className="ml-2 text-xs font-semibold">Infinite</label>
                            </div>
                        </div>
                        <input type="range" min="500" max="10000" step="100" value={arPersistence} onChange={e => setArPersistence(Number(e.target.value))} className="range-slider" disabled={isPersistenceInfinite} />
                    </div>
                     <div className="camera-slider-container">
                        <label className="camera-slider-label"><span className="w-5 h-5 text-center font-bold text-xs flex items-center justify-center">SPD</span>AR Speed</label>
                        <input type="range" min="1" max="20" step="1" value={arAnimationSpeed} onChange={e => setArAnimationSpeed(Number(e.target.value))} className="range-slider" />
                    </div>
                     <div className="camera-slider-container">
                        <label className="camera-slider-label"><FontSizeIcon className="w-5 h-5"/>AR Font Size</label>
                        <input type="range" min="0.8" max="1.5" step="0.1" value={arFontSizeScale} onChange={e => setArFontSizeScale(Number(e.target.value))} className="range-slider" />
                    </div>
                    
                    <button 
                        onClick={handleResetAdjustments} 
                        className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ResetIcon className="w-5 h-5" />
                        {t('resetAdjustments')}
                    </button>
                </div>

                <footer className="camera-bottom-bar">
                    <button onClick={() => fileInputRef.current?.click()} className="camera-side-button" aria-label={t('uploadPhoto')}>
                        <UploadIcon className="w-6 h-6" />
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </button>

                    <button onClick={() => analyzeFrame(true)} disabled={isLoading || isRecognizing} className="camera-main-action disabled:opacity-50" aria-label={t('analyzeObjects')}>
                        {isRecognizing ? <Loader className="icon"/> : <EyeIcon className="icon"/> }
                    </button>

                    <button onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')} className="camera-side-button" aria-label={t('switchCamera')}>
                        <SwitchCameraIcon className="w-6 h-6" />
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CameraExperience;