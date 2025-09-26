import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect, RecognizedObject } from '../types';
import { recognizeObjectsInImage } from '../services/geminiService';
import { UILang } from '../lib/i18n';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import SettingsIcon from './icons/SettingsIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import EyeIcon from './icons/EyeIcon';
import FocusIcon from './icons/FocusIcon';
import ExposureIcon from './icons/ExposureIcon';
import WhiteBalanceIcon from './icons/WhiteBalanceIcon';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';

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

    // AR State
    const [isArEnabled, setIsArEnabled] = useState(false);
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
    
    useEffect(() => {
        const canvas = arCanvasRef.current;
        const container = containerRef.current;
        const video = videoRef.current;
        if (!canvas || !container || !video) return;

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        
        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(container);
        video.addEventListener('loadedmetadata', resizeCanvas);

        resizeCanvas();

        return () => {
            resizeObserver.disconnect();
            if (video) video.removeEventListener('loadedmetadata', resizeCanvas);
        };
    }, [isOpen]);

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
            const canvas = arCanvasRef.current;
            if (!canvas) return;

            const videoAR = video.videoWidth / video.videoHeight;
            const canvasAR = canvas.width / canvas.height;
            let displayScale, offsetX = 0, offsetY = 0;

            if (videoAR > canvasAR) { 
                displayScale = canvas.height / video.videoHeight;
                offsetX = (canvas.width - video.videoWidth * displayScale) / 2;
            } else {
                displayScale = canvas.width / video.videoWidth;
                offsetY = (canvas.height - video.videoHeight * displayScale) / 2;
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
                        id, name: res.name, phoenician: res.phoenician, latin: res.latin, translation: res.translation,
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

        const canvas = arCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const fontName = dialect === PhoenicianDialect.PUNIC ? 'Punic LDR' : 'Noto Sans Phoenician';
        
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
                    ctx.textBaseline = 'middle';

                    const phFontSize = 32;
                    ctx.font = `${phFontSize}px ${fontName}`;
                    const phMetrics = ctx.measureText(newObj.phoenician);

                    const latinFontSize = 14;
                    ctx.font = `italic ${latinFontSize}px Poppins, sans-serif`;
                    const latinMetrics = ctx.measureText(newObj.latin);

                    const textPadding = 28;
                    const boxWidth = Math.max(phMetrics.width, latinMetrics.width) + textPadding;
                    const boxHeight = phFontSize + latinFontSize + 20;

                    const bubbleX = newObj.currentX - boxWidth / 2;
                    const bubbleY = newObj.currentY - boxHeight - 15;

                    // Glassmorphism Effect
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 4;

                    const gradient = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX, bubbleY + boxHeight);
                    gradient.addColorStop(0, 'rgba(30, 41, 59, 0.7)');
                    gradient.addColorStop(1, 'rgba(17, 24, 39, 0.6)');

                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = 'rgba(200, 215, 255, 0.3)';
                    ctx.lineWidth = 1.5;

                    ctx.beginPath();
                    ctx.roundRect(bubbleX, bubbleY, boxWidth, boxHeight, 20);
                    ctx.fill();
                    ctx.stroke();

                    // Reset shadow for text
                    ctx.shadowColor = 'transparent';
                    
                    // Phoenician Text
                    ctx.font = `${phFontSize}px ${fontName}`;
                    ctx.fillStyle = '#F3F4F6'; 
                    const phY = bubbleY + phFontSize / 2 + 12;
                    ctx.fillText(newObj.phoenician, newObj.currentX, phY);
                    
                    // Latin Transcription
                    ctx.font = `italic ${latinFontSize}px Poppins, sans-serif`;
                    ctx.fillStyle = '#9CA3AF';
                    const latinY = phY + phFontSize / 2 + latinFontSize / 2 + 4;
                    ctx.fillText(newObj.latin, newObj.currentX, latinY);
                    
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
            analyzeFrame();
            analysisIntervalId.current = window.setInterval(analyzeFrame, ANALYSIS_INTERVAL);
            animationFrameId.current = requestAnimationFrame(runArAnimation);
        } else {
            stopAr();
        }
        return () => stopAr();
    }, [isArEnabled, analyzeFrame, runArAnimation, stopAr]);
    
    if (!isOpen) return null;
    
    return (
        <div className="camera-experience-modal" ref={containerRef}>
            <video id="camera-feed" ref={videoRef} autoPlay playsInline muted />
            <canvas id="ar-canvas" ref={arCanvasRef} className="ar-canvas" />

            {arError && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-4 py-2 rounded-lg z-30 text-sm font-semibold transition-opacity duration-300">
                    {arError}
                </div>
            )}

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

                {!isArEnabled && <div className="ar-crosshair" />}
                
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
                     <button className="shutter-button"><div className="shutter-button-inner"></div></button>
                     <div className="w-24 flex justify-end">
                        <button onClick={analyzeFrame} disabled={isRecognizing || !isArEnabled} className="camera-action-button" title={t('analyzeObjects')}>
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