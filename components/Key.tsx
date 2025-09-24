import React from 'react';

interface KeyProps {
  value: string;
  onClick: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  isPressed?: boolean;
}

const Key: React.FC<KeyProps> = ({ value, onClick, className = '', children, isPressed = false }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent focus shift from the main text area
    onClick(value);
  };

  const baseClasses = `h-10 sm:h-11 rounded-lg text-[color:var(--color-text)] font-semibold text-base sm:text-lg flex items-center justify-center
                  focus:outline-none focus:shadow-[0_0_10px_var(--color-glow)]
                  active:scale-95 transition-all duration-100 select-none shadow-[var(--shadow-sm)]`;
  
  const bgClasses = isPressed ? 'keyboard-btn-pressed' : 'keyboard-btn';

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`${baseClasses} ${bgClasses} ${className}`}
      aria-label={`Key ${value}`}
      style={{ minWidth: 0 }} // Critical for flex-shrink to work correctly
    >
      {children || value}
    </button>
  );
};

export default Key;