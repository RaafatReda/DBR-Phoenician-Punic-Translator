import React, { useRef, useEffect, useCallback } from 'react';
import { PhoenicianDialect } from '../types';

interface ElementState {
  id: number;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface EditableTextProps {
  element: ElementState;
  onUpdate: (id: number, updates: Partial<ElementState>) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
  isExporting: boolean;
  dialect: PhoenicianDialect;
}

const EditableText: React.FC<EditableTextProps> = ({ element, onUpdate, isSelected, onSelect, isExporting, dialect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const interactionState = useRef<{
    type: 'move' | 'resize' | 'rotate' | null;
    startX: number;
    startY: number;
    startElementX: number;
    startElementY: number;
    startScale: number;
    startRotation: number;
    elementCenterX: number;
    elementCenterY: number;
  } | null>(null);

  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent, type: 'move' | 'resize' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id);

    const elementRect = ref.current!.getBoundingClientRect();
    const parentRect = ref.current!.parentElement!.getBoundingClientRect();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    interactionState.current = {
      type,
      startX: clientX,
      startY: clientY,
      startElementX: element.x,
      startElementY: element.y,
      startScale: element.scale,
      startRotation: element.rotation,
      elementCenterX: (elementRect.left - parentRect.left) + elementRect.width / 2,
      elementCenterY: (elementRect.top - parentRect.top) + elementRect.height / 2
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
  }, [element, onSelect]);

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!interactionState.current) return;
    
    const dx = clientX - interactionState.current.startX;
    const dy = clientY - interactionState.current.startY;
    
    switch (interactionState.current.type) {
      case 'move':
        onUpdate(element.id, {
          x: interactionState.current.startElementX + dx,
          y: interactionState.current.startElementY + dy
        });
        break;
      case 'resize':
        const initialDx = interactionState.current.startX - interactionState.current.elementCenterX;
        const initialDy = interactionState.current.startY - interactionState.current.elementCenterY;
        const initialDist = Math.sqrt(initialDx*initialDx + initialDy*initialDy);

        const currentDx = clientX - interactionState.current.elementCenterX;
        const currentDy = clientY - interactionState.current.elementCenterY;
        const currentDist = Math.sqrt(currentDx*currentDx + currentDy*currentDy);

        const newScale = Math.max(0.2, interactionState.current.startScale * (currentDist / initialDist));
        onUpdate(element.id, { scale: newScale });
        break;
      case 'rotate':
        const { elementCenterX, elementCenterY } = interactionState.current;
        const parentRect = ref.current!.parentElement!.getBoundingClientRect();
        const mouseX = clientX - parentRect.left;
        const mouseY = clientY - parentRect.top;
        const angleRad = Math.atan2(mouseY - elementCenterY, mouseX - elementCenterX);
        const angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to align handle
        onUpdate(element.id, { rotation: angleDeg });
        break;
    }
  }, [element.id, onUpdate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteractionMove(e.clientX, e.clientY);
  }, [handleInteractionMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteractionMove]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchend', handleMouseUp);
    interactionState.current = null;
  }, [handleMouseMove, handleTouchMove]);

  useEffect(() => {
    return () => { // Cleanup
      handleMouseUp();
    };
  }, [handleMouseUp]);


  const showControls = isSelected && !isExporting;
  const isPunic = dialect === PhoenicianDialect.PUNIC;
  const fontClass = isPunic ? '[font-family:var(--font-punic)]' : '[font-family:var(--font-phoenician)]';

  return (
    <div
      ref={ref}
      className="absolute select-none cursor-move"
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
        transformOrigin: 'center center',
        touchAction: 'none',
      }}
      onMouseDown={(e) => handleInteractionStart(e, 'move')}
      onTouchStart={(e) => handleInteractionStart(e, 'move')}
    >
      <div
        className={`inline-block p-2 transition-all duration-150 ${showControls ? 'border-2 border-dashed border-[color:var(--color-primary)]' : 'border-2 border-dashed border-transparent'}`}
      >
        <span className={`${fontClass} text-4xl text-[color:var(--color-text)] whitespace-nowrap`}>
          {element.text}
        </span>

        {showControls && (
          <>
            {/* Rotate Handle */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 flex items-start justify-center cursor-alias"
              onMouseDown={(e) => handleInteractionStart(e, 'rotate')}
              onTouchStart={(e) => handleInteractionStart(e, 'rotate')}
            >
              <div className="w-5 h-5 bg-[color:var(--color-secondary)] rounded-full" />
            </div>
            {/* Resize Handle */}
            <div
              className="absolute -bottom-5 -right-5 w-10 h-10 flex items-end justify-end p-1 cursor-se-resize"
              onMouseDown={(e) => handleInteractionStart(e, 'resize')}
              onTouchStart={(e) => handleInteractionStart(e, 'resize')}
            >
              <div className="w-5 h-5 bg-[color:var(--color-secondary)] rounded-sm" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(EditableText);