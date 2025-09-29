import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect, RecognizedObject } from '../types';
import { recognizeObjectsInImage } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';
import FocusIcon from './icons/FocusIcon';
import ExposureIcon from './icons/ExposureIcon';
import WhiteBalanceIcon from './icons/WhiteBalanceIcon';
import SunIcon from './icons/SunIcon';
import ContrastIcon from './icons/ContrastIcon';
import UploadIcon from './icons/UploadIcon';
import RefreshIcon from './icons/RefreshIcon';
import ScriptModeToggle from './ScriptModeToggle';
import EyeIcon from './icons/EyeIcon';
import ResetIcon from './icons/ResetIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import ImageEditor from './ImageEditor';
import CameraIcon from './icons/CameraIcon';


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
    translation: string;
    pos: string;
    box: { x: number; y: number; width: number; height: number; };
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
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const analysisIntervalId = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [arDialect, setArDialect] = useState<PhoenicianDialect>(dialect);
    const [expandedBubbleId, setExpandedBubbleId] = useState<string | null>(null);
    
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
            
            // Wait for the video to start playing to get metadata
            await new Promise((resolve) => {
                if(videoRef.current) videoRef.current.onloadedmetadata = resolve;
            });

            const track = stream.getVideoTracks()[0];
            if (!track) throw new Error("No video track found");

            // Attempt to set continuous modes for better automatic adjustments
            try {
                // FIX: Cast to 'any' to access experimental/non-standard browser API properties for camera constraints.
                // This resolves errors where properties like 'exposureMode' are not found on the standard types.
                const supportedConstraints = navigator.mediaDevices.getSupportedConstraints() as any;
                const constraintsToApply: MediaTrackConstraints = {} as any;
                if (supportedConstraints.exposureMode) constraintsToApply.exposureMode = 'continuous';
                if (supportedConstraints.whiteBalanceMode) constraintsToApply.whiteBalanceMode = 'continuous';
                if (supportedConstraints.focusMode) constraintsToApply.focusMode = 'continuous';
                await track.applyConstraints(constraintsToApply);
            } catch (e) {
                console.warn("Could not apply continuous constraints.", e);
            }
            
            const caps = track.getCapabilities() as ExtendedMediaTrackCapabilities;
            setCapabilities(caps);

            // Initialize sliders to default/minimum values
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
        if (!track || !capabilities) return;
        const constraints: any = { advanced: [] };
        if (capabilities.zoom) constraints.advanced.push({ zoom });
        track.applyConstraints(constraints).catch(e => console.warn("Failed to apply zoom", e));
    }, [zoom, capabilities]);

    const analyzeFrame = useCallback(async (isManualTrigger = false) => {
        if (isRecognizing || !videoRef.current || videoRef.current.readyState < 2) return;
        
        setIsRecognizing(true);
        setArError(null);
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        
        const MAX_WIDTH = 720;
        const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
        tempCanvas.width = video.videoWidth * scale;
        tempCanvas.height = video.videoHeight * scale;
        
        const ctx = tempCanvas.getContext('2d');
        if(!ctx) { setIsRecognizing(false); return; }
        
        ctx.filter = video.style.filter;
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/jpeg', 0.85).split(',')[1];

        try {
            const results: RecognizedObject[] = await recognizeObjectsInImage(base64Data, arDialect, uiLang);
            
            setArObjects(prev => {
                const matchedIds = new Set<string>();
                const nextObjects: ArObject[] = results.map(res => {
                    const id = `${res.name}-${res.phoenician}`;
                    matchedIds.add(id);
                    
                    const existing = prev.find(p => p.id === id);
                    if (existing) {
                        return { ...existing, box: res.box, targetOpacity: 1, isDead: false };
                    }
                    return {
                        id, ...res,
                        currentX: (res.box.x + res.box.width / 2) * 100, 
                        currentY: (res.box.y + res.box.height / 2) * 100,
                        targetX: (res.box.x + res.box.width / 2) * 100, 
                        targetY: (res.box.y + res.box.height / 2) * 100,
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
    }, [isRecognizing, arDialect, uiLang, t]);
    
    const runArAnimation = useCallback(() => {
        const overlay = arOverlayRef.current;
        const video = videoRef.current;
        if (!overlay || !video || video.videoHeight === 0) {
            animationFrameId.current = requestAnimationFrame(runArAnimation);
            return;
        }

        const videoAR = video.videoWidth / video.videoHeight;
        const overlayAR = overlay.clientWidth / overlay.clientHeight;
        let scale, offsetX = 0, offsetY = 0;

        if (videoAR > overlayAR) { // Video is wider (letterboxed logic for cover)
            scale = overlay.clientHeight / video.videoHeight;
            offsetX = (overlay.clientWidth - video.videoWidth * scale) / 2;
        } else { // Video is taller (pillarboxed logic for cover)
            scale = overlay.clientWidth / video.videoWidth;
            offsetY = (overlay.clientHeight - video.videoHeight * scale) / 2;
        }

        setArObjects(prev => {
            const next = prev.map(obj => {
                const newObj = { ...obj };
                const targetPixelX = (obj.box.x + obj.box.width / 2) * (video.videoWidth * scale) + offsetX;
                const targetPixelY = (obj.box.y + obj.box.height / 2) * (video.videoHeight * scale) + offsetY;

                newObj.currentX += (targetPixelX - newObj.currentX) * LERP_FACTOR;
                newObj.currentY += (targetPixelY - newObj.currentY) * LERP_FACTOR;
                newObj.opacity += (newObj.targetOpacity - newObj.opacity) * LERP_FACTOR;
                
                if (newObj.targetOpacity === 0 && newObj.opacity < 0.01) newObj.isDead = true;
                return newObj;
            });
            return next.filter(obj => !obj.isDead);
        });

        animationFrameId.current = requestAnimationFrame(runArAnimation);
    }, []);

    useEffect(() => {
        if (isArEnabled && isOpen && !analyzedImage) {
            stopAr(); // Reset previous state
            const timeoutId = setTimeout(() => analyzeFrame(), 500); // Initial analysis
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

    const renderArBubble = (obj: ArObject | RecognizedObject, isStatic: boolean) => {
        // FIX: Correctly distinguish between ArObject and RecognizedObject to generate a stable ID.
        // The previous check ('name' in obj) was always true, leading to a type error.
        // This now checks for the unique 'id' property in ArObject.
        const id = 'id' in obj ? obj.id : `${obj.name}-${obj.phoenician}`;
        const fontClass = arDialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';
        const isExpanded = expandedBubbleId === id;
        
        let positionStyle: React.CSSProperties = {};
        if (isStatic) {
            const overlay = arOverlayRef.current;
            if(overlay) {
                positionStyle = {
                    left: `${(obj.box.x + obj.box.width / 2) * 100}%`,
                    top: `${(obj.box.y + obj.box.height / 2) * 100}%`,
                    opacity: 1
                }
            }
        } else if ('currentX' in obj) {
            positionStyle = {
                transform: `translate(-50%, -50%) translate(${obj.currentX}px, ${obj.currentY}px) scale(${isExpanded ? 1.1 : 1})`,
                opacity: obj.opacity,
                pointerEvents: obj.opacity > 0.5 ? 'auto' : 'none',
            };
        }
        
        return (
             <div 
                key={id} 
                className={`ar-bubble ${isExpanded ? 'ar-bubble-expanded' : ''}`}
                style={{
                    ...positionStyle,
                    zIndex: isExpanded ? 100 : 50,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setExpandedBubbleId(isExpanded ? null : id);
                }}
            >
                 {!isExpanded ? (
                    <>
                        <div className={`ar-bubble-phoenician ${fontClass}`}>{obj.phoenician}</div>
                        <div className="ar-bubble-translation" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{obj.translation}</div>
                        <div className="ar-bubble-pronunciation" dir="ltr">{uiLang === 'ar' ? obj.arabicTransliteration : obj.latin}</div>
                    </>
                ) : (
                    <div className="ar-expanded-content">
                        <div className={`ar-expanded-phoenician ${fontClass}`}>{obj.phoenician}</div>
                        <div className="ar-expanded-pos">{t(obj.pos.toLowerCase())}</div>
                        <hr className="ar-expanded-divider" />
                        <div className="ar-expanded-transliterations">
                            <div className="text-center">
                                <div className="ar-expanded-label">Latin</div>
                                <div dir="ltr">{obj.latin}</div>
                            </div>
                            <div className="text-center">
                                <div className="ar-expanded-label">Arabic</div>
                                <div dir="rtl">{obj.arabicTransliteration}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="camera-experience-modal">
            {analyzedImage ? (
                <img src={analyzedImage} alt="Analyzed" className="analyzed-image-view" />
            ) : (
                <video id="camera-feed" ref={videoRef} autoPlay playsInline muted />
            )}

            <div ref={arOverlayRef} className="ar-canvas" onClick={() => setExpandedBubbleId(null)}>
                {analyzedImage 
                    ? staticArObjects.map(obj => renderArBubble(obj, true))
                    : arObjects.map(obj => renderArBubble(obj, false))
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
                    <h3 className="text-lg font-bold text-center mb-2">{t('advancedSettings')}</h3>
                    
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