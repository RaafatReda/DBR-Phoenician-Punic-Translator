import React, { useState, useRef, useEffect, useCallback } from 'react';
import Loader from './Loader';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';
import ImageEditor from './ImageEditor';

interface TextScannerModalProps {
    onClose: () => void;
    onCapture: (imageData: string) => void;
    t: (key: string) => string;
}

const TextScannerModal: React.FC<TextScannerModalProps> = ({ onClose, onCapture, t }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isEditing, setIsEditing] = useState(false);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startStream = useCallback(async (mode: 'user' | 'environment') => {
        stopStream();
        setIsLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
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

    useEffect(() => {
        if (!isEditing) {
            startStream(facingMode);
        }
        return () => {
            stopStream();
        };
    }, [facingMode, isEditing, startStream, stopStream]);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                setIsEditing(true);
                stopStream();
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setIsEditing(false);
    };
    
    const handleConfirmCrop = (croppedDataUrl: string) => {
        if (croppedDataUrl) {
            onCapture(croppedDataUrl.split(',')[1]);
        }
    };

    const handleSwitchCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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
        if (event.target) {
            event.target.value = '';
        }
    };
    
    return (
        <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scanner-title"
        >
            <div
                className="bg-[#0D1117] border border-white/10 rounded-[var(--border-radius)] shadow-2xl w-full max-w-2xl h-[90vh] max-h-[800px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                    <h2 id="scanner-title" className="text-lg font-semibold text-amber-300">{isEditing ? t('editAndScan') : t('textScannerTitle')}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label={t('textScannerClose')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-grow p-0 relative bg-black overflow-hidden">
                    {isEditing && capturedImage ? (
                        <ImageEditor 
                            src={capturedImage}
                            onConfirm={handleConfirmCrop}
                            onCancel={handleRetake}
                            t={t}
                        />
                    ) : (
                        <>
                            {isLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader className="w-10 h-10 text-[color:var(--color-primary)]"/></div>}
                            {error && <div className="absolute inset-0 flex items-center justify-center text-center text-red-400 p-4">{error}</div>}
                            
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className={`w-full h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                onCanPlay={() => setIsLoading(false)}
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </>
                    )}
                </main>
                
                {!isEditing && (
                     <footer className="p-4 border-t border-white/10 flex-shrink-0 flex items-center justify-center bg-black/50">
                        <div className="w-full flex justify-between items-center">
                            <button onClick={handleSwitchCamera} disabled={isLoading} className="p-3 rounded-full text-[color:var(--color-text)] hover:bg-white/10 disabled:opacity-50" title={t('switchCamera')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 10l-4-4-4 4m8 4l-4 4-4-4m-1-4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2z" transform="rotate(90 12 12) translate(0, 2)"/>
                                </svg>
                            </button>
                            <button onClick={handleCapture} disabled={isLoading || !!error} className="w-20 h-20 rounded-full bg-white border-4 border-gray-800 ring-2 ring-white disabled:opacity-50 active:scale-95 transition-transform" aria-label={t('capture')} />
                            <button onClick={handleUploadClick} disabled={isLoading} className="p-3 rounded-full text-[color:var(--color-text)] hover:bg-white/10 disabled:opacity-50" title={t('uploadPhoto')}>
                                <UploadIcon className="w-6 h-6" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default TextScannerModal;