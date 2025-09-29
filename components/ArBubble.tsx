import React from 'react';
import { PhoenicianDialect, RecognizedObject } from '../types';
import { UILang } from '../lib/i18n';

// Base properties shared by all AR objects
interface ArObjectBase {
    id: string;
    name: string;
    phoenician: string;
    latin: string;
    arabicTransliteration: string;
    translation: string;
    pos: string;
}

// AR object with animation properties for live view
export interface LiveArObject extends ArObjectBase {
    currentX: number;
    currentY: number;
    opacity: number;
}

// Type for the object prop, can be a live animated object or a static one
export type ArBubbleObject = LiveArObject | (RecognizedObject & { id: string });

interface ArBubbleProps {
    obj: ArBubbleObject;
    isStatic: boolean;
    isExpanded: boolean;
    onClick: (id: string) => void;
    dialect: PhoenicianDialect;
    uiLang: UILang;
    t: (key: string) => string;
    showPhoenician: boolean;
    showTranslation: boolean;
    showTransliteration: boolean;
}

const ArBubble: React.FC<ArBubbleProps> = ({
    obj, isStatic, isExpanded, onClick, dialect, uiLang, t,
    showPhoenician, showTranslation, showTransliteration
}) => {
    const fontClass = dialect === PhoenicianDialect.PUNIC ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';

    let positionStyle: React.CSSProperties = {};
    if (isStatic) {
        const staticObj = obj as (RecognizedObject & {id: string});
        positionStyle = {
            left: `${(staticObj.box.x + staticObj.box.width / 2) * 100}%`,
            top: `${(staticObj.box.y + staticObj.box.height / 2) * 100}%`,
            transform: 'translate(-50%, -50%)',
            opacity: 1,
        };
    } else {
        const liveObj = obj as LiveArObject;
        positionStyle = {
            '--transform-gpu': `translate(-50%, -50%) translate(${liveObj.currentX.toFixed(2)}px, ${liveObj.currentY.toFixed(2)}px)`,
            transform: 'var(--transform-gpu)',
            opacity: liveObj.opacity,
            pointerEvents: liveObj.opacity > 0.5 ? 'auto' : 'none',
        };
    }
    
    // Don't render anything if it's invisible and not expanded
    if (positionStyle.opacity === 0 && !isExpanded) return null;

    // Don't render if all layers are off in compact mode
    if (!isExpanded && !showPhoenician && !showTranslation && !showTransliteration) return null;

    return (
        <div
            className={`ar-bubble ${isExpanded ? 'ar-bubble-expanded' : ''}`}
            style={{
                ...positionStyle,
                zIndex: isExpanded ? 100 : 50,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick(obj.id);
            }}
        >
            {!isExpanded ? (
                <>
                    {showPhoenician && <div className={`ar-bubble-phoenician ${fontClass}`}>{obj.phoenician}</div>}
                    {showTranslation && <div className="ar-bubble-translation" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>{obj.translation}</div>}
                    {showTransliteration && <div className="ar-bubble-pronunciation" dir="ltr">{uiLang === 'ar' ? obj.arabicTransliteration : obj.latin}</div>}
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

export default ArBubble;