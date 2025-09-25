import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect } from '../types';
import { recognizeObjectsInImage } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';
import UploadIcon from './icons/UploadIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import EyeIcon from './icons/EyeIcon';
import FocusIcon from './icons/FocusIcon';
import ExposureIcon from './icons/ExposureIcon';
import WhiteBalanceIcon from './icons/WhiteBalanceIcon';
import SunIcon from './icons/SunIcon';
import ContrastIcon from './icons/ContrastIcon';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';

// FIX: Add type definitions for experimental MediaTrackCapabilities properties.
// These are not yet part of the standard TypeScript DOM library and are needed for advanced camera controls.
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
    translation: string;
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
    const arCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const analysisIntervalId = useRef<number | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Camera Capabilities State
    // FIX: Changed MediaTrackCapabilities to the extended interface to support experimental features.
    const [capabilities, setCapabilities] = useState<ExtendedMediaTrackCapabilities | null>(null);
    const [zoom, setZoom] = useState(1);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [focus, setFocus] = useState(0);
    const [exposure, setExposure] = useState(0);
    const [whiteBalance, setWhiteBalance] = useState(0);

    // AR State
    const [isArEnabled, setIsArEnabled] = useState(false);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [arObjects, setArObjects] = useState<ArObject[]>([]);

    const stopAr = useCallback(() => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (analysisIntervalId.current) clearInterval(analysisIntervalId.current);
        animationFrameId.current = null;
        analysisIntervalId.current = null;
        setArObjects([]);
        setIsRecognizing(false);
        const canvas = arCanvasRef.current;
        if (canvas) {
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        }
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
                video: { facingMode: mode }
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            
            const track = stream.getVideoTracks()[0];
            // FIX: Cast capabilities to the extended interface to access experimental properties.
            const caps = track.getCapabilities() as ExtendedMediaTrackCapabilities;
            setCapabilities(caps);

            // Initialize sliders
            if (caps.zoom) setZoom(caps.zoom.min);
            if (caps.focusDistance) setFocus(caps.focusDistance.min);
            if (caps.exposureTime) setExposure(caps.exposureTime.min);
            if (caps.whiteBalanceMode) setWhiteBalance(caps.colorTemperature?.min || 0);

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

    // Effect to apply camera constraints
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
    
    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `dbr-capture-${Date.now()}.png`;
        link.click();
    };
    
    const analyzeFrame = useCallback(async () => {
        if (isRecognizing || !videoRef.current || videoRef.current.readyState < 2 || !arCanvasRef.current) return;
        
        setIsRecognizing(true);
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        
        const MAX_WIDTH = 480;
        const scale = MAX_WIDTH / video.videoWidth;
        tempCanvas.width = MAX_WIDTH;
        tempCanvas.height = video.videoHeight * scale;
        
        const ctx = tempCanvas.getContext('2d');
        if(!ctx) { setIsRecognizing(false); return; }

        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/png').split(',')[1];

        const results = await recognizeObjectsInImage(base64Data, dialect, uiLang);

        const canvas = arCanvasRef.current;
        const videoAR = video.videoWidth / video.videoHeight;
        const canvasAR = canvas.width / canvas.height;
        let displayScale, offsetX = 0, offsetY = 0;

        if (videoAR > canvasAR) { // Video is wider than canvas
            displayScale = canvas.height / video.videoHeight;
            offsetX = (video.videoWidth * displayScale - canvas.width) / 2;
        } else { // Video is taller than canvas
            displayScale = canvas.width / video.videoWidth;
            offsetY = (video.videoHeight * displayScale - canvas.height) / 2;
        }

        setArObjects(prev => {
            const matchedIds = new Set<string>();
            const nextObjects: ArObject[] = results.map(res => {
                const id = res.name;
                matchedIds.add(id);
                const targetX = (res.box.x + res.box.width / 2) * video.videoWidth * displayScale - offsetX;
                const targetY = (res.box.y + res.box.height / 2) * video.videoHeight * displayScale - offsetY;
                
                const existing = prev.find(p => p.id === id);
                if (existing) {
                    return { ...existing, targetX, targetY, targetOpacity: 1, isDead: false };
                }
                return {
                    id, name: res.name, phoenician: res.phoenician, translation: res.translation,
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
        
        setIsRecognizing(false);
    }, [isRecognizing, dialect, uiLang]);
    
    const runArAnimation = useCallback(() => {
        if (!isArEnabled) { stopAr(); return; }

        const canvas = arCanvasRef.current;
        if (!canvas) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const fontName = dialect === PhoenicianDialect.PUNIC ? 'Punic LDR' : 'Noto Sans Phoenician';
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        
        setArObjects(prev => {
            const next = prev.map(obj => {
                const newObj = { ...obj };
                newObj.currentX += (newObj.targetX - newObj.currentX) * LERP_FACTOR;
                newObj.currentY += (newObj.targetY - newObj.currentY) * LERP_FACTOR;
                newObj.opacity += (newObj.targetOpacity - newObj.opacity) * LERP_FACTOR;
                if (newObj.targetOpacity === 0 && newObj.opacity < 0.01) newObj.isDead = true;
                
                if (!newObj.isDead) {
                    ctx.save();
                    ctx.globalAlpha = newObj.opacity;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    const phFontSize = 28;
                    ctx.font = `${phFontSize}px ${fontName}`;
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillRect(newObj.currentX - 50, newObj.currentY - 45, 100, 55);
                    ctx.fillStyle = primaryColor;
                    ctx.fillText(newObj.phoenician, newObj.currentX, newObj.currentY - 15);
                    
                    ctx.font = `600 14px Poppins, sans-serif`;
                    ctx.fillStyle = 'white';
                    ctx.fillText(newObj.translation, newObj.currentX, newObj.currentY);
                    
                    ctx.restore();
                }
                return newObj;
            });
            return next.filter(obj => !obj.isDead);
        });

        animationFrameId.current = requestAnimationFrame(runArAnimation);
    }, [isArEnabled, dialect, stopAr]);

    useEffect(() => {
        if (isArEnabled) {
            stopAr();
            analysisIntervalId.current = window.setInterval(analyzeFrame, ANALYSIS_INTERVAL);
            animationFrameId.current = requestAnimationFrame(runArAnimation);
        } else {
            stopAr();
        }
        return () => stopAr();
    }, [isArEnabled, analyzeFrame, runArAnimation, stopAr]);
    
    const sliderProps = { min: 0, max: 0, step: 1 };
    
    return (
        <div className="camera-experience-modal">
            <video id="camera-feed" ref={videoRef} autoPlay playsInline style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }} />
            <canvas id="ar-canvas" ref={arCanvasRef} className="ar-canvas" />

            <div className="camera-ui-overlay">
                <header className="flex justify-between items-center px-4">
                    <button onClick={() => setIsSettingsOpen(o => !o)} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" title={t('advancedSettings')}>
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center font-bold text-lg" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{t('arView')}</div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" title={t('switchCamera')}>
                           <SwitchCameraIcon className="h-6 w-6" />
                        </button>
                        <button onClick={onClose} className="p-3 rounded-full bg-black/30 backdrop-blur-sm" aria-label={t('close')}>
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="ar-crosshair" />
                
                {isArEnabled && isRecognizing && <div className="ar-recognizing-indicator"></div>}

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
                        <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="range-slider" />
                    </div>

                    <div className="camera-slider-container">
                        <label className="camera-slider-label"><ContrastIcon className="w-5 h-5"/>{t('contrast')}</label>
                        <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="range-slider" />
                    </div>
                </div>

                {capabilities?.zoom && <div className="camera-zoom-control">
                    <ZoomInIcon className="w-6 h-6 opacity-80"/>
                    <input type="range" min={capabilities.zoom.min} max={capabilities.zoom.max} step={capabilities.zoom.step} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} />
                    <ZoomOutIcon className="w-6 h-6 opacity-80"/>
                </div>}


                <footer className="camera-bottom-bar px-4">
                     <div className="w-24 flex justify-start">
                        <button onClick={() => setIsArEnabled(e => !e)} className={`camera-action-button ${isArEnabled ? 'active' : ''}`} title={t('arToggle')}>
                            <EyeIcon className="w-6 h-6" isSlashed={!isArEnabled} />
                            <span>{t('arView')}</span>
                        </button>
                     </div>
                     <button onClick={handleCapture} className="shutter-button"><div className="shutter-button-inner"></div></button>
                     <div className="w-24 flex justify-end">
                        <button onClick={analyzeFrame} disabled={isRecognizing} className="camera-action-button" title={t('analyzeObjects')}>
                            {isRecognizing ? <Loader className="w-6 h-6" /> : <span className="[font-family:var(--font-phoenician)] text-2xl">𐤀?</span>}
                            <span>{t('analyzeObjects')}</span>
                        </button>
                     </div>
                </footer>
            </div>
        </div>
    );
};

export default CameraExperience;