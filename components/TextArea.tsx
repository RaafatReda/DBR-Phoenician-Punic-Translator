import React, { ChangeEvent, ReactNode, KeyboardEvent, useRef, useEffect } from 'react';

interface TextAreaProps {
  id: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  isReadOnly?: boolean;
  children?: ReactNode;
  onBlur?: () => void;
  className?: string;
  iconPosition?: 'left' | 'right';
}

const TextArea: React.FC<TextAreaProps> = ({ id, value, onChange, onKeyDown, placeholder, isReadOnly = false, children, onBlur, className, iconPosition = 'right' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Temporarily hide scrollbar to prevent flash during resize
      textareaRef.current.style.overflow = 'hidden';
      // Reset height to recalculate scrollHeight
      textareaRef.current.style.height = 'auto';
      
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.5; // Max height is 50vh

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflow = 'auto'; // Show scrollbar if content exceeds max height
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflow = 'hidden';
      }
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={isReadOnly}
        onBlur={onBlur}
        rows={1}
        className={`w-full min-h-[10rem] max-h-[50vh] p-4 glass-panel rounded-[var(--border-radius)] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:shadow-[0_0_15px_var(--color-glow)] resize-none transition-height duration-200 ease-in-out ${className || ''}`}
      />
      {children && (
        <div className={`absolute top-3 ${iconPosition === 'left' ? 'left-3' : 'right-3'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default TextArea;