import React, { ChangeEvent, KeyboardEvent, useRef, useEffect } from 'react';

interface TextAreaProps {
  id: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  isReadOnly?: boolean;
  onBlur?: () => void;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

const TextArea: React.FC<TextAreaProps> = ({ id, value, onChange, onKeyDown, placeholder, isReadOnly = false, onBlur, className, dir }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Temporarily hide scrollbar to prevent flash during resize
      textareaRef.current.style.overflow = 'hidden';
      // Reset height to recalculate scrollHeight
      textareaRef.current.style.height = 'auto';
      
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = window.innerHeight * 0.4; // Max height is 40vh

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
        dir={dir}
        className={`w-full h-full p-4 bg-transparent text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none resize-none ${className || ''}`}
      />
  );
};

export default TextArea;